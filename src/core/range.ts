import { createPoint, type Point } from "./point";

/**
 * A rectangular range of cells, inclusive at both ends.
 *
 * `(x1, y1)` is the anchor, where the selection started, and `(x2, y2)` is
 * the active end, which moves as the selection is extended. `left`, `right`,
 * `top` and `bottom` give the same rectangle in normalized form.
 *
 * Create ranges with {@link createRange}, which freezes them.
 */
export interface Range {
    /**
     * The anchor column.
     */
    x1: number;

    /**
     * The active column.
     */
    x2: number;

    /**
     * The anchor row.
     */
    y1: number;

    /**
     * The active row.
     */
    y2: number;

    /**
     * The first column, `min(x1, x2)`.
     */
    left: number;

    /**
     * The last column, `max(x1, x2)`.
     */
    right: number;

    /**
     * The first row, `min(y1, y2)`.
     */
    top: number;

    /**
     * The last row, `max(y1, y2)`.
     */
    bottom: number;
}

/**
 * Creates a frozen range between two cells.
 *
 * @param x1 The anchor column.
 * @param y1 The anchor row.
 * @param x2 The active column. Defaults to `x1`.
 * @param y2 The active row. Defaults to `y1`.
 * @returns A frozen range. With only `x1` and `y1`, it covers a single cell.
 */
export function createRange(x1: number, y1: number, x2 = x1, y2 = y1): Range {
    return Object.freeze({
        x1: x1,
        x2: x2,
        y1: y1,
        y2: y2,
        left: Math.min(x1, x2),
        right: Math.max(x1, x2),
        top: Math.min(y1, y2),
        bottom: Math.max(y1, y2),
    });
}

/**
 * Checks whether a value is a range created by {@link createRange}.
 *
 * @param range The value to check.
 * @returns `true` if the value is a frozen object with every {@link Range} property.
 */
export function isRange(range: unknown): range is Range {
    return (
        range != undefined &&
        typeof range === "object" &&
        Object.isFrozen(range) &&
        "x1" in range &&
        "x2" in range &&
        "y1" in range &&
        "y2" in range &&
        "left" in range &&
        "right" in range &&
        "top" in range &&
        "bottom" in range
    );
}

/**
 * Checks whether one range lies entirely inside another.
 *
 * @param range The outer range.
 * @param containsRange The range that may be inside it.
 * @returns `true` if every cell of `containsRange` is also in `range`.
 */
export function rangeContains(range: Range, containsRange: Range): boolean {
    return (
        containsRange.left >= range.left &&
        containsRange.right <= range.right &&
        containsRange.top >= range.top &&
        containsRange.bottom <= range.bottom
    );
}

/**
 * Checks whether a column lies between a range's first and last columns.
 *
 * @param range The range to check.
 * @param index The column index.
 * @returns `true` if `left <= index <= right`.
 */
export function rangeContainsColumn(range: Range, index: number): boolean {
    return index >= range.left && index <= range.right;
}

/**
 * Checks whether a row lies between a range's first and last rows.
 *
 * @param range The range to check.
 * @param index The row index.
 * @returns `true` if `top <= index <= bottom`.
 */
export function rangeContainsRow(range: Range, index: number): boolean {
    return index >= range.top && index <= range.bottom;
}

/**
 * Checks whether two ranges share at least one cell.
 *
 * @param range The first range.
 * @param intersectingRange The second range.
 * @returns `true` if the ranges overlap.
 */
export function rangeIntersects(range: Range, intersectingRange: Range): boolean {
    return (
        range.left <= intersectingRange.right &&
        range.right >= intersectingRange.left &&
        range.top <= intersectingRange.bottom &&
        range.bottom >= intersectingRange.top
    );
}

/**
 * Checks whether a column passes through a range. Same as {@link rangeContainsColumn}.
 *
 * @param range The range to check.
 * @param index The column index.
 * @returns `true` if `left <= index <= right`.
 */
export function rangeIntersectsColumn(range: Range, index: number): boolean {
    return index >= range.left && index <= range.right;
}

/**
 * Checks whether a row passes through a range. Same as {@link rangeContainsRow}.
 *
 * @param range The range to check.
 * @param index The row index.
 * @returns `true` if `top <= index <= bottom`.
 */
export function rangeIntersectsRow(range: Range, index: number): boolean {
    return index >= range.top && index <= range.bottom;
}

/**
 * Checks whether two ranges cover the same cells, whatever their direction.
 *
 * Unlike {@link rangeIdenticalTo}, the anchor and active ends may differ.
 *
 * @param range The first range.
 * @param sameAsRange The second range.
 * @returns `true` if both ranges have the same `left`, `top`, `right` and `bottom`.
 */
export function rangeSameAs(range: Range, sameAsRange: Range): boolean {
    return (
        sameAsRange.left === range.left &&
        sameAsRange.top === range.top &&
        sameAsRange.right === range.right &&
        sameAsRange.bottom === range.bottom
    );
}

/**
 * Checks whether two ranges have the same anchor and the same active end.
 *
 * Unlike {@link rangeSameAs}, a range and its reverse are not identical.
 *
 * @param range The first range.
 * @param identicalToRange The second range.
 * @returns `true` if both ranges have the same `x1`, `y1`, `x2` and `y2`.
 */
export function rangeIdenticalTo(range: Range, identicalToRange: Range): boolean {
    return (
        identicalToRange.x1 === range.x1 &&
        identicalToRange.y1 === range.y1 &&
        identicalToRange.x2 === range.x2 &&
        identicalToRange.y2 === range.y2
    );
}

/**
 * Yields every cell in a range, row by row from the top left.
 *
 * @param range The range to iterate.
 * @returns A generator of points, where `x` is the column and `y` is the row.
 */
export function* rangeIterator(range: Range): Generator<Point, void, unknown> {
    for (let rowIndex = range.top; rowIndex <= range.bottom; rowIndex++) {
        for (let columnIndex = range.left; columnIndex <= range.right; columnIndex++) {
            yield createPoint(columnIndex, rowIndex);
        }
    }
}

/**
 * Yields one point for each column in a range, from left to right.
 *
 * @param range The range to iterate.
 * @returns A generator of points, where `x` is the column and `y` is always `-1`.
 */
export function* rangeHorizontalIterator(range: Range): Generator<Point, void, unknown> {
    for (let columnIndex = range.left; columnIndex <= range.right; columnIndex++) {
        yield createPoint(columnIndex, -1);
    }
}

/**
 * Yields one point for each row in a range, from top to bottom.
 *
 * @param range The range to iterate.
 * @returns A generator of points, where `y` is the row and `x` is always `-1`.
 */
export function* rangeVerticalIterator(range: Range): Generator<Point, void, unknown> {
    for (let rowIndex = range.top; rowIndex <= range.bottom; rowIndex++) {
        yield createPoint(-1, rowIndex);
    }
}
