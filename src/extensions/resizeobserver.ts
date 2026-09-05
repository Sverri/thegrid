import type { Grid } from "@grid/grid";
import { debounce } from "throttle-debounce";

/**
 * Registers a debounced resize observer for the grid host element.
 *
 * A host resize invalidates the grid after 100 milliseconds, allowing a burst
 * of resize notifications to be handled as a single render invalidation.
 *
 * @param grid The grid whose host element should be observed.
 */
export function resizeObserverExtension(grid: Grid<any>): void {
    const resizeObserver = new ResizeObserver(
        debounce(100, () => {
            grid.invalidate();
        }),
    );
    resizeObserver.observe(grid.hostElement);
}
