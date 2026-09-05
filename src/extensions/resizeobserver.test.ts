/** @vitest-environment happy-dom */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resizeObserverExtension } from "./resizeobserver";

class MockResizeObserver {
    static lastInstance: MockResizeObserver | undefined;

    readonly observe = vi.fn();
    private readonly callback: ResizeObserverCallback;

    constructor(callback: ResizeObserverCallback) {
        this.callback = callback;
        MockResizeObserver.lastInstance = this;
    }

    trigger(): void {
        this.callback([], this as unknown as ResizeObserver);
    }
}

describe("resizeObserverExtension", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.stubGlobal("ResizeObserver", MockResizeObserver);
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.unstubAllGlobals();
        MockResizeObserver.lastInstance = undefined;
    });

    it("observes the grid host element", () => {
        const grid = {
            hostElement: document.createElement("div"),
            invalidate: vi.fn(),
        };

        resizeObserverExtension(grid as any);

        expect(MockResizeObserver.lastInstance?.observe).toHaveBeenCalledWith(grid.hostElement);
    });

    it("debounces grid invalidation after a resize", () => {
        const grid = {
            hostElement: document.createElement("div"),
            invalidate: vi.fn(),
        };

        resizeObserverExtension(grid as any);
        MockResizeObserver.lastInstance?.trigger();

        expect(grid.invalidate).not.toHaveBeenCalled();

        vi.advanceTimersByTime(99);
        expect(grid.invalidate).not.toHaveBeenCalled();

        vi.advanceTimersByTime(1);
        expect(grid.invalidate).toHaveBeenCalledTimes(1);
    });
});
