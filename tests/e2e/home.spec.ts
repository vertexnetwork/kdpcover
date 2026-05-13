import { test, expect } from "@playwright/test";

test.describe("home", () => {
  test("renders the calculator with the right H1 and live spine readout", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      /Pass KDP.s review on the first try/i,
    );
  });

  test('footer surfaces the Vertex Network link', async ({ page }) => {
    await page.goto("/");
    const link = page.getByRole("link", { name: /Part of the Vertex Network/i });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute("href", "/network");
  });
});

test.describe("network", () => {
  test("hides the current site and renders sister site cards", async ({ page }) => {
    await page.goto("/network");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Vertex Network");
    // The current site MUST be filtered out of /network.
    await expect(page.getByRole("heading", { level: 2, name: "KDP Cover Pro" })).toHaveCount(0);
    await expect(page.getByRole("heading", { level: 2 }).first()).toBeVisible();
  });
});

test.describe("legal pages", () => {
  test("contact lists the support email", async ({ page }) => {
    await page.goto("/contact");
    await expect(page.getByRole("link", { name: /hello@kdpcover.pro/i })).toBeVisible();
  });
});
