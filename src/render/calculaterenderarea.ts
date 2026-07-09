import type { Column } from "@/columns";
import type { ElementScrollDimensions } from "@/helpers/getelementscrolldimensions";
import { createRange } from "@/shared/range";

interface Options {
    columns: Immutable.List<Column<any>>;
    source: Immutable.List<object>;
    cellSize: number;
    dimensions: ElementScrollDimensions;
    renderAhead: { columns: number; rows: number };
}

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
