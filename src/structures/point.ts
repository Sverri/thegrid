/**
 * A two-dimensional point
 */
export interface Point {
    x: number;
    y: number;
}

/**
 * Create object representing a two-dimensional coordinate.
 */
export function createPoint(x: number, y: number): Point {
    return Object.freeze({ x, y });
}

/**
 * Is point
 *
 * @param point
 */
export function isPoint(point: unknown): point is Point {
    return point != undefined && typeof point === "object" && Object.isFrozen(point) && "x" in point && "y" in point;
}
