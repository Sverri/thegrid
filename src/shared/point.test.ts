import { describe, expect, it } from "vitest";
import { createPoint } from "./point";

describe("createPoint", () => {
    it("creates a point with the provided coordinates", () => {
        const point = createPoint(3, 4);

        expect(point).toEqual({ x: 3, y: 4 });
        expect(point.x).toBe(3);
        expect(point.y).toBe(4);
    });

    it("returns an immutable point", () => {
        const point = createPoint(1, 2);

        expect(Object.isFrozen(point)).toBe(true);
    });
});
