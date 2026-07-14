import { createPoint, type Point } from "./point";

/**
 * Represents a rectangular selection or span in grid coordinates.
 *
 * A range is defined by two corner points (x1,y1) and (x2,y2) and exposes
 * normalized bounds such as left, right, top, and bottom. The implementation is
 * direction-agnostic, so ranges can be created in either orientation.
 */
export interface Range {
    /**
     * The first x-coordinate of the range.
     */
    readonly x1: number;

    /**
     * The second x-coordinate of the range.
     */
    readonly x2: number;

    /**
     * The first y-coordinate of the range.
     */
    readonly y1: number;

    /**
     * The second y-coordinate of the range.
     */
    readonly y2: number;

    /**
     * The smallest x-coordinate covered by the range.
     */
    readonly left: number;

    /**
     * The largest x-coordinate covered by the range.
     */
    readonly right: number;

    /**
     * The smallest y-coordinate covered by the range.
     */
    readonly top: number;

    /**
     * The largest y-coordinate covered by the range.
     */
    readonly bottom: number;

    /**
     * Determines whether the supplied range is fully contained within this range.
     *
     * @param range The range to test for containment.
     */
    contains(range: Range): boolean;

    /**
     * Determines whether a given column index falls within this range's column span.
     *
     * @param columnIndex The column index to test.
     */
    containsColumn(columnIndex: number): boolean;

    /**
     * Determines whether a given row index falls within this range's row span.
     *
     * @param rowIndex The row index to test.
     */
    containsRow(rowIndex: number): boolean;

    /**
     * Determines whether this range overlaps another range.
     *
     * @param range The range to test for intersection.
     */
    intersects(range: Range): boolean;

    /**
     * Determines whether a given column index overlaps this range's column span.
     *
     * @param columnIndex The column index to test.
     */
    intersectsColumn(columnIndex: number): boolean;

    /**
     * Determines whether a given row index overlaps this range's row span.
     *
     * @param rowIndex The row index to test.
     */
    intersectsRow(rowIndex: number): boolean;

    /**
     * Compares this range to another range by its normalized bounds, ignoring the active corner.
     *
     * @param range The range to compare against.
     */
    sameAs(range: Range): boolean;

    /**
     * Compares this range to another range by its exact corner coordinates.
     *
     * @param range The range to compare against.
     */
    identicalTo(range: Range): boolean;

    /**
     * Iterates over every point contained within the range.
     */
    iterator(): Generator<Point, void, unknown>;

    /**
     * Iterates over every point along the horizontal span of the range.
     */
    horizontalIterator(): Generator<Pick<Point, "x">, void, unknown>;

    /**
     * Iterates over every point along the vertical span of the range.
     */
    verticalIterator(): Generator<Pick<Point, "y">, void, unknown>;
}

/**
 * Creates a range from two coordinate pairs.
 *
 * The provided coordinates are stored as-is, but the returned range exposes
 * normalized left/right and top/bottom bounds so callers can reason about the
 * span without caring about the original direction.
 *
 * @param x1 The first x-coordinate.
 * @param y1 The first y-coordinate.
 * @param x2 The second x-coordinate. Defaults to x1.
 * @param y2 The second y-coordinate. Defaults to y1.
 * @returns Range instance with normalized bounds and helper methods.
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

        *horizontalIterator() {
            for (let columnIndex = left; columnIndex <= right; columnIndex++) {
                yield createPoint(columnIndex, -1);
            }
        },

        *verticalIterator() {
            for (let rowIndex = top; rowIndex <= bottom; rowIndex++) {
                yield createPoint(-1, rowIndex);
            }
        },
    });
}
