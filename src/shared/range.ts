import { createPoint, type Point } from "./point";

export interface Range {
    /**
     * X1 coordinate
     */
    readonly x1: number;

    /**
     * X2 coordinate
     */
    readonly x2: number;

    /**
     * Y1 coordinate
     */
    readonly y1: number;

    /**
     * Y2 coordinate
     */
    readonly y2: number;

    /**
     * Left edge of range
     */
    readonly left: number;

    /**
     * Right edge of range
     */
    readonly right: number;

    /**
     * Top edge of range
     */
    readonly top: number;

    /**
     * Bottom edge of range
     */
    readonly bottom: number;

    /**
     * Whether the supplied range is fully contained by this range
     */
    contains(range: Range): boolean;

    /**
     * Whether the supplied column index is within this range's columns
     */
    containsColumn(columnIndex: number): boolean;

    /**
     * Whether the supplied row index is within this range's rows
     */
    containsRow(rowIndex: number): boolean;

    /**
     * Whether this range intersects the supplied range
     */
    intersects(range: Range): boolean;

    /**
     * Whether the supplied column index intersects this range's columns
     */
    intersectsColumn(columnIndex: number): boolean;

    /**
     * Whether the supplied row index intersects this range's rows
     */
    intersectsRow(rowIndex: number): boolean;

    adjustLeft(count?: number, min?: number): Range;
    adjustRight(count?: number, max?: number): Range;
    adjustUp(count?: number, max?: number): Range;
    adjustDown(count?: number, max?: number): Range;

    /**
     * Iterate over all the points in the range
     */
    iterator(): Generator<Point, void, unknown>;
}

/**
 * Range representing a space with x1, x2, y1 and y2 coordinates.
 */
export function createRange(x1: number, y1: number, x2 = x1, y2 = y1): Range {
    const left = Math.min(x1, x2);
    const right = Math.max(x1, x2);
    const top = Math.min(y1, y2);
    const bottom = Math.max(y1, y2);

    return Object.freeze({
        x1,
        x2,
        y1,
        y2,
        left,
        right,
        top,
        bottom,

        contains(range: Range) {
            return range.left >= left && range.right <= right && range.top >= top && range.bottom <= bottom;
        },

        containsColumn(columnIndex: number) {
            return columnIndex >= left && columnIndex <= right;
        },

        containsRow(rowIndex: number) {
            return rowIndex >= top && rowIndex <= bottom;
        },

        intersects(range: Range) {
            return range.left <= right && range.right >= left && range.top <= bottom && range.bottom >= top;
        },

        intersectsColumn(columnIndex: number) {
            return columnIndex >= left && columnIndex <= right;
        },

        intersectsRow(rowIndex: number) {
            return rowIndex >= top && rowIndex <= bottom;
        },

        adjustLeft(count = 1, min = 0): Range {
            return createRange(x1, y1, Math.max(min, x2 - count), y2);
        },

        adjustRight(count = 1, max = 99999): Range {
            return createRange(x1, y1, Math.min(max, x2 + count), y2);
        },

        adjustUp(count = 1, min = 0): Range {
            return createRange(x1, y1, x2, Math.max(min, y2 - count));
        },

        adjustDown(count = 1, max = 99999): Range {
            return createRange(x1, y1, x2, Math.min(max, y2 + count));
        },

        *iterator() {
            for (let rowIndex = top; rowIndex <= bottom; rowIndex++) {
                for (let columnIndex = left; columnIndex <= right; columnIndex++) {
                    yield createPoint(columnIndex, rowIndex);
                }
            }
        },
    });
}
