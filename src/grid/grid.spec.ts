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

test("fills the space after the last column with an inert filler column", async ({ page }) => {
    await page.goto("e2e/test.html?columns=2");

    const cellsArea = page.locator(".thegrid-area-cells");
    const filler = page.locator(".thegrid-area-cells .thegrid-cell-filler").first();
    const headerFiller = page.locator(".thegrid-area-columnheaders .thegrid-cell-filler");
    await expect(filler).toBeVisible();
    await expect(headerFiller).toHaveCount(1);

    // The two columns are 100px and 200px wide, and the filler takes the rest of the viewport
    const viewportWidth = await cellsArea.evaluate(element => element.clientWidth);
    const fillerBox = await filler.boundingBox();
    const cellsBox = await cellsArea.boundingBox();
    expect(fillerBox?.x).toBe(cellsBox!.x + 300);
    expect(fillerBox?.width).toBe(viewportWidth - 300);

    // Clicking the filler leaves the selection alone
    const firstCell = page.locator('.thegrid-area-cells .thegrid-cell[data-column="0"][data-row="0"]');
    await firstCell.click();
    await page.mouse.click(fillerBox!.x + fillerBox!.width / 2, fillerBox!.y + fillerBox!.height / 2);
    await expect(firstCell).toHaveClass(/selection-current/);
    await expect(page.locator(".thegrid-area-cells .selection")).toHaveCount(1);

    // Narrowing a column widens the filler
    const handle = page.locator(".thegrid-cell-column-header", { hasText: "Name" }).locator(".thegrid-column-resizer");
    const handleBox = (await handle.boundingBox())!;
    await page.mouse.move(handleBox.x + handleBox.width / 2, handleBox.y + handleBox.height / 2);
    await page.mouse.down();
    await page.mouse.move(handleBox.x + handleBox.width / 2 - 50, handleBox.y + handleBox.height / 2, { steps: 3 });
    await page.mouse.up();
    await expect.poll(async () => (await filler.boundingBox())?.width).toBe(viewportWidth - 250);
});
