import { expect, test } from "@playwright/test";

test("renders the isolated grid test page", async ({ page }) => {
    await page.goto("e2e/test.html");

    await expect(page.locator(".thegrid")).toBeVisible();
    await expect(page.locator(".thegrid-cell").first()).toBeVisible();
    await expect(page.locator(".thegrid-cell-row-header").first()).toBeVisible();
    await expect(page.locator(".thegrid-cell-column-header").allTextContents()).resolves.toEqual([
        "Id",
        "Name",
        "Age",
        "Date of birth",
        "Salary",
        "Email address",
        "Website",
    ]);
});
