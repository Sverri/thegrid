import type { DataItem } from "@shared/types";
import type { Grid } from "@grid/grid";
import { createRange, type Range } from "@structure/range";
import type { Column } from "@structure/column";

export function moveSelectionLeft<T extends DataItem>(columns: readonly Column<T>[], range: Range, count = 1): Range {
    const { x2, y2 } = range;
    const minX2 = 0;
    let newX2 = x2;
    while (count > 0) {
        const column = columns.at(--newX2);
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

export function moveSelectionRight<T extends DataItem>(columns: readonly Column<T>[], range: Range, count = 1): Range {
    const { x2, y2 } = range;
    const maxX2 = columns.findLastIndex(column => column.visible) ?? 0;
    let newX2 = x2;
    while (count > 0) {
        const column = columns.at(++newX2);
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

export function moveSelectionUp<T extends DataItem>(_grid: Grid<T>, range: Range, count = 1): Range {
    const { x2, y2 } = range;
    const minY2 = 0;
    return createRange(x2, Math.max(minY2, y2 - count));
}

export function moveSelectionDown(dataSize: number, range: Range, count = 1): Range {
    const { x2, y2 } = range;
    const maxY2 = dataSize - 1;
    return createRange(x2, Math.min(maxY2, y2 + count));
}

export function expandSelectionLeft<T extends DataItem>(columns: readonly Column<T>[], range: Range, count = 1): Range {
    const { x1, y1, x2, y2 } = range;
    const minX2 = 0;
    let newX2 = x2;
    while (count > 0) {
        const column = columns.at(--newX2);
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
    columns: readonly Column<T>[],
    range: Range,
    count = 1,
): Range {
    const { x1, y1, x2, y2 } = range;
    const maxX2 = columns.findLastIndex(column => column.visible);
    let newX2 = x2;
    while (count > 0) {
        const column = columns.at(++newX2);
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

export function expandSelectionUp<T extends DataItem>(_grid: Grid<T>, range: Range, count = 1): Range {
    const { x1, y1, x2, y2 } = range;
    const minY2 = 0;
    return createRange(x1, y1, x2, Math.max(minY2, y2 - count));
}

export function expandSelectionDown(dataSize: number, range: Range, count = 1): Range {
    const { x1, y1, x2, y2 } = range;
    const maxY2 = dataSize - 1;
    return createRange(x1, y1, x2, Math.min(maxY2, y2 + count));
}
