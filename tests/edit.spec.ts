import { test, expect } from "@playwright/test";
import path from "path";

const photo1 = path.resolve("public/assets/images/photo_for_test_1.png");
const photo2 = path.resolve("public/assets/images/photo_for_test_2.png");

async function goToEdit(page: import("@playwright/test").Page) {
  await page.goto("/layout-select");
  await page.getByText("1×2").click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByText("Upload photos").click();
  await page.setInputFiles('input[type="file"]', [photo1, photo2]);
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page).toHaveURL("/edit");
}

test.describe("Edit page controls", () => {
  test("photo strip is rendered with uploaded photos", async ({ page }) => {
    await goToEdit(page);
    await expect(page.locator('img[alt="Photo 1"]').first()).toBeVisible();
    await expect(page.locator('img[alt="Photo 2"]').first()).toBeVisible();
  });

  test("thumbnail rail shows uploaded photos", async ({ page }) => {
    await goToEdit(page);
    // Rail contains: 1 Deselect-all button + 2 photo thumbnails = 3 buttons
    const deselectBtn = page.getByRole("button", { name: /deselect all/i });
    await expect(deselectBtn).toBeVisible();
    // .last() gives the innermost div containing the deselect button (the rail itself)
    const rail = page.locator("div", { has: deselectBtn }).last();
    await expect(rail.getByRole("button")).toHaveCount(3);
  });

  test("Deselect all button is enabled when photos are selected", async ({ page }) => {
    await goToEdit(page);
    await expect(page.getByRole("button", { name: /deselect all/i })).toBeEnabled();
  });

  test("Deselect all clears the strip and disables the button", async ({ page }) => {
    await goToEdit(page);
    await page.getByRole("button", { name: /deselect all/i }).click();
    await expect(page.getByRole("button", { name: /deselect all/i })).toBeDisabled();
  });

  test("deselecting and re-selecting a photo re-enables Deselect all", async ({ page }) => {
    await goToEdit(page);
    await page.getByRole("button", { name: /deselect all/i }).click();
    // Click the first thumbnail button in the rail (not the deselect-all button)
    const deselectBtn = page.getByRole("button", { name: /deselect all/i });
    const rail = page.locator("div", { has: deselectBtn }).last();
    // nth(1) skips the Deselect all button (index 0) and gets the first thumbnail
    await rail.getByRole("button").nth(1).click();
    await expect(page.getByRole("button", { name: /deselect all/i })).toBeEnabled();
  });

  test("Reset to defaults button is visible", async ({ page }) => {
    await goToEdit(page);
    await expect(page.getByRole("button", { name: /reset to defaults/i })).toBeVisible();
  });

  test("Start again resets and returns to /layout-select", async ({ page }) => {
    await goToEdit(page);
    await page.getByRole("button", { name: /start again/i }).click();
    await expect(page).toHaveURL("/layout-select");
  });

  test("filter buttons are visible", async ({ page }) => {
    await goToEdit(page);
    await expect(page.getByRole("button", { name: /B&W/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Sepia/i })).toBeVisible();
  });

  test("clicking a filter activates it", async ({ page }) => {
    await goToEdit(page);
    const bwButton = page.getByRole("button", { name: /B&W/i });
    await bwButton.click();
    await expect(bwButton).toHaveClass(/bg-primary/);
  });

  test("clicking an active filter deactivates it", async ({ page }) => {
    await goToEdit(page);
    const bwButton = page.getByRole("button", { name: /B&W/i });
    await bwButton.click();
    // bg-primary/5 is only present on the active filter button
    await expect(bwButton).toHaveClass(/bg-primary/);
    await bwButton.click();
    await expect(bwButton).not.toHaveClass(/bg-primary/);
  });
});
