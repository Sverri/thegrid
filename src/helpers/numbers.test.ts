import { describe, expect, it } from "vitest";
import { clampNumber } from "./numbers";

describe("clampNumber", () => {
    it("returns the value when it is inside the range", () => {
        expect(clampNumber(0, 5, 10)).toBe(5);
    });

    it("returns the minimum when the value is below the range", () => {
        expect(clampNumber(0, -5, 10)).toBe(0);
    });

    it("returns the maximum when the value is above the range", () => {
        expect(clampNumber(0, 15, 10)).toBe(10);
    });

    it("keeps values equal to either bound unchanged", () => {
        expect(clampNumber(5, 5, 10)).toBe(5);
        expect(clampNumber(5, 10, 10)).toBe(10);
    });

    it("supports negative and fractional values", () => {
        expect(clampNumber(-2.5, -1.25, 3.75)).toBe(-1.25);
        expect(clampNumber(-2.5, -4.25, 3.75)).toBe(-2.5);
        expect(clampNumber(-2.5, 4.25, 3.75)).toBe(3.75);
    });

    it("returns the only available value when the bounds are equal", () => {
        expect(clampNumber(4, 99, 4)).toBe(4);
    });
});
