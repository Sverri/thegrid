import { describe, expect, it } from "vitest";
import { Point } from "./point";
import { Range } from "./range";

describe("Range", () => {
    it("returns the intersection of overlapping ranges", () => {
        const a = new Range(1, 2, 4, 5);
        const b = new Range(3, 3, 6, 7);

        const intersection = a.intersect(b);

        expect(intersection).toBeDefined();
        expect(intersection?.left).toBe(3);
        expect(intersection?.top).toBe(3);
        expect(intersection?.right).toBe(4);
        expect(intersection?.bottom).toBe(5);
    });

    it("returns undefined when ranges do not overlap", () => {
        const a = new Range(0, 0, 2, 2);
        const b = new Range(3, 3, 5, 5);

        expect(a.intersect(b)).toBeUndefined();
    });

    it("handles inverted range endpoints by normalizing internally", () => {
        const a = new Range(5, 5, 2, 2);
        const b = new Range(3, 3, 4, 4);

        const intersection = a.intersect(b);

        expect(intersection).toBeDefined();
        expect(intersection?.left).toBe(3);
        expect(intersection?.top).toBe(3);
        expect(intersection?.right).toBe(4);
        expect(intersection?.bottom).toBe(4);
    });

    it("returns the union of two ranges", () => {
        const a = new Range(1, 2, 4, 5);
        const b = new Range(3, 1, 6, 7);

        const union = a.union(b);

        expect(union.left).toBe(1);
        expect(union.top).toBe(1);
        expect(union.right).toBe(6);
        expect(union.bottom).toBe(7);
    });

    it("returns true when a point is inside the range", () => {
        const range = new Range(1, 2, 4, 6);
        const point = new Point(3, 4);

        expect(range.containsPoint(point)).toBe(true);
    });

    it("returns false when a point is outside the range", () => {
        const range = new Range(1, 2, 4, 6);
        const point = new Point(0, 0);

        expect(range.containsPoint(point)).toBe(false);
    });
});
