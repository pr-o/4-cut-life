import { test, expect } from "@playwright/test";

// Helper: navigate to mode-select with a layout already set
async function goToModeSelect(page: import("@playwright/test").Page) {
  await page.goto("/layout-select");
  await page.getByText("1×4").click();
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page).toHaveURL("/mode-select");
}

test.describe("Mode selection", () => {
  test("shows Take photos and Upload photos options", async ({ page }) => {
    await goToModeSelect(page);
    await expect(page.getByText("Take photos")).toBeVisible();
    await expect(page.getByText("Upload photos")).toBeVisible();
  });

  test("clicking Upload photos navigates to /upload", async ({ page }) => {
    await goToModeSelect(page);
    await page.getByText("Upload photos").click();
    await expect(page).toHaveURL("/upload");
  });

  test("clicking Take photos navigates to /instructions", async ({ page }) => {
    await goToModeSelect(page);
    await page.getByText("Take photos").click();
    await expect(page).toHaveURL("/instructions");
  });

  test("Go back button returns to /layout-select", async ({ page }) => {
    await goToModeSelect(page);
    await page.getByRole("button", { name: /go back/i }).click();
    await expect(page).toHaveURL("/layout-select");
  });
});
