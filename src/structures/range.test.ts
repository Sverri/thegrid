import { describe, expect, it } from "vitest";
import { createRange } from "./range";

describe("createRange", () => {
    it("creates a single-cell range when the ending coordinates are omitted", () => {
        const range = createRange(3, 4);

        expect(range.x1).toBe(3);
        expect(range.y1).toBe(4);
        expect(range.x2).toBe(3);
        expect(range.y2).toBe(4);
        expect(range.left).toBe(3);
        expect(range.right).toBe(3);
        expect(range.top).toBe(4);
        expect(range.bottom).toBe(4);
    });

    it("normalizes bounds while preserving the original coordinates", () => {
        const range = createRange(5, 8, 2, 3);

        expect(range).toEqual(expect.objectContaining({ x1: 5, y1: 8, x2: 2, y2: 3 }));
        expect(range).toEqual(expect.objectContaining({ left: 2, right: 5, top: 3, bottom: 8 }));
    });

    it("checks containment and coordinate membership inclusively", () => {
        const range = createRange(2, 3, 5, 7);

        expect(range.contains(createRange(3, 4, 4, 6))).toBe(true);
        expect(range.contains(createRange(1, 4, 4, 6))).toBe(false);
        expect(range.containsColumn(2)).toBe(true);
        expect(range.containsColumn(5)).toBe(true);
        expect(range.containsColumn(6)).toBe(false);
        expect(range.containsRow(3)).toBe(true);
        expect(range.containsRow(7)).toBe(true);
        expect(range.containsRow(8)).toBe(false);
    });

    it("checks intersections and coordinate overlap inclusively", () => {
        const range = createRange(2, 3, 5, 7);

        expect(range.intersects(createRange(5, 7, 8, 9))).toBe(true);
        expect(range.intersects(createRange(6, 8, 8, 9))).toBe(false);
        expect(range.intersectsColumn(2)).toBe(true);
        expect(range.intersectsColumn(6)).toBe(false);
        expect(range.intersectsRow(7)).toBe(true);
        expect(range.intersectsRow(8)).toBe(false);
    });

    it("compares normalized bounds and original orientation separately", () => {
        const range = createRange(5, 7, 2, 3);

        expect(range.sameAs(createRange(2, 3, 5, 7))).toBe(true);
        expect(range.identicalTo(createRange(5, 7, 2, 3))).toBe(true);
        expect(range.identicalTo(createRange(2, 3, 5, 7))).toBe(false);
    });

    it("iterates through cells row by row", () => {
        const range = createRange(1, 2, 2, 3);

        expect([...range.iterator()].map(point => [point.x, point.y])).toEqual([
            [1, 2],
            [2, 2],
            [1, 3],
            [2, 3],
        ]);
    });

    it("iterates across columns and rows with sentinel coordinates", () => {
        const range = createRange(1, 2, 3, 4);

        expect([...range.horizontalIterator()].map(point => [point.x, point.y])).toEqual([
            [1, -1],
            [2, -1],
            [3, -1],
        ]);
        expect([...range.verticalIterator()].map(point => [point.x, point.y])).toEqual([
            [-1, 2],
            [-1, 3],
            [-1, 4],
        ]);
    });
});
