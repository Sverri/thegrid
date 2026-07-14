import type { Column } from "@/columns";
import type { ElementScrollDimensions } from "@/helpers/getelementscrolldimensions";
import { createRange } from "@/shared/range";

/**
 * Input options for computing the visible render area.
 */
interface Options {
    /**
     * The ordered list of columns available to the grid.
     */
    columns: Immutable.List<Column<any>>;

    /**
     * The data source rows that may be rendered.
     */
    source: Immutable.List<object>;

    /**
     * The size of a single cell in pixels.
     */
    cellSize: number;

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
export function calculateRenderArea({ columns, source, cellSize, dimensions, renderAhead }: Options) {
    const { scrollLeft, scrollRight, scrollTop, scrollBottom } = dimensions;
    const rowsCount = source.size;

    // Columns
    const firstColumn = columns.find(({ visible, fromLeft, width }) => visible && fromLeft + width >= scrollLeft);
    const lastColumn = columns.reverse().find(({ visible, fromLeft }) => visible && fromLeft <= scrollRight);

    // Rows
    let firstRow: number = -1;
    let lastRow: number = -1;
    if (rowsCount > 0) {
        firstRow = Math.max(0, Math.floor(scrollTop / cellSize) - renderAhead.rows);
        lastRow = Math.min(rowsCount - 1, Math.floor(scrollBottom / cellSize) + renderAhead.rows);
    }

    return createRange(
        Math.max(0, (firstColumn?.index ?? 0) - renderAhead.columns),
        firstRow,
        Math.min(columns.size - 1, (lastColumn?.index ?? 0) + renderAhead.columns),
        lastRow,
    );
}
