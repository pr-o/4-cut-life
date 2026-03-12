import { test, expect } from "@playwright/test";
import path from "path";

const photo1 = path.resolve("public/assets/images/photo_for_test_1.png");
const photo2 = path.resolve("public/assets/images/photo_for_test_2.png");

// Helper: reach /edit with 1×2 layout and both test photos uploaded
async function goToEdit(page: import("@playwright/test").Page) {
  await page.goto("/layout-select");
  await page.getByText("1×2").click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByText("Upload photos").click();
  await page.setInputFiles('input[type="file"]', [photo1, photo2]);
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page).toHaveURL("/edit");
}

test.describe("Snapshots", () => {
  test("landing page", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveScreenshot("landing.png", { fullPage: true });
  });

  test("layout select — unselected", async ({ page }) => {
    await page.goto("/layout-select");
    await expect(page).toHaveScreenshot("layout-select-empty.png", { fullPage: true });
  });

  test("layout select — with card selected", async ({ page }) => {
    await page.goto("/layout-select");
    await page.getByText("1×2").click();
    await expect(page).toHaveScreenshot("layout-select-selected.png", { fullPage: true });
  });

  test("mode select", async ({ page }) => {
    await page.goto("/layout-select");
    await page.getByText("1×2").click();
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page).toHaveScreenshot("mode-select.png", { fullPage: true });
  });

  test("upload page — empty placeholders", async ({ page }) => {
    await page.goto("/layout-select");
    await page.getByText("1×2").click();
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByText("Upload photos").click();
    await expect(page).toHaveScreenshot("upload-empty.png", { fullPage: true });
  });

  test("upload page — with photos", async ({ page }) => {
    await page.goto("/layout-select");
    await page.getByText("1×2").click();
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByText("Upload photos").click();
    await page.setInputFiles('input[type="file"]', [photo1, photo2]);
    await expect(page).toHaveScreenshot("upload-with-photos.png", { fullPage: true });
  });

  test("edit page — default state", async ({ page }) => {
    await goToEdit(page);
    // Wait for strip to fully render
    await expect(page.locator('img[alt="Photo 1"]').first()).toBeVisible();
    await expect(page).toHaveScreenshot("edit-default.png", { fullPage: true });
  });

  test("edit page — B&W filter applied", async ({ page }) => {
    await goToEdit(page);
    await expect(page.locator('img[alt="Photo 1"]').first()).toBeVisible();
    await page.getByRole("button", { name: /B&W/i }).click();
    await expect(page).toHaveScreenshot("edit-bw-filter.png", { fullPage: true });
  });

  test("edit page — all slots deselected", async ({ page }) => {
    await goToEdit(page);
    await page.getByRole("button", { name: /deselect all/i }).click();
    await expect(page).toHaveScreenshot("edit-deselected.png", { fullPage: true });
  });

  test("share confirmation dialog", async ({ page }) => {
    await goToEdit(page);
    await page.getByRole("button", { name: /^Share$/ }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page).toHaveScreenshot("share-confirm-dialog.png");
  });

  test("share page (/s/:id) — full end-to-end", async ({ page }) => {
    await goToEdit(page);

    // Trigger real upload
    await page.getByRole("button", { name: /^Share$/ }).click();
    await page.getByRole("button", { name: "Continue" }).click();

    // Wait for the result dialog — upload can take a few seconds
    const urlInput = page.locator('input[readonly]');
    await expect(urlInput).toBeVisible({ timeout: 15000 });

    // Extract the short URL
    const shareUrl = await urlInput.inputValue();
    expect(shareUrl).toMatch(/\/s\//);

    // Navigate to the share page
    await page.goto(shareUrl);

    // Wait for the image to load
    const stripImage = page.locator('img[alt="Photo strip"]');
    await expect(stripImage).toBeVisible({ timeout: 10000 });

    // Snapshot the share page
    await expect(page).toHaveScreenshot("share-page.png", { fullPage: true });
  });
});
