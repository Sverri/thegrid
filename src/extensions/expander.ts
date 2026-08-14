import type { ExtendObject } from "@/types";

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
export function expanderExtension(meta: ExtendObject<any>): void {
    meta.onInvalidate.subscribe(() => {
        const { grid, hostElement } = meta;
        const totalWidth = grid.columns
            .filter(column => column.visible)
            .reduce((total, value) => total + value.width, 0);
        const columnsWidth = `${totalWidth}px`;
        const rowsHeight = `${grid.source.size * grid.cellSize}px`;
        hostElement.style.setProperty("--internal-expander-x", columnsWidth, "important");
        hostElement.style.setProperty("--internal-expander-y", rowsHeight, "important");
    });
}
