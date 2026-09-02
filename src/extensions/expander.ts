import type { Grid } from "../grid";

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
        const totalWidth = columns.items
            .filter(column => column.visible)
            .reduce((total, column) => total + column.width, 0);
        hostElement.style.setProperty("--internal-expander-x", `${totalWidth}px`, "important");
        hostElement.style.setProperty("--internal-expander-y", `${source.length * cellSize}px`, "important");
    });
}
