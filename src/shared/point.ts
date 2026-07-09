export interface Point {
    /**
     * X coordinate in 2D space
     */
    readonly x: number;

    /**
     * Y coordinate in 2D space
     */
    readonly y: number;
}

/**
 * Point represents a point in 2D space with x and y coordinates.
 */
export function createPoint(x: number, y: number): Point {
    return Object.freeze({ x, y });
}
