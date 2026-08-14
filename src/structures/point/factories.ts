import type { Point } from "./types";
import { Record } from "immutable";

const factory = Record<Point>({
    x: -1,
    y: -1,
});

export function createPoint(x: number, y: number): Immutable.RecordOf<Point> {
    return factory({ x, y });
}
