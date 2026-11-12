/** @vitest-environment happy-dom */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DataType, Headers } from "@shared/enums";
import { createPoint } from "@structure/point";
import { createGrid, type GridOptions } from "./grid";

class MockResizeObserver {
    observe = vi.fn();

    constructor(_callback: ResizeObserverCallback) {}
}

type Row = {
    name: string;
    amount: number;
};

function createTestGrid(options: GridOptions<Row> = {}) {
    const host = document.createElement("div");
    const grid = createGrid<Row>(host, {
        data: [
            { name: "Ada", amount: 12.5 },
            { name: "Grace", amount: 7 },
        ],
        columns: [
            { binding: "name", header: "Name", width: 100 },
            { binding: "amount", header: "Amount", dataType: DataType.Decimal, width: 80 },
        ],
        ...options,
    });

    Object.defineProperties(grid.cellsElement, {
        clientWidth: { configurable: true, value: 180 },
        clientHeight: { configurable: true, value: 100 },
    });
    grid.cellsElement.scrollTo = vi.fn();
    return { host, grid };
}

describe("Grid", () => {
    beforeEach(() => {
        vi.stubGlobal("ResizeObserver", MockResizeObserver);
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    it("renders cells and both headers", () => {
        const { host, grid } = createTestGrid();

        grid.invalidate(true);
        grid.cellsElement.dispatchEvent(new Event("scroll"));

        expect(host.classList.contains("thegrid-hide-column-headers")).toBe(false);
        expect(host.classList.contains("thegrid-hide-row-headers")).toBe(false);
        expect(grid.columnHeadersElement.textContent).toContain("Name");
        expect(grid.columnHeadersElement.textContent).toContain("Amount");
        expect(grid.rowHeadersElement.children.length).toBeGreaterThan(0);
        expect(grid.cellsElement.textContent).toContain("Ada");
        expect(grid.cellsElement.textContent).toContain("12.50");
    });

    it("honors header visibility and selection settings", () => {
        const { host, grid } = createTestGrid({
            showHeaders: Headers.Columns,
            showHeaderSelection: Headers.Columns,
        });

        grid.selection.select(0, 0, 1, 0);
        grid.invalidate(true);

        expect(host.classList.contains("thegrid-hide-column-headers")).toBe(false);
        expect(host.classList.contains("thegrid-hide-row-headers")).toBe(true);
        expect(grid.columnHeadersElement.querySelectorAll(".column-selected")).toHaveLength(2);
        expect(grid.rowHeadersElement.children).toHaveLength(0);

        grid.showHeaders = Headers.Rows;
        grid.showHeaderSelection = Headers.Rows;
        grid.invalidate(true);
        expect(host.classList.contains("thegrid-hide-column-headers")).toBe(true);
        expect(host.classList.contains("thegrid-hide-row-headers")).toBe(false);
        expect(grid.rowHeadersElement.querySelector(".row-selected")).not.toBeNull();
    });

    it("renders no row headers when there are no columns", () => {
        const { grid } = createTestGrid({ columns: [] });

        grid.invalidate(true);

        expect(grid.cellsElement.children).toHaveLength(0);
        expect(grid.rowHeadersElement.children).toHaveLength(0);
    });

    it("calls cell formatters and exposes cell data", () => {
        const { grid } = createTestGrid({
            columns: [{ binding: "name" }],
        });

        grid.invalidate(true);

        expect(grid.getCellData(0, 0)).toBe("Ada");
        expect(grid.getCellData(10, 0)).toBeUndefined();
        expect(grid.getCellData(0, 10)).toBeUndefined();
    });

    it("re-applies visibility and re-renders when a column changes", async () => {
        const { grid } = createTestGrid();
        grid.invalidate(true);
        const onInvalidate = vi.fn();
        grid.onInvalidate.subscribe(onInvalidate);

        grid.columns.items[0]!.visible = false;
        await vi.waitFor(() => expect(onInvalidate).toHaveBeenCalled());

        expect(grid.columns.items.map(c => c.binding)).toEqual(["amount"]);
        expect(grid.columnHeadersElement.textContent).not.toContain("Name");
    });

    it("keeps the same Column instance when the column view is rebuilt", () => {
        const { grid } = createTestGrid();
        const column = grid.columns.items[1]!;
        column.width = 150;

        grid.columns.refresh();

        expect(grid.columns.items[1]).toBe(column);
        expect(grid.columns.items[1]!.width).toBe(150);
    });

    it("does not write to readonly columns", () => {
        const { grid } = createTestGrid({
            columns: [{ binding: "name", readonly: true }],
        });

        expect(grid.setCellData(0, 0, "Elizabeth")).toBe(false);
        expect(grid.getCellData(0, 0)).toBe("Ada");
    });

    it("re-sorts the data after a cell is written", () => {
        const { grid } = createTestGrid({ columns: [{ binding: "name" }] });
        grid.data.sorter = (a, b) => a.name.localeCompare(b.name);
        expect(grid.getCellData(0, 0)).toBe("Ada");

        expect(grid.setCellData(0, 0, "Zelda")).toBe(true);

        expect(grid.getCellData(0, 0)).toBe("Grace");
        expect(grid.getCellData(0, 1)).toBe("Zelda");
    });

    it("updates cell data and supports both scrollIntoView overloads", () => {
        const { grid } = createTestGrid({ cellSize: 20 });
        const scrollTo = grid.cellsElement.scrollTo as ReturnType<typeof vi.fn>;
        const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

        grid.setCellData(0, 0, "Elizabeth");
        grid.setCellData(10, 0, "ignored");
        grid.setCellData(0, 10, "ignored");
        expect(grid.getCellData(0, 0)).toBe("Elizabeth");

        grid.scrollIntoView(createPoint(1, 3));
        grid.scrollIntoView(createPoint(0, 0));
        grid.scrollIntoView(createPoint(10, 0));

        expect(scrollTo).toHaveBeenCalledWith({ left: 0, top: 0, behavior: "instant" });
        expect(scrollTo).toHaveBeenCalledTimes(2);
        expect(warn).toHaveBeenCalledWith("Was unable to scroll into view: [10,0] (column does not exist)");
    });

    it("adjusts scrolling when the target is outside the viewport", () => {
        const { grid } = createTestGrid({ cellSize: 20 });
        const scrollTo = grid.cellsElement.scrollTo as ReturnType<typeof vi.fn>;

        Object.defineProperties(grid.cellsElement, {
            scrollLeft: { configurable: true, value: 90 },
            scrollTop: { configurable: true, value: 30 },
            clientWidth: { configurable: true, value: 50 },
            clientHeight: { configurable: true, value: 30 },
        });

        grid.scrollIntoView(createPoint(0, 0));
        expect(scrollTo).toHaveBeenCalledWith({ left: 0, top: 0, behavior: "instant" });

        scrollTo.mockClear();
        grid.scrollIntoView(createPoint(1, 5));
        expect(scrollTo).toHaveBeenCalledWith({ left: 130, top: 90, behavior: "instant" });
    });

    it("invalidates when data and columns change", () => {
        vi.useFakeTimers();
        const { grid } = createTestGrid();
        grid.data.items;
        grid.columns.items;

        grid.data.source = [{ name: "Katherine", amount: 3 }];
        grid.columns.source = [{ binding: "name" }];
        vi.advanceTimersByTime(32);

        expect(grid.data.items).toHaveLength(1);
        expect(grid.columns.items).toHaveLength(1);
        vi.useRealTimers();
    });

    it("refreshes rendered selection and removes stale selection classes", () => {
        vi.useFakeTimers();
        const { grid } = createTestGrid();
        grid.invalidate(true);

        const firstCell = grid.cellsElement.querySelector<HTMLElement>('[data-column="0"][data-row="0"]');
        expect(firstCell).not.toBeNull();
        firstCell?.classList.add("selection", "selection-right-border", "selection-bottom-border", "selection-current");
        grid.cellsElement.querySelector('[data-column="1"][data-row="0"]')?.remove();

        grid.selection.select(0, 0, 1, 0);
        vi.advanceTimersByTime(16);

        expect(firstCell?.classList.contains("selection-current")).toBe(false);
        expect(grid.columnHeadersElement.querySelectorAll(".column-selected")).toHaveLength(2);
        vi.useRealTimers();
    });

    it("accepts locale objects and updates mutable grid settings", () => {
        const { host, grid } = createTestGrid({ locale: new Intl.Locale("de-DE"), cellSize: 30 });

        grid.showHeaders = Headers.Both;
        grid.showHeaderSelection = Headers.Both;
        grid.cellSize = 40;
        grid.invalidate(true);

        expect(grid.locale.baseName).toBe("de-DE");
        expect(grid.cellSize).toBe(40);
        expect(host.style.getPropertyValue("--cell-size")).toBe("40px");
    });
});
