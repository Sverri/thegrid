import type { ElementScrollDimensions } from "@helpers/getelementscrolldimensions";
import type { Grid } from "../../grid";
import { createRange, type Range } from "@structure/range";

/**
 * Input options for computing the visible render area.
 */
interface Options {
    /**
     * The grid
     */
    readonly grid: Grid<any>;

    /**
     * The current scroll dimensions of the viewport.
     */
    readonly dimensions: ElementScrollDimensions;

    /**
     * The number of extra rows and columns to include outside the visible viewport.
     */
    readonly renderAhead: { columns: number; rows: number };
}

function calculateColumns({ grid, dimensions, renderAhead }: Readonly<Options>) {
    const { columns } = grid;
    const { scrollLeft, scrollRight } = dimensions;
    const firstIndex = columns.items.findIndex(c => c.visible && c.fromLeft + c.width >= scrollLeft) ?? 0;
    const lastIndex = [...columns.items].reverse().findLastIndex(c => c.visible && c.fromLeft <= scrollRight) ?? 0;
    return {
        firstColumnIndex: Math.max(0, firstIndex - renderAhead.columns),
        lastColumnIndex: Math.min(columns.items.length - 1, lastIndex + renderAhead.columns),
    };
}

function calculateRows({ grid, dimensions, renderAhead }: Readonly<Options>) {
    const { source, cellSize } = grid;
    const { scrollTop, scrollBottom } = dimensions;
    const count = source.length;
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
export function calculateRenderArea(options: Readonly<Options>): Range {
    const { firstColumnIndex, lastColumnIndex } = calculateColumns(options);
    const { firstRowIndex, lastRowIndex } = calculateRows(options);
    return createRange(firstColumnIndex, firstRowIndex, lastColumnIndex, lastRowIndex);
}
