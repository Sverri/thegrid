/**
 * Represents a rectangular selection or span in grid coordinates.
 *
 * A range is defined by two corner points (x1,y1) and (x2,y2) and exposes
 * normalized bounds such as left, right, top, and bottom. The implementation is
 * direction-agnostic, so ranges can be created in either orientation.
 */
export interface Range {
    /**
     * The first x-coordinate of the range.
     */
    readonly x1: number;

    /**
     * The second x-coordinate of the range.
     */
    readonly x2: number;

    /**
     * The first y-coordinate of the range.
     */
    readonly y1: number;

    /**
     * The second y-coordinate of the range.
     */
    readonly y2: number;

    /**
     * The smallest x-coordinate covered by the range.
     */
    readonly left: number;

    /**
     * The largest x-coordinate covered by the range.
     */
    readonly right: number;

    /**
     * The smallest y-coordinate covered by the range.
     */
    readonly top: number;

    /**
     * The largest y-coordinate covered by the range.
     */
    readonly bottom: number;
}
