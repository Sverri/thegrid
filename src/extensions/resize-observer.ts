import type { Grid } from "@grid/grid";
import type { Disposer } from "@shared/types";
import { debounce } from "throttle-debounce";

/**
 * Registers a debounced resize observer for the grid host element.
 *
 * A host resize invalidates the grid after 100 milliseconds, allowing a burst
 * of resize notifications to be handled as a single render invalidation.
 *
 * @param grid The grid whose host element should be observed.
 * @returns A function that stops observing and cancels a pending invalidation.
 */
export function resizeObserverExtension(grid: Grid<any>): Disposer {
    const onResize = debounce(100, () => {
        grid.invalidate();
    });
    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(grid.hostElement);
    return () => {
        resizeObserver.disconnect();
        onResize.cancel();
    };
}
