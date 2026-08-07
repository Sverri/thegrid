import { Record } from "immutable";

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

const PointRecord = Record<Point>({
    x: -1,
    y: -1,
});

export function createPoint(x: number, y: number): Immutable.RecordOf<Point> {
    return PointRecord({ x, y });
}
