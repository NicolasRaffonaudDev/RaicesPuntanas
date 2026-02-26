import { expect, test } from "@playwright/test";

test("navegacion principal carga rutas lazy sin errores", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: "Lotes" })).toBeVisible();

  await page.getByRole("link", { name: "Lotes" }).hover();
  await page.getByRole("link", { name: "Lotes" }).click();
  await expect(page).toHaveURL("/lotes");
  await expect(page.getByRole("heading", { name: "Lotes Disponibles" })).toBeVisible();

  await page.getByRole("link", { name: "Contacto" }).hover();
  await page.getByRole("link", { name: "Contacto" }).click();
  await expect(page).toHaveURL(/\/contact/);
  await expect(page.getByRole("heading", { name: "Contacto" })).toBeVisible();
});
