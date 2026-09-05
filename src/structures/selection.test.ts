/** @vitest-environment happy-dom */

import { describe, expect, it, vi } from "vitest";
import { createGrid } from "@grid/grid";
import { createRange } from "./range";
import { createSelection } from "./selection";

describe("Selection", () => {
    function createTestGrid() {
        const host = document.createElement("div");
        return createGrid(host, {
            data: [
                { id: 1, name: "A" },
                { id: 2, name: "B" },
                { id: 3, name: "C" },
            ],
            columns: [{ binding: "id" }, { binding: "name" }, { binding: "id" }],
        });
    }

    it("selects using a range instance", () => {
        const grid = createTestGrid();
        const selection = createSelection(grid);

        selection.select(createRange(1, 2, 2, 2));

        expect(selection.range).toEqual(createRange(1, 2, 2, 2));
    });

    it("selects using coordinate overloads", () => {
        const grid = createTestGrid();
        const selection = createSelection(grid);

        selection.select(2, 1, 0, 2);

        expect(selection.range.x1).toBe(2);
        expect(selection.range.y1).toBe(1);
        expect(selection.range.x2).toBe(0);
        expect(selection.range.y2).toBe(2);
        expect(selection.range.left).toBe(0);
        expect(selection.range.top).toBe(1);
        expect(selection.range.right).toBe(2);
        expect(selection.range.bottom).toBe(2);
    });

    it("moves the anchor within the valid grid bounds", () => {
        const grid = createTestGrid();
        const selection = createSelection(grid);

        selection.select(1, 1);
        selection.moveSelectionLeft(2);
        expect(selection.range.x2).toBe(0);

        selection.moveSelectionRight(2);
        expect(selection.range.x2).toBe(2);

        selection.moveSelectionUp(2);
        expect(selection.range.y2).toBe(0);

        selection.moveSelectionDown(2);
        expect(selection.range.y2).toBe(2);
    });

    it("expands a selection while keeping the anchor fixed", () => {
        const grid = createTestGrid();
        const selection = createSelection(grid);

        selection.select(1, 1, 1, 1);
        selection.expandSelectionLeft(2);
        expect(selection.range.x1).toBe(1);
        expect(selection.range.x2).toBe(0);
        expect(selection.range.y1).toBe(1);
        expect(selection.range.y2).toBe(1);

        selection.expandSelectionRight(2);
        expect(selection.range.x2).toBe(2);

        selection.expandSelectionUp(2);
        expect(selection.range.y2).toBe(0);

        selection.expandSelectionDown(2);
        expect(selection.range.y2).toBe(2);
    });

    it("clamps movement and expansion at the first and last valid indexes", () => {
        const grid = createTestGrid();
        const selection = createSelection(grid);

        selection.select(0, 0);
        selection.moveSelectionLeft(5);
        expect(selection.range.x2).toBe(0);

        selection.select(2, 2);
        selection.moveSelectionRight(5);
        expect(selection.range.x2).toBe(2);

        selection.select(0, 0, 2, 2);
        selection.expandSelectionLeft(5);
        expect(selection.range.left).toBe(0);

        selection.select(0, 0, 2, 2);
        selection.expandSelectionRight(5);
        expect(selection.range.right).toBe(2);
    });

    it("does not move or expand beyond valid bounds when the grid has no visible columns", () => {
        const host = document.createElement("div");
        const grid = createGrid(host, { columns: [] });
        const selection = createSelection(grid);

        selection.select(0, 0);
        selection.moveSelectionLeft(3);
        selection.moveSelectionRight(3);
        expect(selection.range.x2).toBe(0);

        selection.select(0, 0, 0, 0);
        selection.expandSelectionLeft(3);
        selection.expandSelectionRight(3);
        expect(selection.range.left).toBe(0);
        expect(selection.range.right).toBe(0);
    });

    it("raises the change event when the selection is updated", () => {
        const grid = createTestGrid();
        const selection = createSelection(grid);
        const listener = vi.fn();

        selection.onChange.subscribe(listener);
        selection.select(1, 1);
        selection.range = createRange(0, 0, 2, 2);

        expect(listener).toHaveBeenCalledTimes(2);
    });

    it("clamps vertical movement and expansion to the loaded row range", () => {
        const grid = createTestGrid();
        const selection = createSelection(grid);

        selection.select(0, 0);
        selection.moveSelectionUp(10);
        expect(selection.range.y2).toBe(0);

        selection.select(0, 2);
        selection.moveSelectionDown(10);
        expect(selection.range.y2).toBe(2);

        selection.select(0, 0, 0, 2);
        selection.expandSelectionUp(10);
        expect(selection.range.top).toBe(0);

        selection.select(0, 0, 0, 2);
        selection.expandSelectionDown(10);
        expect(selection.range.bottom).toBe(2);
    });
});
