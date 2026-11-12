/**
 * A cell coordinate.
 *
 * Create points with {@link createPoint}, which freezes them.
 */
export interface Point {
    /**
     * The column index.
     */
    x: number;

    /**
     * The row index.
     */
    y: number;
}

/**
 * Creates a frozen point.
 *
 * @param x The column index.
 * @param y The row index.
 * @returns A frozen point.
 */
export function createPoint(x: number, y: number): Point {
    return Object.freeze({ x, y });
}

/**
 * Checks whether a value is a point created by {@link createPoint}.
 *
 * @param point The value to check.
 * @returns `true` if the value is a frozen object with `x` and `y` properties.
 */
export function isPoint(point: unknown): point is Point {
    return point != undefined && typeof point === "object" && Object.isFrozen(point) && "x" in point && "y" in point;
}
