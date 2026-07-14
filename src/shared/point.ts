/**
 * Represents a two-dimensional coordinate.
 *
 * Points are used throughout the grid model to describe positions in a simple
 * x/y coordinate system.
 */
export interface Point {
    /**
     * The horizontal coordinate.
     */
    readonly x: number;

    /**
     * The vertical coordinate.
     */
    readonly y: number;
}

/**
 * Creates an immutable point from x and y coordinates.
 *
 * @param x The horizontal coordinate.
 * @param y The vertical coordinate.
 * @returns A frozen point instance.
 */
export function createPoint(x: number, y: number): Point {
    return Object.freeze({ x, y });
}
