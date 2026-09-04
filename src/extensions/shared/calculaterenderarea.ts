import type { Grid } from "@grid/grid";
import type { RenderAhead } from "@shared/types";
import { getElementScrollDimensions, type ElementScrollDimensions } from "@helpers/getelementscrolldimensions";
import { createRange, type Range } from "@structure/range";
import { columnFromLeft } from "@structure/column";

function calculateColumns(grid: Grid<any>, dimensions: ElementScrollDimensions, renderAhead: RenderAhead) {
    const { columns } = grid;
    const { scrollLeft, scrollRight } = dimensions;
    const firstIndex = columns.items.findIndex(
        (c, i) => c.visible && columnFromLeft(columns.items, i) + c.width >= scrollLeft,
    );
    const lastIndex = columns.items.findLastIndex(
        (c, i) => c.visible && columnFromLeft(columns.items, i) <= scrollRight,
    );
    return {
        firstColumnIndex: Math.max(0, firstIndex - renderAhead.columns),
        lastColumnIndex: Math.min(columns.items.length - 1, lastIndex + renderAhead.columns),
    };
}

function calculateRows(grid: Grid<any>, dimensions: ElementScrollDimensions, renderAhead: RenderAhead) {
    const { data, cellSize } = grid;
    const { scrollTop, scrollBottom } = dimensions;
    const count = data.size;
    return {
        firstRowIndex: count > 0 ? Math.max(0, Math.floor(scrollTop / cellSize) - renderAhead.rows) : -1,
        lastRowIndex: count > 0 ? Math.min(count - 1, Math.floor(scrollBottom / cellSize) + renderAhead.rows) : -1,
    };
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
export function calculateRenderArea(grid: Grid<any>, renderAhead: RenderAhead): Range {
    const dimensions = getElementScrollDimensions(grid.cellsElement);
    const { firstColumnIndex, lastColumnIndex } = calculateColumns(grid, dimensions, renderAhead);
    const { firstRowIndex, lastRowIndex } = calculateRows(grid, dimensions, renderAhead);
    return createRange(firstColumnIndex, firstRowIndex, lastColumnIndex, lastRowIndex);
}
