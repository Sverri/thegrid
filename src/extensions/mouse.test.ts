/** @vitest-environment happy-dom */

import { describe, expect, it, vi } from "vitest";
import { mouseExtension } from "./mouse";

function createGrid() {
    return {
        selection: {
            range: { x1: 1, y1: 1, x2: 1, y2: 1 },
            select: vi.fn(),
        },
        cellsElement: document.createElement("div"),
    };
}

function createCell(row: string, column: string) {
    const cell = document.createElement("div");
    cell.className = "thegrid-cell";
    cell.dataset["row"] = row;
    cell.dataset["column"] = column;
    return cell;
}

function dispatchMouseEvent(element: Element, type: string, options: MouseEventInit = {}) {
    element.dispatchEvent(new MouseEvent(type, { bubbles: true, ...options }));
}

describe("mouseExtension", () => {
    it("selects a cell on primary-button mousedown", () => {
        const grid = createGrid();
        const cell = createCell("4", "2");
        grid.cellsElement.append(cell);
        mouseExtension(grid as any);

        dispatchMouseEvent(cell, "mousedown", { button: 0 });

        expect(grid.selection.select).toHaveBeenCalledWith(2, 4);
    });

    it("accepts events from descendants of a cell", () => {
        const grid = createGrid();
        const cell = createCell("4", "2");
        const child = document.createElement("span");
        cell.append(child);
        grid.cellsElement.append(cell);
        mouseExtension(grid as any);

        dispatchMouseEvent(child, "mousedown", { button: 0 });

        expect(grid.selection.select).toHaveBeenCalledWith(2, 4);
    });

    it("ignores non-primary mousedown events", () => {
        const grid = createGrid();
        const cell = createCell("4", "2");
        grid.cellsElement.append(cell);
        mouseExtension(grid as any);

        dispatchMouseEvent(cell, "mousedown", { button: 2 });

        expect(grid.selection.select).not.toHaveBeenCalled();
    });

    it("ignores mousedown events without a cell target", () => {
        const grid = createGrid();
        mouseExtension(grid as any);

        dispatchMouseEvent(grid.cellsElement, "mousedown", { button: 0 });

        expect(grid.selection.select).not.toHaveBeenCalled();
    });

    it("ignores mousedown events from non-HTMLElement targets", () => {
        const grid = createGrid();
        const text = document.createTextNode("cell");
        grid.cellsElement.append(text);
        mouseExtension(grid as any);

        text.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, button: 0 }));

        expect(grid.selection.select).not.toHaveBeenCalled();
    });

    it("does not drag when the primary button is no longer held", () => {
        const grid = createGrid();
        const startCell = createCell("1", "1");
        const endCell = createCell("3", "2");
        grid.cellsElement.append(startCell, endCell);
        mouseExtension(grid as any);

        dispatchMouseEvent(startCell, "mousedown", { button: 0 });
        grid.selection.select.mockClear();
        dispatchMouseEvent(endCell, "mousemove", { button: 0, buttons: 0 });

        expect(grid.selection.select).not.toHaveBeenCalled();
    });

    it("updates the selection while the primary button is held", () => {
        const grid = createGrid();
        const startCell = createCell("1", "1");
        const endCell = createCell("3", "2");
        grid.cellsElement.append(startCell, endCell);
        mouseExtension(grid as any);

        dispatchMouseEvent(startCell, "mousedown", { button: 0 });
        grid.selection.select.mockClear();
        dispatchMouseEvent(endCell, "mousemove", { buttons: 1 });

        expect(grid.selection.select).toHaveBeenCalledWith(expect.objectContaining({ x1: 1, y1: 1, x2: 2, y2: 3 }));
    });

    it("does not reselect an unchanged drag range", () => {
        const grid = createGrid();
        const cell = createCell("1", "1");
        grid.cellsElement.append(cell);
        mouseExtension(grid as any);

        dispatchMouseEvent(cell, "mousedown", { button: 0 });
        grid.selection.select.mockClear();
        dispatchMouseEvent(cell, "mousemove", { buttons: 1 });

        expect(grid.selection.select).not.toHaveBeenCalled();
    });

    it("ignores drag events without a cell target", () => {
        const grid = createGrid();
        const cell = createCell("1", "1");
        grid.cellsElement.append(cell);
        mouseExtension(grid as any);

        dispatchMouseEvent(cell, "mousedown", { button: 0 });
        grid.selection.select.mockClear();
        dispatchMouseEvent(grid.cellsElement, "mousemove", { buttons: 1 });

        expect(grid.selection.select).not.toHaveBeenCalled();
    });

    it("uses the current selection anchor for Shift + drag", () => {
        const grid = createGrid();
        const cell = createCell("3", "2");
        grid.cellsElement.append(cell);
        mouseExtension(grid as any);

        dispatchMouseEvent(cell, "mousedown", { button: 0, shiftKey: true });
        dispatchMouseEvent(cell, "mousemove", { buttons: 1 });

        expect(grid.selection.select).toHaveBeenCalledWith(expect.objectContaining({ x1: 1, y1: 1, x2: 2, y2: 3 }));
    });

    it("finishes a selection on primary-button mouseup and clears the drag", () => {
        const grid = createGrid();
        const startCell = createCell("1", "1");
        const endCell = createCell("3", "2");
        grid.cellsElement.append(startCell, endCell);
        mouseExtension(grid as any);

        dispatchMouseEvent(startCell, "mousedown", { button: 0 });
        grid.selection.select.mockClear();
        dispatchMouseEvent(endCell, "mouseup", { button: 0 });
        expect(grid.selection.select).toHaveBeenCalledWith(1, 1, 2, 3);

        grid.selection.select.mockClear();
        dispatchMouseEvent(endCell, "mousemove", { buttons: 1 });
        expect(grid.selection.select).not.toHaveBeenCalled();
    });

    it("clears an active drag when the pointer leaves the cells element", () => {
        const grid = createGrid();
        const startCell = createCell("1", "1");
        const endCell = createCell("3", "2");
        grid.cellsElement.append(startCell, endCell);
        mouseExtension(grid as any);

        dispatchMouseEvent(startCell, "mousedown", { button: 0 });
        grid.selection.select.mockClear();
        grid.cellsElement.dispatchEvent(new MouseEvent("mouseleave"));
        dispatchMouseEvent(endCell, "mousemove", { buttons: 1 });

        expect(grid.selection.select).not.toHaveBeenCalled();
    });

    it("clears an active drag when the pointer enters the cells element", () => {
        const grid = createGrid();
        const startCell = createCell("1", "1");
        const endCell = createCell("3", "2");
        grid.cellsElement.append(startCell, endCell);
        mouseExtension(grid as any);

        dispatchMouseEvent(startCell, "mousedown", { button: 0 });
        grid.selection.select.mockClear();
        grid.cellsElement.dispatchEvent(new MouseEvent("mouseenter"));
        dispatchMouseEvent(endCell, "mousemove", { buttons: 1 });

        expect(grid.selection.select).not.toHaveBeenCalled();
    });

    it("ignores cells with invalid coordinates", () => {
        const grid = createGrid();
        const cell = createCell("not-a-row", "2");
        grid.cellsElement.append(cell);
        mouseExtension(grid as any);

        dispatchMouseEvent(cell, "mousedown", { button: 0 });

        expect(grid.selection.select).not.toHaveBeenCalled();
    });

    it("ignores cells with an invalid column", () => {
        const grid = createGrid();
        const cell = createCell("4", "not-a-column");
        grid.cellsElement.append(cell);
        mouseExtension(grid as any);

        dispatchMouseEvent(cell, "mousedown", { button: 0 });

        expect(grid.selection.select).not.toHaveBeenCalled();
    });

    it("ignores cells without coordinate attributes", () => {
        const grid = createGrid();
        const cell = document.createElement("div");
        cell.className = "thegrid-cell";
        grid.cellsElement.append(cell);
        mouseExtension(grid as any);

        dispatchMouseEvent(cell, "mousedown", { button: 0 });

        expect(grid.selection.select).not.toHaveBeenCalled();
    });

    it("selects the mouseup cell when no drag was started", () => {
        const grid = createGrid();
        const cell = createCell("4", "2");
        grid.cellsElement.append(cell);
        mouseExtension(grid as any);

        dispatchMouseEvent(cell, "mouseup", { button: 0 });

        expect(grid.selection.select).toHaveBeenCalledWith(2, 4, 2, 4);
    });

    it("ignores non-primary mouseup events", () => {
        const grid = createGrid();
        const cell = createCell("4", "2");
        grid.cellsElement.append(cell);
        mouseExtension(grid as any);

        dispatchMouseEvent(cell, "mouseup", { button: 2 });

        expect(grid.selection.select).not.toHaveBeenCalled();
    });

    it("ignores mouseup events without a cell target", () => {
        const grid = createGrid();
        mouseExtension(grid as any);

        dispatchMouseEvent(grid.cellsElement, "mouseup", { button: 0 });

        expect(grid.selection.select).not.toHaveBeenCalled();
    });
});
