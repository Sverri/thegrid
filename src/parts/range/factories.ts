import type { Range } from "./types";
import { Record } from "immutable";

const RangeRecord = Record<Range>({
    x1: -1,
    y1: -1,
    x2: -1,
    y2: -1,
    left: -1,
    right: -1,
    top: -1,
    bottom: -1,
});

export function createRange(x1: number, y1: number, x2 = x1, y2 = y1) {
    const left = Math.min(x1, x2);
    const right = Math.max(x1, x2);
    const top = Math.min(y1, y2);
    const bottom = Math.max(y1, y2);
    return new RangeRecord({ x1, y1, x2, y2, left, right, top, bottom });
}
