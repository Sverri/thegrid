import { describe, it, expect } from "vitest";
import { Event } from "./event";

describe("Event class", () => {
    it("stores subscribers", () => {
        const event = new Event<() => void>();
        let total = 0;

        event.subscribe(() => (total += 1));
        event.subscribe(() => (total += 1));
        event.subscribe(() => (total += 1));
        event.raise();

        expect(total).toBe(3);
    });

    it("removes subscribers", () => {
        const event = new Event<(n: number) => void>();

        let total = 0;
        const fn1 = (n: number) => (total += n);
        const fn2 = (n: number) => (total += n);
        const fn3 = (n: number) => (total += n);

        event.subscribe(fn1);
        event.subscribe(fn2);
        event.subscribe(fn3);
        event.raise(5);
        expect(total).toBe(15);

        event.unsubscribe(fn1);
        event.unsubscribe(fn2);
        event.raise(2);
        expect(total).toBe(17);
    });

    it("calls subscribers", () => {
        const event = new Event<(name: string, age: number) => void>();
        const results: string[] = [];

        event.subscribe((name, age) => results.push(`${name}-${age}`));
        event.subscribe((name, age) => results.push(`${name}:${age}`));
        event.subscribe((name, age) => results.push(`${name}/${age}`));

        event.raise("Bob", 66);

        expect(results).toEqual(["Bob-66", "Bob:66", "Bob/66"]);
    });

    it("has unraiseable event", () => {
        const event = new Event<() => void>();
        expect(event).toHaveProperty("unraisable");
    });
});
