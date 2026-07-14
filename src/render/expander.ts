import type { TheGrid } from "@/grid";

/**
 * Controls the positioning of the grid expander element.
 *
 * The expander is updated whenever the visible columns or data size changes so
 * the overlay can align with the grid's actual extent.
 */
export interface Expander {
    /**
     * Recomputes the expander's position based on the current grid state.
     */
    update(): void;
}

/**
 * Creates an expander controller for the grid host element.
 *
 * The controller updates CSS custom properties that position the expander at the
 * bottom-right edge of the visible grid content.
 *
 * @param grid The grid instance that provides the column layout, source data, and host element.
 * @returns Expander controller with an update method.
 */
export function createExpander({ columns, source, hostElement, cellSize }: TheGrid<any>): Expander {
    return Object.freeze({
        update() {
            const lastVisibleColumn = columns.items.findLast(c => c.visible);
            const x = (lastVisibleColumn?.fromLeft ?? 0) + (lastVisibleColumn?.width ?? 0);
            const y = source.items.size * cellSize;
            hostElement.style.setProperty("--internal-expander-translate-x", `${x}px`, "important");
            hostElement.style.setProperty("--internal-expander-translate-y", `${y}px`, "important");
        },
    });
}
