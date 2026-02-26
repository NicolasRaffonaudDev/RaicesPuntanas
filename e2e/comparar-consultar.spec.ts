import { expect, test } from "@playwright/test";

test("comparar lotes y navegar a consulta precompletada", async ({ page }) => {
  await page.goto("/lotes");
  await expect(page.getByRole("heading", { name: "Lotes Disponibles" })).toBeVisible();

  const toggles = page.locator('[data-testid^="compare-toggle-"]');
  await expect(toggles.first()).toBeVisible();
  await toggles.nth(0).click();
  await toggles.nth(1).click();

  await page.getByTestId("compare-button").click();
  await expect(page).toHaveURL(/\/comparar\?ids=/);
  await expect(page.getByRole("heading", { name: "Comparador de Lotes" })).toBeVisible();

  await page.locator('[data-testid^="compare-consult-"]').first().click();
  await expect(page).toHaveURL(/\/contact\?/);
  await expect(page.getByPlaceholder("Asunto")).not.toHaveValue("");
});
