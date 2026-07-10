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

        *iterator() {
            for (let columnIndex = left; columnIndex <= right; columnIndex++) {
                for (let rowIndex = top; rowIndex <= bottom; rowIndex++) {
                    yield createPoint(columnIndex, rowIndex);
                }
            }
        },
    });
}
