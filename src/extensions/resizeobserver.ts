import type { TheGrid } from "@/objects/grid";
import { debounce } from "throttle-debounce";

export function resizeObserverExtension(grid: TheGrid<any>): void {
    const resizeObserver = new ResizeObserver(
        debounce(100, () => {
            grid.invalidate();
        }),
    );
    resizeObserver.observe(grid.hostElement);
}
