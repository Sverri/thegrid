/**
 * Represents a two-dimensional coordinate.
 */
class Point {
    readonly x: number;
    readonly y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}

export type { Point };

/**
 * Create object representing a two-dimensional coordinate.
 */
export function createPoint(x: number, y: number): Readonly<Point> {
    return Object.freeze(new Point(x, y));
}

/**
 * Find out if a value is a Point instance
 *
 * @param value
 */
export function isPoint(value: unknown): value is Point {
    return value instanceof Point;
}
