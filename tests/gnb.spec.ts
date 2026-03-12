import { test, expect } from "@playwright/test";
import path from "path";

const photo1 = path.resolve("public/assets/images/photo_for_test_1.png");
const photo2 = path.resolve("public/assets/images/photo_for_test_2.png");

test.describe("GNB behaviour", () => {
  test("GNB is hidden on the landing page", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("navigation")).not.toBeVisible();
  });

  test("GNB is visible on /layout-select", async ({ page }) => {
    await page.goto("/layout-select");
    await expect(page.getByRole("navigation")).toBeVisible();
  });

  test("GNB shows the app name linking to /", async ({ page }) => {
    await page.goto("/layout-select");
    const homeLink = page.getByRole("navigation").getByRole("link");
    await expect(homeLink).toBeVisible();
    await homeLink.click();
    await expect(page).toHaveURL("/");
  });

  test("GNB on /edit contains Download, Share, Download GIF, Start again", async ({ page }) => {
    await page.goto("/layout-select");
    await page.getByText("1×2").click();
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByText("Upload photos").click();
    await page.setInputFiles('input[type="file"]', [photo1, photo2]);
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page).toHaveURL("/edit");

    // Portal buttons mount asynchronously — wait for the first one before asserting all
    await expect(page.getByRole("button", { name: /^Download$/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /^Share$/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /Download GIF/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Start again/i })).toBeVisible();
  });
});
