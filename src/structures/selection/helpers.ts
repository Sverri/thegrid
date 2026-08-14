import type { DataItem } from "@/types";
import type { TheGrid } from "@/objects/grid";
import { createRange, type Range } from "@/structures/range";

export function moveSelectionLeft<T extends DataItem>(
    grid: TheGrid<T>,
    range: Range,
    count = 1,
): Immutable.RecordOf<Range> {
    const { x2, y2 } = range;
    const minX2 = 0;
    let newX2 = x2;
    while (count > 0) {
        const column = grid.columns.get(--newX2)!;
        if (!column || newX2 === minX2) {
            // No more columns or already at left-most column
            break;
        }
        if (column?.visible) {
            count--;
        }
    }
    return createRange(Math.max(minX2, newX2), y2);
}

export function moveSelectionRight<T extends DataItem>(
    grid: TheGrid<T>,
    range: Range,
    count = 1,
): Immutable.RecordOf<Range> {
    const { x2, y2 } = range;
    const maxX2 = grid.columns.findLastIndex(column => column.visible) ?? 0;
    let newX2 = x2;
    while (count > 0) {
        const column = grid.columns.get(++newX2)!;
        if (!column || newX2 === maxX2) {
            // No more columns or already at right-most column
            break;
        }
        if (column?.visible) {
            count--;
        }
    }
    return createRange(Math.min(maxX2, newX2), y2);
}

export function moveSelectionUp<T extends DataItem>(
    _grid: TheGrid<T>,
    range: Range,
    count = 1,
): Immutable.RecordOf<Range> {
    const { x2, y2 } = range;
    const minY2 = 0;
    return createRange(x2, Math.max(minY2, y2 - count));
}

export function moveSelectionDown<T extends DataItem>(
    grid: TheGrid<T>,
    range: Range,
    count = 1,
): Immutable.RecordOf<Range> {
    const { x2, y2 } = range;
    const maxY2 = grid.source.size - 1;
    return createRange(x2, Math.min(maxY2, y2 + count));
}

export function expandSelectionLeft<T extends DataItem>(
    grid: TheGrid<T>,
    range: Range,
    count = 1,
): Immutable.RecordOf<Range> {
    const { x1, y1, x2, y2 } = range;
    const minX2 = 0;
    let newX2 = x2;
    while (count > 0) {
        const column = grid.columns.get(--newX2)!;
        if (!column || newX2 === minX2) {
            // No more columns or already at left-most column
            break;
        }
        if (column.visible) {
            count--;
        }
    }
    return createRange(x1, y1, Math.max(minX2, newX2), y2);
}

export function expandSelectionRight<T extends DataItem>(
    grid: TheGrid<T>,
    range: Range,
    count = 1,
): Immutable.RecordOf<Range> {
    const { x1, y1, x2, y2 } = range;
    const maxX2 = grid.columns.findLastIndex(column => column.visible);
    let newX2 = x2;
    while (count > 0) {
        const column = grid.columns.get(++newX2);
        if (!column || newX2 === maxX2) {
            // No more columns or already at right-most column
            break;
        }
        if (column.visible) {
            count--;
        }
    }
    return createRange(x1, y1, Math.min(maxX2, newX2), y2);
}

export function expandSelectionUp<T extends DataItem>(
    _grid: TheGrid<T>,
    range: Range,
    count = 1,
): Immutable.RecordOf<Range> {
    const { x1, y1, x2, y2 } = range;
    const minY2 = 0;
    return createRange(x1, y1, x2, Math.max(minY2, y2 - count));
}

export function expandSelectionDown<T extends DataItem>(
    grid: TheGrid<T>,
    range: Range,
    count = 1,
): Immutable.RecordOf<Range> {
    const { x1, y1, x2, y2 } = range;
    const maxY2 = grid.source.size - 1;
    return createRange(x1, y1, x2, Math.min(maxY2, y2 + count));
}
