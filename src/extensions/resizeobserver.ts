import type { Grid } from "@grid/grid";
import { debounce } from "throttle-debounce";

export function resizeObserverExtension(grid: Grid<any>): void {
    const resizeObserver = new ResizeObserver(
        debounce(100, () => {
            grid.invalidate();
        }),
    );
    resizeObserver.observe(grid.hostElement);
}
