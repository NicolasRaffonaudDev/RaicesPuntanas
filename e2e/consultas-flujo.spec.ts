import { expect, test } from "@playwright/test";

const adminCredentials = {
  email: "admin@raicespuntanas.local",
  password: "admin1234",
};

const login = async (page: import("@playwright/test").Page, email: string, password: string) => {
  await page.goto("/login");
  await page.getByPlaceholder("Email").fill(email);
  await page.getByPlaceholder("Contrasena").fill(password);
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL(/\/dashboard/);
};

test("flujo consulta con plantilla y respuesta visible al cliente", async ({ page, request }) => {
  const unique = Date.now();
  const userEmail = `e2e.usuario.${unique}@raicespuntanas.local`;
  const userPassword = "User12345!";
  const asunto = `Consulta E2E ${unique}`;

  const registerRes = await request.post("http://localhost:3001/api/auth/register", {
    data: {
      name: "Usuario E2E",
      email: userEmail,
      password: userPassword,
    },
  });
  expect(registerRes.ok()).toBeTruthy();
  const registerBody = await registerRes.json();
  const userToken: string = registerBody.accessToken || registerBody.token;

  const consultaRes = await request.post("http://localhost:3001/api/consultas", {
    headers: {
      Authorization: `Bearer ${userToken}`,
      "Content-Type": "application/json",
    },
    data: {
      asunto,
      mensaje: "Consulta generada por Playwright para validar seguimiento.",
    },
  });
  expect(consultaRes.status()).toBe(201);

  await login(page, adminCredentials.email, adminCredentials.password);
  await page.getByRole("link", { name: /Consultas/i }).first().click();
  await expect(page.getByRole("heading", { name: "Inbox de Consultas" })).toBeVisible();

  await page.getByPlaceholder("Buscar por asunto, mensaje o email...").fill(asunto);
  await page.getByRole("button", { name: "Gestionar" }).first().click();
  await page.getByRole("button", { name: "Recepcion de consulta" }).first().click();
  await page.getByRole("button", { name: "Guardar seguimiento" }).first().click();
  await expect(page.getByText("Seguimiento agregado")).toBeVisible();

  await page.getByRole("button", { name: "Cerrar sesion" }).click();
  await login(page, userEmail, userPassword);
  await page.getByRole("link", { name: "Mi panel" }).click();

  await expect(page.getByText("Respuestas del equipo")).toBeVisible();
  await expect(
    page.getByText("Gracias por tu consulta. Ya la registramos y nuestro equipo comercial te contactara"),
  ).toBeVisible();
});
