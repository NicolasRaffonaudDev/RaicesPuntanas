const DEFAULT_API_BASES = [
  process.env.CRM_SMOKE_API_BASE_URL,
  process.env.API_BASE_URL,
  "http://localhost:8080/api",
  "http://localhost:3000/api",
].filter(Boolean);
const ADMIN_EMAIL = process.env.CRM_SMOKE_ADMIN_EMAIL || "admin@raicespuntanas.local";
const ADMIN_PASSWORD = process.env.CRM_SMOKE_ADMIN_PASSWORD || "admin1234";

let apiBaseUrl = DEFAULT_API_BASES[0];

const pickReachableApiBase = async () => {
  for (const candidate of DEFAULT_API_BASES) {
    try {
      const normalizedCandidate = candidate.replace(/\/+$/, "");
      const healthUrl = new URL("/health", normalizedCandidate).toString();
      const response = await fetch(healthUrl);
      if (response.ok) {
        return normalizedCandidate;
      }
    } catch {
      // continuar con el siguiente candidato
    }
  }

  return DEFAULT_API_BASES[0].replace(/\/+$/, "");
};

const request = async (path, options = {}) => {
  const response = await fetch(`${apiBaseUrl}${path}`, options);
  const text = await response.text();
  let body = null;

  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = { raw: text };
    }
  }

  return { ok: response.ok, status: response.status, body };
};

const expectStatus = (label, response, expected) => {
  if (response.status !== expected) {
    throw new Error(`${label}: status ${response.status}, esperado ${expected}. Body: ${JSON.stringify(response.body)}`);
  }
  console.log(`OK ${label} (${response.status})`);
};

const authHeaders = (token) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
});

const getFirstLoteId = (body) => {
  if (Array.isArray(body)) return body[0]?.id;
  if (Array.isArray(body?.data)) return body.data[0]?.id;
  return undefined;
};

const run = async () => {
  apiBaseUrl = await pickReachableApiBase();
  console.log(`Iniciando smoke CRM en ${apiBaseUrl}`);

  const lotesRes = await request("/lotes?limit=1");
  expectStatus("listar lotes publicos", lotesRes, 200);
  const loteId = getFirstLoteId(lotesRes.body);
  if (!loteId) {
    throw new Error("No se encontro un lote para ejecutar el smoke CRM");
  }

  const createRes = await request("/consultas/public", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nombreContacto: "CRM Smoke",
      emailContacto: `crm-smoke-${Date.now()}@raicespuntanas.local`,
      telefonoContacto: "+54 9 266 4009999",
      mensaje: "Consulta automatica para validar el flujo CRM completo",
      loteId,
    }),
  });
  expectStatus("crear consulta publica", createRes, 201);

  const consultaId = createRes.body?.data?.id;
  if (!consultaId) {
    throw new Error("La consulta publica no devolvio id");
  }

  const loginRes = await request("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    }),
  });
  expectStatus("login admin", loginRes, 200);
  const token = loginRes.body?.accessToken || loginRes.body?.token;
  if (!token) {
    throw new Error("El login admin no devolvio access token");
  }

  const updateEstadoRes = await request(`/consultas/${consultaId}/estado`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify({ estado: "en_revision" }),
  });
  expectStatus("actualizar estado", updateEstadoRes, 200);

  const updatePrioridadRes = await request(`/consultas/${consultaId}/prioridad`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify({ prioridad: "alta" }),
  });
  expectStatus("actualizar prioridad", updatePrioridadRes, 200);

  const notaTexto = `Nota interna smoke ${Date.now()}`;
  const seguimientoRes = await request(`/consultas/${consultaId}/seguimientos`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({
      mensaje: notaTexto,
      esInterno: true,
    }),
  });
  expectStatus("agregar seguimiento interno", seguimientoRes, 201);

  const listRes = await request(`/consultas?q=${encodeURIComponent("CRM Smoke")}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  expectStatus("listar consultas", listRes, 200);

  const consultas = listRes.body?.data || [];
  const consulta = consultas.find((item) => item.id === consultaId);
  if (!consulta) {
    throw new Error("La consulta creada no aparecio en el listado final");
  }
  if (consulta.estado !== "en_revision") {
    throw new Error(`Estado final invalido: ${consulta.estado}`);
  }
  if (consulta.prioridad !== "alta") {
    throw new Error(`Prioridad final invalida: ${consulta.prioridad}`);
  }
  if (!Array.isArray(consulta.seguimientos) || !consulta.seguimientos.some((item) => item.mensaje === notaTexto && item.esInterno)) {
    throw new Error("No se encontro el seguimiento interno creado");
  }

  console.log(
    JSON.stringify(
      {
        consultaId,
        loteId,
        estado: consulta.estado,
        prioridad: consulta.prioridad,
        seguimientos: consulta.seguimientos.length,
      },
      null,
      2,
    ),
  );
  console.log("Smoke CRM completado.");
};

run().catch((error) => {
  console.error("Smoke CRM fallo:", error.message);
  process.exit(1);
});
