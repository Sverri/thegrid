import type { DataItem } from "@shared/types";
import type { Grid } from "@grid/grid";
import { createRange, type Range } from "@structure/range";

export function moveSelectionLeft<T extends DataItem>(grid: Grid<T>, range: Range, count = 1): Range {
    const { x2, y2 } = range;
    const minX2 = 0;
    let newX2 = x2;
    while (count > 0) {
        const column = grid.columns.items.at(--newX2);
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

export function moveSelectionRight<T extends DataItem>(grid: Grid<T>, range: Range, count = 1): Range {
    const { x2, y2 } = range;
    const maxX2 = grid.columns.items.findLastIndex(column => column.visible) ?? 0;
    let newX2 = x2;
    while (count > 0) {
        const column = grid.columns.items.at(++newX2);
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

export function moveSelectionDown<T extends DataItem>(grid: Grid<T>, range: Range, count = 1): Range {
    const { x2, y2 } = range;
    const maxY2 = grid.data.length - 1;
    return createRange(x2, Math.min(maxY2, y2 + count));
}

export function expandSelectionLeft<T extends DataItem>(grid: Grid<T>, range: Range, count = 1): Range {
    const { x1, y1, x2, y2 } = range;
    const minX2 = 0;
    let newX2 = x2;
    while (count > 0) {
        const column = grid.columns.items.at(--newX2);
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

export function expandSelectionRight<T extends DataItem>(grid: Grid<T>, range: Range, count = 1): Range {
    const { x1, y1, x2, y2 } = range;
    const maxX2 = grid.columns.items.findLastIndex(column => column.visible);
    let newX2 = x2;
    while (count > 0) {
        const column = grid.columns.items.at(++newX2);
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

export function expandSelectionDown<T extends DataItem>(grid: Grid<T>, range: Range, count = 1): Range {
    const { x1, y1, x2, y2 } = range;
    const maxY2 = grid.data.length - 1;
    return createRange(x1, y1, x2, Math.min(maxY2, y2 + count));
}
