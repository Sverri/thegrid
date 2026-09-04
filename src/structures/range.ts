import { createPoint, type Point } from "./point";

class Range {
    #x1: number;
    #x2: number;
    #y1: number;
    #y2: number;
    #left: number;
    #right: number;
    #top: number;
    #bottom: number;

    constructor(x1: number, y1: number, x2 = x1, y2 = y1) {
        this.#x1 = x1;
        this.#x2 = x2;
        this.#y1 = y1;
        this.#y2 = y2;
        this.#left = Math.min(x1, x2);
        this.#right = Math.max(x1, x2);
        this.#top = Math.min(y1, y2);
        this.#bottom = Math.max(y1, y2);
    }

    /**
     * The first x-coordinate of the range.
     */
    get x1() {
        return this.#x1;
    }

    /**
     * The second x-coordinate of the range.
     */
    get x2() {
        return this.#x2;
    }

    /**
     * The first y-coordinate of the range.
     */
    get y1() {
        return this.#y1;
    }

    /**
     * The second y-coordinate of the range.
     */
    get y2() {
        return this.#y2;
    }

    /**
     * The smallest x-coordinate covered by the range.
     */
    get left() {
        return this.#left;
    }

    /**
     * The largest x-coordinate covered by the range.
     */
    get right() {
        return this.#right;
    }

    /**
     * The smallest y-coordinate covered by the range.
     */
    get top() {
        return this.#top;
    }

    /**
     * The largest y-coordinate covered by the range.
     */
    get bottom() {
        return this.#bottom;
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

/**
 * Create a rectangular selection or span in grid coordinates.
 * @param x1
 * @param y1
 * @param x2
 * @param y2
 * @returns
 */
export function createRange(x1: number, y1: number, x2 = x1, y2 = y1) {
    return new Range(x1, y1, x2, y2);
}

/**
 * Find out if a value is a Range instance
 *
 * @param value
 */
export function isRange(value: unknown) {
    return value instanceof Range;
}
