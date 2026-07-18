import { List } from "immutable";
import { describe, expect, it, vi } from "vitest";
import { createSelection } from "./createselection";

function createGrid(options?: { columns?: Array<{ visible?: boolean }>; rows?: number }) {
    const columns = (
        options?.columns ?? [{ visible: true }, { visible: false }, { visible: true }, { visible: true }]
    ).map((column, index) => ({ ...column, index }));

    const invalidate = vi.fn();

    return {
        invalidate,
        columns: {
            items: List(columns),
            get lastVisibleIndex() {
                return columns.findLastIndex(column => column.visible);
            },
        },
        source: {
            items: List(Array.from({ length: options?.rows ?? 6 }, (_, index) => ({ id: index }))),
        },
    };
}

describe("createSelection", () => {
    it("creates an initial selection that points to an empty range", () => {
        const grid = createGrid();
        const selection = createSelection(grid as any);

        expect(selection.range.x1).toBe(-1);
        expect(selection.range.y1).toBe(-1);
        expect(selection.range.x2).toBe(-1);
        expect(selection.range.y2).toBe(-1);
        expect(grid.invalidate).not.toHaveBeenCalled();
        expect(Object.isFrozen(selection)).toBe(true);
    });

    it("updates the selection and invalidates only when the range changes", () => {
        const grid = createGrid();
        const selection = createSelection(grid as any);

        selection.update(1, 2);
        expect(selection.range.x1).toBe(1);
        expect(selection.range.y1).toBe(2);
        expect(selection.range.x2).toBe(1);
        expect(selection.range.y2).toBe(2);
        expect(grid.invalidate).toHaveBeenCalledTimes(1);

        selection.update(1, 2);
        expect(grid.invalidate).toHaveBeenCalledTimes(1);

        selection.update(2, 3, 4, 5);
        expect(selection.range.x1).toBe(2);
        expect(selection.range.y1).toBe(3);
        expect(selection.range.x2).toBe(4);
        expect(selection.range.y2).toBe(5);
        expect(grid.invalidate).toHaveBeenCalledTimes(2);
    });

    it("moves left and right across visible columns while clamping at the edges", () => {
        const grid = createGrid({
            columns: [{ visible: true }, { visible: false }, { visible: true }, { visible: true }],
        });
        const selection = createSelection(grid as any);

        selection.update(2, 1);
        selection.moveLeft(1);
        expect(selection.range.x1).toBe(0);
        expect(selection.range.x2).toBe(0);
        expect(selection.range.y1).toBe(1);
        expect(selection.range.y2).toBe(1);

        selection.moveLeft(2);
        expect(selection.range.x1).toBe(0);
        expect(selection.range.x2).toBe(0);

        selection.moveRight(1);
        expect(selection.range.x1).toBe(2);
        expect(selection.range.x2).toBe(2);
        expect(selection.range.y1).toBe(1);
        expect(selection.range.y2).toBe(1);

        selection.moveRight(5);
        expect(selection.range.x1).toBe(3);
        expect(selection.range.x2).toBe(3);
    });

    it("moves up and down within the data bounds", () => {
        const grid = createGrid({ rows: 6 });
        const selection = createSelection(grid as any);

        selection.update(0, 3);
        selection.moveUp(2);
        expect(selection.range.y1).toBe(1);
        expect(selection.range.y2).toBe(1);

        selection.moveUp(5);
        expect(selection.range.y1).toBe(0);
        expect(selection.range.y2).toBe(0);

        selection.moveDown(2);
        expect(selection.range.y1).toBe(2);
        expect(selection.range.y2).toBe(2);

        selection.moveDown(10);
        expect(selection.range.y1).toBe(5);
        expect(selection.range.y2).toBe(5);
    });

    it("expands left and right while preserving the anchor and respecting hidden columns", () => {
        const grid = createGrid({
            columns: [{ visible: true }, { visible: false }, { visible: true }, { visible: true }],
        });
        const selection = createSelection(grid as any);

        selection.update(1, 1, 3, 3);
        selection.expandLeft(1);
        expect(selection.range.x1).toBe(1);
        expect(selection.range.y1).toBe(1);
        expect(selection.range.x2).toBe(2);
        expect(selection.range.y2).toBe(3);

        selection.expandRight(1);
        expect(selection.range.x1).toBe(1);
        expect(selection.range.y1).toBe(1);
        expect(selection.range.x2).toBe(3);
        expect(selection.range.y2).toBe(3);

        selection.expandRight(10);
        expect(selection.range.x2).toBe(3);

        selection.update(2, 2, 2, 2);
        selection.expandLeft(1);
        expect(selection.range.x1).toBe(2);
        expect(selection.range.y1).toBe(2);
        expect(selection.range.x2).toBe(0);
        expect(selection.range.y2).toBe(2);

        selection.update(0, 0, 0, 0);
        selection.expandRight(1);
        expect(selection.range.x1).toBe(0);
        expect(selection.range.y1).toBe(0);
        expect(selection.range.x2).toBe(2);
        expect(selection.range.y2).toBe(0);
    });

    it("expands up and down while preserving the anchor and clamping at the bounds", () => {
        const grid = createGrid({ rows: 6 });
        const selection = createSelection(grid as any);

        selection.update(1, 2, 3, 4);
        selection.expandUp(2);
        expect(selection.range.x1).toBe(1);
        expect(selection.range.y1).toBe(2);
        expect(selection.range.x2).toBe(3);
        expect(selection.range.y2).toBe(2);

        selection.expandDown(5);
        expect(selection.range.y2).toBe(5);

        selection.expandDown(10);
        expect(selection.range.y2).toBe(5);
    });

    it("clamps movement and expansion when stepping beyond the visible column bounds", () => {
        const grid = createGrid({
            columns: [{ visible: true }, { visible: false }, { visible: true }, { visible: true }],
        });
        const selection = createSelection(grid as any);

        selection.update(0, 1);
        selection.moveLeft(2);
        expect(selection.range.x1).toBe(0);
        expect(selection.range.x2).toBe(0);

        selection.moveRight(10);
        expect(selection.range.x1).toBe(3);
        expect(selection.range.x2).toBe(3);

        selection.update(0, 1, 0, 1);
        selection.expandLeft(2);
        expect(selection.range.x1).toBe(0);
        expect(selection.range.x2).toBe(0);

        selection.update(3, 1, 3, 1);
        selection.expandRight(10);
        expect(selection.range.x1).toBe(3);
        expect(selection.range.x2).toBe(3);
    });
});
