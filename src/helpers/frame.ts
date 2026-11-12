/**
 * A callback that runs at most once per animation frame, however often it is scheduled.
 */
export interface FrameCallback {
    /**
     * Run the callback on the next animation frame (no-op if already scheduled).
     */
    (): void;

    /**
     * Cancel a scheduled run.
     */
    cancel(): void;
}

/**
 * Wraps a callback so repeated calls within one frame are coalesced into a single run.
 *
 * @param callback The work to perform once per frame.
 */
export function onNextFrame(callback: () => void): FrameCallback {
    let handle: number | undefined;

    const schedule = () => {
        if (handle !== undefined) {
            return;
        }
        handle = requestAnimationFrame(() => {
            handle = undefined;
            callback();
        });
    };

    schedule.cancel = () => {
        if (handle !== undefined) {
            cancelAnimationFrame(handle);
            handle = undefined;
        }
    };

    return schedule;
}
