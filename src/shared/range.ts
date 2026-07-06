import { Point } from "./point";

export class Range {
    #point1: Point;
    #point2: Point;

    constructor(x1: number, y1: number, x2 = x1, y2 = y1) {
        this.#point1 = new Point(x1, y1);
        this.#point2 = new Point(x2, y2);
    }

    get x1(): number {
        return this.#point1.x;
    }

    get x2(): number {
        return this.#point2.x;
    }

    get y1(): number {
        return this.#point1.y;
    }

    get y2(): number {
        return this.#point2.y;
    }

    get left(): number {
        return Math.min(this.#point1.x, this.#point2.x);
    }

    get right(): number {
        return Math.max(this.#point1.x, this.#point2.x);
    }

    get top(): number {
        return Math.min(this.#point1.y, this.#point2.y);
    }

    get bottom(): number {
        return Math.max(this.#point1.y, this.#point2.y);
    }

    union(range: Range): Range {
        return new Range(
            Math.min(this.left, range.left),
            Math.min(this.top, range.top),
            Math.max(this.right, range.right),
            Math.max(this.bottom, range.bottom),
        );
    }

    intersect(range: Range): Range | undefined {
        const x1 = Math.min(this.#point1.x, this.#point2.x);
        const x2 = Math.max(this.#point1.x, this.#point2.x);
        const y1 = Math.min(this.#point1.y, this.#point2.y);
        const y2 = Math.max(this.#point1.y, this.#point2.y);

        const otherX1 = Math.min(range.#point1.x, range.#point2.x);
        const otherX2 = Math.max(range.#point1.x, range.#point2.x);
        const otherY1 = Math.min(range.#point1.y, range.#point2.y);
        const otherY2 = Math.max(range.#point1.y, range.#point2.y);

        const left = Math.max(x1, otherX1);
        const top = Math.max(y1, otherY1);
        const right = Math.min(x2, otherX2);
        const bottom = Math.min(y2, otherY2);

        if (left > right || top >= bottom) {
            return undefined;
        }

        return new Range(left, top, right, bottom);
    }

    containsPoint(point: Point): boolean {
        return (
            point.x >= this.left &&
            point.x <= this.right &&
            point.y >= this.top &&
            point.y <= this.bottom
        );
    }
}
