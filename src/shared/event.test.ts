import { describe, expect, it, vi } from "vitest";
import { createEvent } from "./event";

describe("createEvent", () => {
    it("notifies all subscribers when raised", () => {
        const event = createEvent<(value: number, label: string) => void>();
        const first = vi.fn();
        const second = vi.fn();

        event.subscribe(first);
        event.subscribe(second);
        event.raise(42, "answer");

        expect(first).toHaveBeenCalledWith(42, "answer");
        expect(second).toHaveBeenCalledWith(42, "answer");
    });

    it("stops notifying unsubscribed listeners", () => {
        const event = createEvent<() => void>();
        const listener = vi.fn();

        event.subscribe(listener);
        event.unsubscribe(listener);
        event.raise();

        expect(listener).not.toHaveBeenCalled();
    });

    it("exposes an unraiseable view that cannot be raised directly", () => {
        const event = createEvent<(value: string) => void>();
        const listener = vi.fn();

        event.unraisable.subscribe(listener);
        event.raise("ready");

        expect(listener).toHaveBeenCalledWith("ready");
        expect("raise" in event.unraisable).toBe(false);
    });
});
