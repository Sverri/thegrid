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
});
