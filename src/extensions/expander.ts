import type { Grid } from "@grid/grid";
import type { Disposer } from "@shared/types";

/**
 * Registers the grid expander dimensions with the invalidate event.
 *
 * Cells are positioned with CSS `translate`, so their layout does not create
 * scrollbars. The extension updates CSS variables used by the expander pseudo-element
 * to make the final visible column and row scrollable.
 *
 * @param grid The grid whose host element should expose the expander dimensions.
 * @returns A function that removes the extension.
 */
export function expanderExtension(grid: Grid<any>): Disposer {
    const update = () => {
        const { hostElement, columns, data, cellSize } = grid;
        const totalWidth = columns.items.reduce((total, column) => total + column.width, 0);
        const totalHeight = columns.size === 0 ? 0 : data.size * cellSize;
        hostElement.style.setProperty("--internal-expander-x", `${totalWidth}px`, "important");
        hostElement.style.setProperty("--internal-expander-y", `${totalHeight}px`, "important");
    };
    grid.onInvalidate.subscribe(update);
    return () => {
        grid.onInvalidate.unsubscribe(update);
        grid.hostElement.style.removeProperty("--internal-expander-x");
        grid.hostElement.style.removeProperty("--internal-expander-y");
    };
}
