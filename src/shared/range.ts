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

    /**
     * Iterate over all the points in the range
     */
    iterator(): Generator<Point, void, unknown>;

    sameAs(range: Range): boolean;
    identicalTo(range: Range): boolean;
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

        sameAs(range: Range): boolean {
            return left === range.left && top === range.top && right === range.right && bottom === range.bottom;
        },

        identicalTo(range: Range): boolean {
            return x1 === range.x1 && y1 === range.y1 && x2 === range.x2 && y2 === range.y2;
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
