import { describe, expect, it } from "vitest";
import {
    createRange,
    rangeContains,
    rangeContainsColumn,
    rangeContainsRow,
    rangeHorizontalIterator,
    rangeIdenticalTo,
    rangeIntersects,
    rangeIntersectsColumn,
    rangeIntersectsRow,
    rangeIterator,
    rangeSameAs,
    rangeVerticalIterator,
} from "./range";

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

        expect(rangeContains(range, createRange(3, 4, 4, 6))).toBe(true);
        expect(rangeContains(range, createRange(1, 4, 4, 6))).toBe(false);
        expect(rangeContainsColumn(range, 2)).toBe(true);
        expect(rangeContainsColumn(range, 5)).toBe(true);
        expect(rangeContainsColumn(range, 6)).toBe(false);
        expect(rangeContainsRow(range, 3)).toBe(true);
        expect(rangeContainsRow(range, 7)).toBe(true);
        expect(rangeContainsRow(range, 8)).toBe(false);
    });

    it("checks intersections and coordinate overlap inclusively", () => {
        const range = createRange(2, 3, 5, 7);

        expect(rangeIntersects(range, createRange(5, 7, 8, 9))).toBe(true);
        expect(rangeIntersects(range, createRange(6, 8, 8, 9))).toBe(false);
        expect(rangeIntersectsColumn(range, 2)).toBe(true);
        expect(rangeIntersectsColumn(range, 6)).toBe(false);
        expect(rangeIntersectsRow(range, 7)).toBe(true);
        expect(rangeIntersectsRow(range, 8)).toBe(false);
    });

    it("compares normalized bounds and original orientation separately", () => {
        const range = createRange(5, 7, 2, 3);

        expect(rangeSameAs(range, createRange(2, 3, 5, 7))).toBe(true);
        expect(rangeIdenticalTo(range, createRange(5, 7, 2, 3))).toBe(true);
        expect(rangeIdenticalTo(range, createRange(2, 3, 5, 7))).toBe(false);
    });

    it("iterates through cells row by row", () => {
        const range = createRange(1, 2, 2, 3);

        expect([...rangeIterator(range)].map(point => [point.x, point.y])).toEqual([
            [1, 2],
            [2, 2],
            [1, 3],
            [2, 3],
        ]);
    });

    it("iterates across columns and rows with sentinel coordinates", () => {
        const range = createRange(1, 2, 3, 4);

        expect([...rangeHorizontalIterator(range)].map(point => [point.x, point.y])).toEqual([
            [1, -1],
            [2, -1],
            [3, -1],
        ]);
        expect([...rangeVerticalIterator(range)].map(point => [point.x, point.y])).toEqual([
            [-1, 2],
            [-1, 3],
            [-1, 4],
        ]);
    });
});
