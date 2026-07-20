import type { TheGrid } from "@/grid";

/**
 * Expander extension
 *
 * Cells are positioned in the grid using the CSS `translate` function, which
 * means scrollbars will not be visible. This extension sets x and y variables
 * that are used to position a :after pseudo-element to the bottom right,
 * exactly so that you can scroll to the last column and row.
 *
 * @param grid
 */
export function expanderExtension(grid: TheGrid) {
    grid.onInvalidate.subscribe(() => {
        const { columns, source, cellSize, hostElement } = grid;
        const columnsWidth = `${columns.totalWidth}px`;
        const rowsHeight = `${source.items.size * cellSize}px`;
        hostElement.style.setProperty("--internal-expander-x", columnsWidth, "important");
        hostElement.style.setProperty("--internal-expander-y", rowsHeight, "important");
    });
}
