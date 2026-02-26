import { expect, test } from "@playwright/test";

test("lotes permite ordenar por precio y muestra CTA de mapa", async ({ page }) => {
  await page.goto("/lotes");

  await expect(page.getByRole("heading", { name: "Lotes Disponibles" })).toBeVisible();
  await page.selectOption("#orden-lotes", "precio_asc");

  const cards = page.locator('[data-testid^="lote-card-"]');
  await expect(cards.first()).toBeVisible();
  const count = await cards.count();
  expect(count).toBeGreaterThan(1);

  const firstPrice = Number(await cards.nth(0).getAttribute("data-price"));
  const secondPrice = Number(await cards.nth(1).getAttribute("data-price"));
  expect(firstPrice).toBeLessThanOrEqual(secondPrice);

  const firstImage = cards.nth(0).locator("img").first();
  await expect(firstImage).toBeVisible();
  const loadingAttr = await firstImage.getAttribute("loading");
  expect(["eager", "lazy"]).toContain(loadingAttr);

  await expect(page.locator('[data-testid^="open-maps-"]').first()).toBeVisible();
});
