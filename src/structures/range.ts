import { createPoint, type Point } from "./point";

class Range {
    readonly x1: number;
    readonly x2: number;
    readonly y1: number;
    readonly y2: number;
    readonly left: number;
    readonly right: number;
    readonly top: number;
    readonly bottom: number;

    constructor(x1: number, y1: number, x2 = x1, y2 = y1) {
        this.x1 = x1;
        this.x2 = x2;
        this.y1 = y1;
        this.y2 = y2;
        this.left = Math.min(x1, x2);
        this.right = Math.max(x1, x2);
        this.top = Math.min(y1, y2);
        this.bottom = Math.max(y1, y2);
    }

    contains(range: Range): boolean {
        return (
            range.left >= this.left && range.right <= this.right && range.top >= this.top && range.bottom <= this.bottom
        );
    }

    containsColumn(index: number): boolean {
        return index >= this.left && index <= this.right;
    }

    containsRow(index: number): boolean {
        return index >= this.top && index <= this.bottom;
    }

    intersects(range: Range): boolean {
        return (
            this.left <= range.right && this.right >= range.left && this.top <= range.bottom && this.bottom >= range.top
        );
    }

    intersectsColumn(index: number): boolean {
        return index >= this.left && index <= this.right;
    }

    intersectsRow(index: number): boolean {
        return index >= this.top && index <= this.bottom;
    }

    sameAs(range: Range): boolean {
        return (
            range.left === this.left &&
            range.top === this.top &&
            range.right === this.right &&
            range.bottom === this.bottom
        );
    }

    identicalTo(range: Range): boolean {
        return range.x1 === this.x1 && range.y1 === this.y1 && range.x2 === this.x2 && range.y2 === this.y2;
    }

    *iterator(): Generator<Point, void, unknown> {
        for (let rowIndex = this.top; rowIndex <= this.bottom; rowIndex++) {
            for (let columnIndex = this.left; columnIndex <= this.right; columnIndex++) {
                yield createPoint(columnIndex, rowIndex);
            }
        }
    }

    *horizontalIterator(): Generator<Point, void, unknown> {
        for (let columnIndex = this.left; columnIndex <= this.right; columnIndex++) {
            yield createPoint(columnIndex, -1);
        }
    }

    *verticalIterator(): Generator<Point, void, unknown> {
        for (let rowIndex = this.top; rowIndex <= this.bottom; rowIndex++) {
            yield createPoint(-1, rowIndex);
        }
    }
}

/**
 * Represents a rectangular selection or span in grid coordinates.
 *
 * A range is defined by two corner points (x1,y1) and (x2,y2) and exposes
 * normalized bounds such as left, right, top, and bottom. The implementation is
 * direction-agnostic, so ranges can be created in either orientation.
 */
export type { Range };

export function createRange(range: Range): Range;
export function createRange(x1: number, y1: number): Range;
export function createRange(x1: number, y1: number, x2: number, y2: number): Range;
export function createRange(x1: Range | number, y1?: number, x2 = x1, y2 = y1): Range {
    let range: Range;
    switch (arguments.length) {
        case 1: {
            if (!isRange(x1)) {
                throw new Error("Invalid range");
            }
            range = new Range(x1.x1, x1.y1, x1.x2, x1.y2);
            break;
        }
        case 2: {
            range = new Range(x1 as number, y1!, x1 as number, y1);
            break;
        }
        case 4: {
            range = new Range(x1 as number, y1!, x2 as number, y2);
            break;
        }
        default: {
            throw new Error("Was not able to create a range from providede arguments");
        }
    }
    return Object.freeze(range);
}

/**
 * Find out if a value is a Range instance
 *
 * @param value
 */
export function isRange(value: unknown): value is Range {
    return value instanceof Range;
}
