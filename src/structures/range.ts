class RangeImplementation {
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
}

/**
 * Represents a rectangular selection or span in grid coordinates.
 *
 * A range is defined by two corner points (x1,y1) and (x2,y2) and exposes
 * normalized bounds such as left, right, top, and bottom. The implementation is
 * direction-agnostic, so ranges can be created in either orientation.
 */
export type Range = RangeImplementation;

/**
 * Create a rectangular selection or span in grid coordinates.
 * @param x1
 * @param y1
 * @param x2
 * @param y2
 * @returns
 */
export function createRange(x1: number, y1: number, x2 = x1, y2 = y1): Range {
    return new RangeImplementation(x1, y1, x2, y2);
}
