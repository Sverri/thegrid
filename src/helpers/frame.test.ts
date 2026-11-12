/** @vitest-environment happy-dom */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { onNextFrame } from "./frame";

describe("onNextFrame", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("runs the callback once per frame however often it is scheduled", () => {
        const callback = vi.fn();
        const schedule = onNextFrame(callback);

        schedule();
        schedule();
        schedule();
        expect(callback).not.toHaveBeenCalled();

        vi.advanceTimersToNextFrame();
        expect(callback).toHaveBeenCalledTimes(1);

        schedule();
        vi.advanceTimersToNextFrame();
        expect(callback).toHaveBeenCalledTimes(2);
    });

    it("does not run a cancelled callback", () => {
        const callback = vi.fn();
        const schedule = onNextFrame(callback);

        schedule();
        schedule.cancel();
        vi.advanceTimersToNextFrame();

        expect(callback).not.toHaveBeenCalled();
    });
});
