import type { Range } from "./types";
import { createPoint } from "@/parts/point";

export function rangeContains(range: Range, containsRange: Range) {
    return (
        containsRange.left >= range.left &&
        containsRange.right <= range.right &&
        containsRange.top >= range.top &&
        containsRange.bottom <= range.bottom
    );
}

export function rangeContainsColumn(range: Range, columnIndex: number) {
    return columnIndex >= range.left && columnIndex <= range.right;
}

export function rangeContainsRow(range: Range, rowIndex: number) {
    return rowIndex >= range.top && rowIndex <= range.bottom;
}

export function rangeIntersects(range: Range, intersectsRange: Range) {
    return (
        range.left <= intersectsRange.right &&
        range.right >= intersectsRange.left &&
        range.top <= intersectsRange.bottom &&
        range.bottom >= intersectsRange.top
    );
}

export function rangeIntersectsColumn(range: Range, columnIndex: number) {
    return columnIndex >= range.left && columnIndex <= range.right;
}

export function rangeIntersectsRow(range: Range, rowIndex: number) {
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

export function* rangeIterator(range: Range) {
    for (let rowIndex = range.top; rowIndex <= range.bottom; rowIndex++) {
        for (let columnIndex = range.left; columnIndex <= range.right; columnIndex++) {
            yield createPoint(columnIndex, rowIndex);
        }
    }
}

export function* rangeHorizontalIterator(range: Range) {
    for (let columnIndex = range.left; columnIndex <= range.right; columnIndex++) {
        yield createPoint(columnIndex, -1);
    }
}

export function* rangeVerticalIterator(range: Range) {
    for (let rowIndex = range.top; rowIndex <= range.bottom; rowIndex++) {
        yield createPoint(-1, rowIndex);
    }
}
