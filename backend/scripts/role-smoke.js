require("dotenv").config();

const API_BASE = process.env.API_BASE_URL || "http://localhost:3001/api";
const ADMIN_EMAIL = process.env.SMOKE_ADMIN_EMAIL || "admin@raicespuntanas.local";
const ADMIN_PASSWORD = process.env.SMOKE_ADMIN_PASSWORD || "admin1234";
const TEST_PASSWORD = process.env.SMOKE_TEST_PASSWORD || "User12345!";

const request = async (path, options = {}) => {
  const response = await fetch(`${API_BASE}${path}`, options);
  const text = await response.text();
  let json = null;
  if (text) {
    try {
      json = JSON.parse(text);
    } catch {
      json = { raw: text };
    }
  }
  return { status: response.status, ok: response.ok, body: json };
};

const assertStatus = (label, actual, expected) => {
  if (actual !== expected) {
    throw new Error(`${label} -> status ${actual}, esperado ${expected}`);
  }
  console.log(`OK ${label} (${actual})`);
};

const authHeaders = (token) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
});

const login = async (email, password) => {
  const res = await request("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  assertStatus(`login ${email}`, res.status, 200);
  return res.body.accessToken || res.body.token;
};

const createUserByAdmin = async (token, role, suffix) => {
  const email = `${role}.${suffix}@raicespuntanas.local`;
  const res = await request("/users", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({
      name: `Smoke ${role}`,
      email,
      password: TEST_PASSWORD,
      role,
    }),
  });
  assertStatus(`crear usuario ${role}`, res.status, 201);
  return { email, id: res.body.data.id };
};

const run = async () => {
  console.log(`Iniciando smoke test de roles en ${API_BASE}`);
  const suffix = Date.now();

  const adminToken = await login(ADMIN_EMAIL, ADMIN_PASSWORD);

  const empleado = await createUserByAdmin(adminToken, "empleado", suffix);
  const usuario = await createUserByAdmin(adminToken, "usuario", suffix);

  const empleadoToken = await login(empleado.email, TEST_PASSWORD);
  const usuarioToken = await login(usuario.email, TEST_PASSWORD);

  const lotesRes = await request("/lotes");
  assertStatus("listar lotes publico", lotesRes.status, 200);
  const loteId = lotesRes.body?.[0]?.id;
  if (!loteId) throw new Error("No hay lotes disponibles para pruebas");

  const consultaRes = await request("/consultas", {
    method: "POST",
    headers: authHeaders(usuarioToken),
    body: JSON.stringify({
      loteId,
      asunto: "Consulta smoke",
      mensaje: "Mensaje de prueba de permisos",
    }),
  });
  assertStatus("usuario crea consulta", consultaRes.status, 201);
  const consultaId = consultaRes.body?.data?.id;
  if (!consultaId) throw new Error("No se recibio id de consulta");

  const usuarioListAll = await request("/consultas", {
    headers: authHeaders(usuarioToken),
  });
  assertStatus("usuario no lista consultas globales", usuarioListAll.status, 403);

  const empleadoListAll = await request("/consultas", {
    headers: authHeaders(empleadoToken),
  });
  assertStatus("empleado lista consultas globales", empleadoListAll.status, 200);

  const addFav = await request(`/favoritos/${loteId}`, {
    method: "POST",
    headers: authHeaders(usuarioToken),
  });
  assertStatus("usuario agrega favorito", addFav.status, 201);

  const listFav = await request("/favoritos", {
    headers: authHeaders(usuarioToken),
  });
  assertStatus("usuario lista favoritos", listFav.status, 200);

  const empleadoFav = await request(`/favoritos/${loteId}`, {
    method: "POST",
    headers: authHeaders(empleadoToken),
  });
  assertStatus("empleado no agrega favorito", empleadoFav.status, 403);

  const removeFav = await request(`/favoritos/${loteId}`, {
    method: "DELETE",
    headers: authHeaders(usuarioToken),
  });
  assertStatus("usuario elimina favorito", removeFav.status, 204);

  const updateConsulta = await request(`/consultas/${consultaId}/estado`, {
    method: "PATCH",
    headers: authHeaders(adminToken),
    body: JSON.stringify({ estado: "respondida" }),
  });
  assertStatus("admin actualiza estado consulta", updateConsulta.status, 200);

  console.log("Smoke test de roles completado.");
};

run().catch((error) => {
  console.error("Smoke test fallo:", error.message);
  process.exit(1);
});
