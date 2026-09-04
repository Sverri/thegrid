/**
 * Represents a two-dimensional coordinate.
 */
class Point {
    #x: number;
    #y: number;

    constructor(x: number, y: number) {
        this.#x = x;
        this.#y = y;
    }

    /**
     * Horizontal coordinate.
     */
    get x() {
        return this.#x;
    }

    /**
     * Vertical coordinate.
     */
    get y() {
        return this.#y;
    }
}

export type { Point };

/**
 * Create object representing a two-dimensional coordinate.
 */
export function createPoint(x: number, y: number) {
    return new Point(x, y);
}
/**
 * Find out if a value is a Point instance
 *
 * @param value
 */
export function isPoint(value: unknown) {
    return value instanceof Point;
}
