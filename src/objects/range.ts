import { createPoint, type Point } from "@/objects/point";
import { Record } from "immutable";

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
}

const RangeRecord = Record<Range>({
    x1: -1,
    y1: -1,
    x2: -1,
    y2: -1,
    left: -1,
    right: -1,
    top: -1,
    bottom: -1,
});

export function createRange(x1: number, y1: number, x2 = x1, y2 = y1): Immutable.RecordOf<Range> {
    const left = Math.min(x1, x2);
    const right = Math.max(x1, x2);
    const top = Math.min(y1, y2);
    const bottom = Math.max(y1, y2);
    return new RangeRecord({ x1, y1, x2, y2, left, right, top, bottom });
}

export function rangeContains(range: Range, containsRange: Range): boolean {
    return (
        containsRange.left >= range.left &&
        containsRange.right <= range.right &&
        containsRange.top >= range.top &&
        containsRange.bottom <= range.bottom
    );
}

export function rangeContainsColumn(range: Range, columnIndex: number): boolean {
    return columnIndex >= range.left && columnIndex <= range.right;
}

export function rangeContainsRow(range: Range, rowIndex: number): boolean {
    return rowIndex >= range.top && rowIndex <= range.bottom;
}

export function rangeIntersects(range: Range, intersectsRange: Range): boolean {
    return (
        range.left <= intersectsRange.right &&
        range.right >= intersectsRange.left &&
        range.top <= intersectsRange.bottom &&
        range.bottom >= intersectsRange.top
    );
}

export function rangeIntersectsColumn(range: Range, columnIndex: number): boolean {
    return columnIndex >= range.left && columnIndex <= range.right;
}

export function rangeIntersectsRow(range: Range, rowIndex: number): boolean {
    return rowIndex >= range.top && rowIndex <= range.bottom;
}

export function rangeSameAs(range: Range, sameAsRange: Range): boolean {
    return (
        sameAsRange.left === range.left &&
        sameAsRange.top === range.top &&
        sameAsRange.right === range.right &&
        sameAsRange.bottom === range.bottom
    );
}

export function rangeIdenticalTo(range: Range, identicalToRange: Range): boolean {
    return (
        identicalToRange.x1 === range.x1 &&
        identicalToRange.y1 === range.y1 &&
        identicalToRange.x2 === range.x2 &&
        identicalToRange.y2 === range.y2
    );
}

export function* rangeIterator(range: Range): Generator<Immutable.RecordOf<Point>, void, unknown> {
    for (let rowIndex = range.top; rowIndex <= range.bottom; rowIndex++) {
        for (let columnIndex = range.left; columnIndex <= range.right; columnIndex++) {
            yield createPoint(columnIndex, rowIndex);
        }
    }
}

export function* rangeHorizontalIterator(range: Range): Generator<Immutable.RecordOf<Point>, void, unknown> {
    for (let columnIndex = range.left; columnIndex <= range.right; columnIndex++) {
        yield createPoint(columnIndex, -1);
    }
}

export function* rangeVerticalIterator(range: Range): Generator<Immutable.RecordOf<Point>, void, unknown> {
    for (let rowIndex = range.top; rowIndex <= range.bottom; rowIndex++) {
        yield createPoint(-1, rowIndex);
    }
}
