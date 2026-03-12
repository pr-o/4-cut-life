import { test, expect } from "@playwright/test";

// Zustand initialises layout = LAYOUTS[0] (not null) in every fresh browser session,
// so guards that check `!layout` never fire on a clean load.

test.describe("Navigation guards", () => {
  test("accessing /edit directly redirects to /mode-select", async ({ page }) => {
    // layout is set by default; capturedPhotos is empty → /mode-select
    await page.goto("/edit");
    await expect(page).toHaveURL("/mode-select");
  });

  test("accessing /capture directly redirects to /mode-select", async ({ page }) => {
    await page.goto("/capture");
    await expect(page).toHaveURL("/mode-select");
  });

  test("accessing /instructions directly redirects to /mode-select", async ({ page }) => {
    await page.goto("/instructions");
    await expect(page).toHaveURL("/mode-select");
  });

  test("accessing /upload directly redirects to /mode-select", async ({ page }) => {
    await page.goto("/upload");
    await expect(page).toHaveURL("/mode-select");
  });

  test("accessing /select directly redirects to /mode-select", async ({ page }) => {
    // layout set, shootingMode null, capturedPhotos empty → /capture,
    // then /capture guard (shootingMode !== "camera") → /mode-select
    await page.goto("/select");
    await expect(page).toHaveURL("/mode-select");
  });
});
