import type { TheGrid } from "@/parts/grid";
import { debounce } from "throttle-debounce";

export function resizeObserverExtension(grid: TheGrid<any>) {
    const resizeObserver = new ResizeObserver(
        debounce(100, (): void => {
            grid.invalidate();
        }),
    );
    resizeObserver.observe(grid.hostElement);
}
