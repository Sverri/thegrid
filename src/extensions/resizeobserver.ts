import type { ExtendObject } from "@/types";
import { debounce } from "throttle-debounce";

export function resizeObserverExtension(meta: ExtendObject<any>): void {
    const resizeObserver = new ResizeObserver(
        debounce(100, () => {
            meta.invalidate();
        }),
    );
    resizeObserver.observe(meta.hostElement);
}
