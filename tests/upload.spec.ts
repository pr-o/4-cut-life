import { test, expect } from "@playwright/test";
import path from "path";

const photo1 = path.resolve("public/assets/images/photo_for_test_1.png");
const photo2 = path.resolve("public/assets/images/photo_for_test_2.png");

test.describe("Upload flow", () => {
  async function goToUpload(page: import("@playwright/test").Page) {
    await page.goto("/layout-select");
    await page.getByText("1×2").click();
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByText("Upload photos").click();
    await expect(page).toHaveURL("/upload");
  }

  test("upload page shows required photo count hint", async ({ page }) => {
    await goToUpload(page);
    await expect(page.getByText(/2 photos/)).toBeVisible();
  });

  test("Continue button is hidden before uploading", async ({ page }) => {
    await goToUpload(page);
    await expect(page.getByRole("button", { name: "Continue" })).not.toBeVisible();
  });

  test("uploading fewer photos than slots shows an error", async ({ page }) => {
    await goToUpload(page);
    await page.setInputFiles('input[type="file"]', [photo1]);
    // Target the error paragraph specifically (not the hint text which also contains "2 photos")
    await expect(page.locator("p.text-destructive")).toBeVisible();
    await expect(page.getByRole("button", { name: "Continue" })).not.toBeVisible();
  });

  test("uploading enough photos shows thumbnails and enables Continue", async ({ page }) => {
    await goToUpload(page);
    await page.setInputFiles('input[type="file"]', [photo1, photo2]);
    await expect(page.getByRole("button", { name: "Continue" })).toBeVisible();
    await expect(page.locator('img[alt="Photo 1"]')).toBeVisible();
    await expect(page.locator('img[alt="Photo 2"]')).toBeVisible();
  });

  test("Continue after upload navigates to /edit", async ({ page }) => {
    await goToUpload(page);
    await page.setInputFiles('input[type="file"]', [photo1, photo2]);
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page).toHaveURL("/edit");
  });

  test("Go back button returns to /mode-select", async ({ page }) => {
    await goToUpload(page);
    await page.getByRole("button", { name: /go back/i }).click();
    await expect(page).toHaveURL("/mode-select");
  });
});
