import { describe, expect, it } from "vitest";
import { createPoint, isPoint } from "./point";

describe("createPoint", () => {
    it("creates a point with the provided coordinates", () => {
        const point = createPoint(12, -7);

        expect(point.x).toBe(12);
        expect(point.y).toBe(-7);
    });

    it("exposes coordinates as read-only properties", () => {
        const point = createPoint(1, 2);

        expect(Object.keys(point)).toEqual([]);
        expect(Object.getOwnPropertyDescriptor(Object.getPrototypeOf(point), "x")?.set).toBeUndefined();
        expect(Object.getOwnPropertyDescriptor(Object.getPrototypeOf(point), "y")?.set).toBeUndefined();
    });

    it("recognizes point instances and rejects unrelated values", () => {
        const point = createPoint(2, 4);

        expect(isPoint(point)).toBe(true);
        expect(isPoint({ x: 2, y: 4 })).toBe(false);
        expect(isPoint(null)).toBe(false);
        expect(isPoint("2,4")).toBe(false);
    });
});
