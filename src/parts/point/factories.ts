import type { Point } from "./types";
import { Record } from "immutable";

const PointRecord = Record<Point>({
    x: -1,
    y: -1,
});

export function createPoint(x: number, y: number) {
    return PointRecord({ x, y });
}
