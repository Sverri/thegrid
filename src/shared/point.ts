/**
 * Point class represents a point in 2D space with x and y coordinates.
 *
 * @interface ColumnOptions
 */
export class Point {
    #x: number;
    #y: number;

    constructor(x: number, y: number) {
        this.#x = x;
        this.#y = y;
    }

    /**
     * Gets the x-coordinate of the point.
     *
     * @returns The x-coordinate value
     */
    get x() {
        return this.#x;
    }

    /**
     * Gets the y-coordinate of the point.
     *
     * @returns The y-coordinate value
     */
    get y() {
        return this.#y;
    }
}
