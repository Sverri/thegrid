import { describe, it, expect } from "vitest";
import { Event } from "./event";
import { UnraiseableEvent } from "./unraisableevent";

describe("UnraiseableEvent class", () => {
    it("does not have a raise method on UnraiseableEvent", () => {
        const event = new Event<() => void>();
        const unraisableEvent = new UnraiseableEvent(event);
        expect(unraisableEvent).not.toHaveProperty("raise");
    });

    it("stores subscribers", () => {
        const event = new Event<(n: number) => void>();
        const unraiseable = event.unraisable;

        let total = 0;
        unraiseable.subscribe(n => (total += n));
        unraiseable.subscribe(n => (total += n));
        unraiseable.subscribe(n => (total += n));
        event.raise(5);

        expect(total).toBe(15);
    });

    it("removes subscribers", () => {
        const event = new Event<(n: number) => void>();
        const unraiseable = event.unraisable;

        let total = 0;

        const fn1 = (n: number) => (total += n);
        const fn2 = (n: number) => (total += n);
        const fn3 = (n: number) => (total += n);

        unraiseable.subscribe(fn1);
        unraiseable.subscribe(fn2);
        unraiseable.subscribe(fn3);

        event.raise(5);
        expect(total).toBe(15);

        unraiseable.unsubscribe(fn1);
        unraiseable.unsubscribe(fn2);
        event.raise(2);
        expect(total).toBe(17);
    });
});
