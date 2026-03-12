import { test, expect } from "@playwright/test";

test.describe("Landing page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("shows app title", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /4-Cut Life/i })).toBeVisible();
  });

  test("shows example strips", async ({ page }) => {
    // Four example strip containers are rendered
    const strips = page.locator("main > div > div");
    await expect(strips).toHaveCount(4);
  });

  test("shows Start button", async ({ page }) => {
    await expect(page.getByRole("link", { name: "Start" })).toBeVisible();
  });

  test("Start button navigates to /layout-select", async ({ page }) => {
    await page.getByRole("link", { name: "Start" }).click();
    await expect(page).toHaveURL("/layout-select");
  });

  test("GNB is not visible on landing page", async ({ page }) => {
    await expect(page.getByRole("navigation")).not.toBeVisible();
  });
});
