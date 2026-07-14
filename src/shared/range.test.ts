import { describe, expect, it } from "vitest";
import { createRange } from "./range";

describe("createRange predicates", () => {
    it("checks whether a range contains another range", () => {
        const range = createRange(2, 3, 5, 6);

        expect(range.contains(createRange(3, 4, 5, 5))).toBe(true);
        expect(range.contains(createRange(1, 4, 5, 5))).toBe(false);
    });

    it("checks whether a range contains specific columns and rows", () => {
        const range = createRange(2, 3, 5, 6);

        expect(range.containsColumn(2)).toBe(true);
        expect(range.containsColumn(6)).toBe(false);
        expect(range.containsRow(3)).toBe(true);
        expect(range.containsRow(7)).toBe(false);
    });

    it("checks whether ranges intersect", () => {
        const range = createRange(2, 3, 5, 6);

        expect(range.intersects(createRange(5, 6, 8, 8))).toBe(true);
        expect(range.intersects(createRange(6, 7, 8, 8))).toBe(false);
    });

    it("checks whether a range intersects specific columns and rows", () => {
        const range = createRange(2, 3, 5, 6);

        expect(range.intersectsColumn(5)).toBe(true);
        expect(range.intersectsColumn(6)).toBe(false);
        expect(range.intersectsRow(6)).toBe(true);
        expect(range.intersectsRow(7)).toBe(false);
    });

    it("normalizes bounds and preserves the original corner values", () => {
        const range = createRange(5, 6, 2, 3);

        expect(range.x1).toBe(5);
        expect(range.y1).toBe(6);
        expect(range.x2).toBe(2);
        expect(range.y2).toBe(3);
        expect(range.left).toBe(2);
        expect(range.right).toBe(5);
        expect(range.top).toBe(3);
        expect(range.bottom).toBe(6);
    });

    it("uses the supplied corner values when x2 and y2 are omitted", () => {
        const range = createRange(4, 7);

        expect(range.x1).toBe(4);
        expect(range.y1).toBe(7);
        expect(range.x2).toBe(4);
        expect(range.y2).toBe(7);
        expect(range.left).toBe(4);
        expect(range.right).toBe(4);
        expect(range.top).toBe(7);
        expect(range.bottom).toBe(7);
    });

    it("compares ranges by normalized bounds and exact coordinates", () => {
        const range = createRange(2, 3, 5, 6);
        const reversed = createRange(5, 6, 2, 3);

        expect(range.sameAs(reversed)).toBe(true);
        expect(range.identicalTo(reversed)).toBe(false);
        expect(range.sameAs(createRange(1, 3, 5, 6))).toBe(false);
    });

    it("returns false when only one corner coordinate differs", () => {
        const range = createRange(2, 3, 5, 6);

        expect(range.identicalTo(createRange(3, 3, 5, 6))).toBe(false);
        expect(range.identicalTo(createRange(2, 4, 5, 6))).toBe(false);
        expect(range.identicalTo(createRange(2, 3, 4, 6))).toBe(false);
        expect(range.identicalTo(createRange(2, 3, 5, 7))).toBe(false);
    });

    it("returns true when every corner coordinate matches exactly", () => {
        const range = createRange(2, 3, 5, 6);

        expect(range.identicalTo(createRange(2, 3, 5, 6))).toBe(true);
    });

    it("iterates over points in the range and its rows and columns", () => {
        const range = createRange(1, 2, 3, 4);

        expect(Array.from(range.iterator())).toEqual([
            { x: 1, y: 2 },
            { x: 2, y: 2 },
            { x: 3, y: 2 },
            { x: 1, y: 3 },
            { x: 2, y: 3 },
            { x: 3, y: 3 },
            { x: 1, y: 4 },
            { x: 2, y: 4 },
            { x: 3, y: 4 },
        ]);
        expect(Array.from(range.horizontalIterator())).toEqual([
            { x: 1, y: -1 },
            { x: 2, y: -1 },
            { x: 3, y: -1 },
        ]);
        expect(Array.from(range.verticalIterator())).toEqual([
            { x: -1, y: 2 },
            { x: -1, y: 3 },
            { x: -1, y: 4 },
        ]);
    });
});
