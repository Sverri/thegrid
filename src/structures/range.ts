import { createPoint, type Point } from "./point";

export interface Range {
    x1: number;
    x2: number;
    y1: number;
    y2: number;
    left: number;
    right: number;
    top: number;
    bottom: number;
}

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
 * Is range
 *
 * @param range
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

export function rangeContains(range: Range, containsRange: Range): boolean {
    return (
        containsRange.left >= range.left &&
        containsRange.right <= range.right &&
        containsRange.top >= range.top &&
        containsRange.bottom <= range.bottom
    );
}

export function rangeContainsColumn(range: Range, index: number): boolean {
    return index >= range.left && index <= range.right;
}

export function rangeContainsRow(range: Range, index: number): boolean {
    return index >= range.top && index <= range.bottom;
}

export function rangeIntersects(range: Range, intersectingRange: Range): boolean {
    return (
        range.left <= intersectingRange.right &&
        range.right >= intersectingRange.left &&
        range.top <= intersectingRange.bottom &&
        range.bottom >= intersectingRange.top
    );
}

export function rangeIntersectsColumn(range: Range, index: number): boolean {
    return index >= range.left && index <= range.right;
}

export function rangeIntersectsRow(range: Range, index: number): boolean {
    return index >= range.top && index <= range.bottom;
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

export function* rangeIterator(range: Range): Generator<Point, void, unknown> {
    for (let rowIndex = range.top; rowIndex <= range.bottom; rowIndex++) {
        for (let columnIndex = range.left; columnIndex <= range.right; columnIndex++) {
            yield createPoint(columnIndex, rowIndex);
        }
    }
}

export function* rangeHorizontalIterator(range: Range): Generator<Point, void, unknown> {
    for (let columnIndex = range.left; columnIndex <= range.right; columnIndex++) {
        yield createPoint(columnIndex, -1);
    }
}

export function* rangeVerticalIterator(range: Range): Generator<Point, void, unknown> {
    for (let rowIndex = range.top; rowIndex <= range.bottom; rowIndex++) {
        yield createPoint(-1, rowIndex);
    }
}
