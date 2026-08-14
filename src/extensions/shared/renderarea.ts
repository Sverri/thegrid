import type { ElementScrollDimensions } from "@/helpers/getelementscrolldimensions";
import type { GridData } from "@/structures/grid";
import { columnFromLeft } from "@/helpers/column";
import { createRange, type Range } from "@/structures/range";

/**
 * Input options for computing the visible render area.
 */
interface Options {
    /**
     * The grid
     */
    grid: GridData<any>;

    /**
     * The current scroll dimensions of the viewport.
     */
    dimensions: ElementScrollDimensions;

    /**
     * The number of extra rows and columns to include outside the visible viewport.
     */
    renderAhead: { columns: number; rows: number };
}

/**
 * Calculates the rectangular range of rows and columns that should be rendered.
 *
 * The result is derived from the current scroll position and the configured
 * render-ahead margin so the grid can render just enough content to stay smooth.
 *
 * @param options The render-area calculation inputs.
 * @returns A range describing the visible and buffered render region.
 */
export function calculateRenderArea({ grid, dimensions, renderAhead }: Options): Range {
    const { columns, source, cellSize } = grid;
    const { scrollLeft, scrollRight, scrollTop, scrollBottom } = dimensions;

    // Columns
    const firstIndex =
        columns.findIndex(column => column.visible && columnFromLeft(columns, column) + column.width >= scrollLeft) ??
        0;
    const lastIndex =
        columns.reverse().findLastIndex(column => column.visible && columnFromLeft(columns, column) <= scrollRight) ??
        0;

    const firstColumnIndex = Math.max(0, firstIndex - renderAhead.columns);
    const lastColumnIndex = Math.min(columns.size - 1, lastIndex + renderAhead.columns);

    // Rows
    let firstRowIndex: number = -1;
    let lastRowIndex: number = -1;
    const rowsCount = source.size;
    if (rowsCount > 0) {
        firstRowIndex = Math.max(0, Math.floor(scrollTop / cellSize) - renderAhead.rows);
        lastRowIndex = Math.min(rowsCount - 1, Math.floor(scrollBottom / cellSize) + renderAhead.rows);
    }

    return createRange(firstColumnIndex, firstRowIndex, lastColumnIndex, lastRowIndex);
}
