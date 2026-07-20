import type { TheGrid } from "@/grid";
import { debounce } from "throttle-debounce";

export function resizeObserverExtension(grid: TheGrid) {
    const resizeObserver = new ResizeObserver(
        debounce(100, (): void => {
            grid.invalidate();
        }),
    );
    resizeObserver.observe(grid.hostElement);
}
