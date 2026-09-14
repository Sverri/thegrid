/**
 * Create object representing a two-dimensional coordinate.
 */
export function createPoint(x: number, y: number) {
    return Object.freeze({
        /** X coordinate */ x,
        /** Y coordinate */ y,
    });
}
