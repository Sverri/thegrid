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

test("resizes a column by dragging the edge of its header, within its min and max width", async ({ page }) => {
    await page.goto("e2e/test.html");

    const header = page.locator(".thegrid-cell-column-header", { hasText: "Age" });
    const ageCell = page.locator('.thegrid-area-cells .thegrid-cell[data-column="2"][data-row="0"]');
    const handle = header.locator(".thegrid-column-resizer");
    const box = await handle.boundingBox();
    if (!box) {
        throw new Error("The resize handle is not visible");
    }
    const x = box.x + box.width / 2;
    const y = box.y + box.height / 2;

    const width = async () => (await header.boundingBox())?.width;

    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x + 30, y, { steps: 3 });
    await expect.poll(width).toBe(130);
    await expect.poll(async () => (await ageCell.boundingBox())?.width).toBe(130);

    await page.mouse.move(x + 500, y, { steps: 3 });
    await expect.poll(width).toBe(160);

    await page.mouse.move(x - 500, y, { steps: 3 });
    await expect.poll(width).toBe(60);
    await page.mouse.up();

    await expect(page.locator(".thegrid")).not.toHaveClass(/thegrid-resizing-column/);
});
