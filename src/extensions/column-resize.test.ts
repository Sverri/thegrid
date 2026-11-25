/** @vitest-environment happy-dom */

import { describe, expect, it, vi } from "vitest";
import { columnResizeExtension } from "./column-resize";
import { createColumn } from "@grid/column";

function createGrid() {
    const column = createColumn({ binding: "name", width: 100, minWidth: 50, maxWidth: 200 });
    const columnHeadersElement = document.createElement("div");
    const hostElement = document.createElement("div");
    hostElement.append(columnHeadersElement);

    const cell = document.createElement("div");
    cell.className = "thegrid-cell";
    cell.dataset["column"] = "0";
    cell.dataset["row"] = "0";
    const handle = document.createElement("div");
    handle.className = "thegrid-column-resizer";
    cell.append(handle);
    columnHeadersElement.append(cell);

    const grid = {
        hostElement,
        columnHeadersElement,
        columns: { items: [column] },
        invalidate: vi.fn(),
    };
    return { grid, column, cell, handle };
}

function dispatchPointerEvent(element: Element, type: string, options: PointerEventInit = {}) {
    element.dispatchEvent(new PointerEvent(type, { bubbles: true, pointerId: 1, ...options }));
}

describe("columnResizeExtension", () => {
    it("resizes a column by dragging its handle", () => {
        const { grid, column, handle } = createGrid();
        columnResizeExtension(grid as any);

        dispatchPointerEvent(handle, "pointerdown", { button: 0, clientX: 100 });
        dispatchPointerEvent(grid.columnHeadersElement, "pointermove", { clientX: 130 });

        expect(column.width).toBe(130);
        expect(grid.invalidate).toHaveBeenCalledWith(true);
    });

    it("measures from the starting position for every move", () => {
        const { grid, column, handle } = createGrid();
        columnResizeExtension(grid as any);

        dispatchPointerEvent(handle, "pointerdown", { button: 0, clientX: 100 });
        dispatchPointerEvent(grid.columnHeadersElement, "pointermove", { clientX: 150 });
        dispatchPointerEvent(grid.columnHeadersElement, "pointermove", { clientX: 80 });

        expect(column.width).toBe(80);
    });

    it("respects the column's minimum and maximum width", () => {
        const { grid, column, handle } = createGrid();
        columnResizeExtension(grid as any);

        dispatchPointerEvent(handle, "pointerdown", { button: 0, clientX: 100 });
        dispatchPointerEvent(grid.columnHeadersElement, "pointermove", { clientX: -500 });
        expect(column.width).toBe(50);

        dispatchPointerEvent(grid.columnHeadersElement, "pointermove", { clientX: 1000 });
        expect(column.width).toBe(200);
    });

    it("does not re-render when the clamped width is unchanged", () => {
        const { grid, handle } = createGrid();
        columnResizeExtension(grid as any);

        dispatchPointerEvent(handle, "pointerdown", { button: 0, clientX: 100 });
        dispatchPointerEvent(grid.columnHeadersElement, "pointermove", { clientX: 1000 });
        grid.invalidate.mockClear();
        dispatchPointerEvent(grid.columnHeadersElement, "pointermove", { clientX: 1100 });

        expect(grid.invalidate).not.toHaveBeenCalled();
    });

    it("marks the host element while resizing", () => {
        const { grid, handle } = createGrid();
        columnResizeExtension(grid as any);

        dispatchPointerEvent(handle, "pointerdown", { button: 0, clientX: 100 });
        expect(grid.hostElement.classList.contains("thegrid-resizing-column")).toBe(true);

        dispatchPointerEvent(grid.columnHeadersElement, "pointerup", { clientX: 100 });
        expect(grid.hostElement.classList.contains("thegrid-resizing-column")).toBe(false);
    });

    it.each(["pointerup", "pointercancel", "lostpointercapture"])("stops resizing on %s", type => {
        const { grid, column, handle } = createGrid();
        columnResizeExtension(grid as any);

        dispatchPointerEvent(handle, "pointerdown", { button: 0, clientX: 100 });
        dispatchPointerEvent(grid.columnHeadersElement, type);
        dispatchPointerEvent(grid.columnHeadersElement, "pointermove", { clientX: 150 });

        expect(column.width).toBe(100);
    });

    it("ignores moves from other pointers", () => {
        const { grid, column, handle } = createGrid();
        columnResizeExtension(grid as any);

        dispatchPointerEvent(handle, "pointerdown", { button: 0, clientX: 100 });
        dispatchPointerEvent(grid.columnHeadersElement, "pointermove", { pointerId: 2, clientX: 150 });

        expect(column.width).toBe(100);
    });

    it("ignores pointerdown outside a handle", () => {
        const { grid, column, cell } = createGrid();
        columnResizeExtension(grid as any);

        dispatchPointerEvent(cell, "pointerdown", { button: 0, clientX: 100 });
        dispatchPointerEvent(grid.columnHeadersElement, "pointermove", { clientX: 150 });

        expect(column.width).toBe(100);
    });

    it("ignores non-primary buttons", () => {
        const { grid, column, handle } = createGrid();
        columnResizeExtension(grid as any);

        dispatchPointerEvent(handle, "pointerdown", { button: 2, clientX: 100 });
        dispatchPointerEvent(grid.columnHeadersElement, "pointermove", { clientX: 150 });

        expect(column.width).toBe(100);
    });

    it("ignores handles of unknown columns", () => {
        const { grid, column, cell, handle } = createGrid();
        cell.dataset["column"] = "5";
        columnResizeExtension(grid as any);

        dispatchPointerEvent(handle, "pointerdown", { button: 0, clientX: 100 });
        dispatchPointerEvent(grid.columnHeadersElement, "pointermove", { clientX: 150 });

        expect(column.width).toBe(100);
        expect(grid.hostElement.classList.contains("thegrid-resizing-column")).toBe(false);
    });

    it("removes its listeners and ends an active resize when disposed", () => {
        const { grid, column, handle } = createGrid();
        const dispose = columnResizeExtension(grid as any);

        dispatchPointerEvent(handle, "pointerdown", { button: 0, clientX: 100 });
        dispose();
        dispatchPointerEvent(grid.columnHeadersElement, "pointermove", { clientX: 150 });

        expect(column.width).toBe(100);
        expect(grid.hostElement.classList.contains("thegrid-resizing-column")).toBe(false);
    });
});
