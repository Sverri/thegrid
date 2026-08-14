class PointImplementation {
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

/**
 * Represents a two-dimensional coordinate.
 */
export type Point = PointImplementation;

/**
 * Create object representing a two-dimensional coordinate.
 */
export function createPoint(x: number, y: number): Point {
    return new PointImplementation(x, y);
}
