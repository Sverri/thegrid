import type { TheGrid } from "@/grid";
import { createRange, type Range } from "@/shared/range";

export type Selection = ReturnType<typeof createSelection>;

/**
 * Create a selection controller for the grid.
 *
 * The selection model abstracts the details of tracking the active cell and
 * the current selection range as a single rectangular region. Internally, it
 * stores the selection as a normalized range with two corner points,
 * represented as (x1,y1) and (x2, y2).
 *
 * The active cell is always represented by (x2,y2), while (x1,y1)
 * describes the opposite corner of the selection. When only one cell is
 * selected, both points are identical.
 *
 * The coordinate system is intentionally direction-agnostic. A selection can
 * be created from a lower-right cell to an upper-left cell, and the range
 * will still be represented correctly. In that case, the active cell is the
 * one most recently focused, while the other corner remains the anchor.
 *
 * @param grid The grid instance that owns the selection.
 * @returns A selection object with range accessors and navigation helpers.
 */
export function createSelection(grid: TheGrid<any>) {
    let range: Range = createRange(-1, -1);

    function setNewRange(newRange: Range) {
        if (!range.identicalTo(newRange)) {
            range = newRange;
            grid.invalidate(true);
        }
    }

    return Object.freeze({
        /**
         * Get the current selection range.
         */
        get range() {
            return range;
        },

        /**
         * Update the selection to a new range.
         *
         * Note: Consider using the other methods, if possible.
         *
         * @param x1 X coordinate for the first corner of the selection.
         * @param y1 Y coordinate for the first corner of the selection.
         * @param x2 X coordinate for the active cell.
         * @param y2 Y coordinate for the active cell.
         */
        update(x1: number, y1: number, x2 = x1, y2 = y1) {
            const newRange = createRange(x1, y1, x2, y2);
            setNewRange(newRange);
        },

        /**
         * Move the entire selection to the cell on the left of the active cell.
         *
         * @param count Number of visible columns to move left.
         */
        moveLeft(count = 1) {
            const { x2, y2 } = range;
            let newX2 = x2;
            while (count > 0) {
                const column = grid.columns.items.get(--newX2)!;
                if (!column || column.visible) {
                    count--;
                }
            }
            const minX2 = 0;
            const newRange = createRange(Math.max(minX2, newX2), y2);
            setNewRange(newRange);
        },

        /**
         * Move the entire selection to the cell on the right of the active cell.
         *
         * @param count Number of visible columns to move right.
         */
        moveRight(count = 1) {
            const { x2, y2 } = range;
            let newX2 = x2;
            while (count > 0) {
                const column = grid.columns.items.get(++newX2)!;
                if (!column || column.visible) {
                    count--;
                }
            }
            const maxX2 = grid.columns.lastVisibleIndex;
            const newRange = createRange(Math.min(maxX2, newX2), y2);
            setNewRange(newRange);
        },

        /**
         * Move the entire selection upward by the given number of rows.
         *
         * @param count Number of rows to move up.
         */
        moveUp(count = 1) {
            const { x2, y2 } = range;
            const minY2 = 0;
            const newRange = createRange(x2, Math.max(minY2, y2 - count));
            setNewRange(newRange);
        },

        /**
         * Move the entire selection downward by the given number of rows.
         *
         * @param count Number of rows to move down.
         */
        moveDown(count = 1) {
            const { x2, y2 } = range;
            const maxY2 = grid.source.items.size - 1;
            const newRange = createRange(x2, Math.min(maxY2, y2 + count));
            setNewRange(newRange);
        },

        /**
         * Expand the selection to the cell on the left of the active cell.
         *
         * @param count Number of visible columns to expand left.
         */
        expandLeft(count = 1) {
            const { x1, y1, x2, y2 } = range;
            let newX2 = x2;
            while (count > 0) {
                const column = grid.columns.items.get(--newX2)!;
                if (!column || column.visible) {
                    count--;
                }
            }
            const minX2 = 0;
            const newRange = createRange(x1, y1, Math.max(minX2, newX2), y2);
            setNewRange(newRange);
        },

        /**
         * Expand the selection to the cell on the right of the active cell.
         *
         * @param count Number of visible columns to expand right.
         */
        expandRight(count = 1) {
            const { x1, y1, x2, y2 } = range;
            let newX2 = x2;
            while (count > 0) {
                const column = grid.columns.items.get(++newX2)!;
                if (!column || column.visible) {
                    count--;
                }
            }
            const maxX2 = grid.columns.lastVisibleIndex;
            const newRange = createRange(x1, y1, Math.min(maxX2, newX2), y2);
            setNewRange(newRange);
        },

        /**
         * Expand the selection upward by the given number of rows.
         *
         * @param count Number of rows to expand up.
         */
        expandUp(count = 1) {
            const { x1, y1, x2, y2 } = range;
            const newRange = createRange(x1, y1, x2, Math.max(0, y2 - count));
            setNewRange(newRange);
        },

        /**
         * Expand the selection downward by the given number of rows.
         *
         * @param count Number of rows to expand down.
         */
        expandDown(count = 1) {
            const { x1, y1, x2, y2 } = range;
            const maxRows = grid.source.items.size - 1;
            const newRange = createRange(x1, y1, x2, Math.min(maxRows, y2 + count));
            setNewRange(newRange);
        },
    });
}
