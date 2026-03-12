import { test, expect } from "@playwright/test";

test.describe("Layout selection", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/layout-select");
  });

  test("renders all 6 layout options", async ({ page }) => {
    const options = ["1×2", "1×3", "1×4", "2×2", "2×3", "2×4"];
    for (const label of options) {
      await expect(page.getByText(label)).toBeVisible();
    }
  });

  test("Continue button is disabled before selecting a layout", async ({ page }) => {
    await expect(page.getByRole("button", { name: "Continue" })).toBeDisabled();
  });

  test("Continue button enables after selecting a layout", async ({ page }) => {
    await page.getByText("1×4").click();
    await expect(page.getByRole("button", { name: "Continue" })).toBeEnabled();
  });

  test("selecting a layout and continuing navigates to /mode-select", async ({ page }) => {
    await page.getByText("2×2").click();
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page).toHaveURL("/mode-select");
  });

  test("GNB is visible", async ({ page }) => {
    await expect(page.getByRole("navigation")).toBeVisible();
  });
});
