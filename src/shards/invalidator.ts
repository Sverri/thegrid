import { createEvent } from "@/shared/event";
import { debounce } from "throttle-debounce";

export function useInvalidator() {
    const onInvalidate = createEvent<() => void>();

    const debouncedInvalidate = debounce(100, () => {
        onInvalidate.raise();
    });

    const invalidate = (immediately = false) => {
        if (immediately) {
            onInvalidate.raise();
        } else {
            debouncedInvalidate();
        }
    };

    return Object.freeze({
        onInvalidate,
        invalidate,
    });
}
