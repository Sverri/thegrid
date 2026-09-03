import type { Grid } from "@grid/grid";

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
export function expanderExtension(grid: Grid<any>): void {
    grid.onInvalidate.subscribe(() => {
        const { hostElement, columns, source, cellSize } = grid;
        const totalWidth = columns.items.reduce((total, column) => total + (column.visible ? column.width : 0), 0);
        const totalHeight = columns.size === 0 ? 0 : source.length * cellSize;
        hostElement.style.setProperty("--internal-expander-x", `${totalWidth}px`, "important");
        hostElement.style.setProperty("--internal-expander-y", `${totalHeight}px`, "important");
    });
}
