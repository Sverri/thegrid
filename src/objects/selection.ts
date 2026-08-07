import type { DataItem } from "@/types";
import type { TheGrid } from "@/objects/grid";
import type { Range } from "@/objects/range";
import { createRange } from "@/objects/range";
import { Record } from "immutable";

export interface Selection {
    range: Range;
}

const selectionRecord = Record<Selection>({
    range: undefined!,
});

export function createSelection(range: Range): Immutable.RecordOf<Selection> {
    return new selectionRecord({ range });
}

export function moveSelectionLeft<T extends DataItem>(
    grid: TheGrid<T>,
    selection: Selection,
    count = 1,
): Immutable.RecordOf<Selection> {
    const { x2, y2 } = selection.range;
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
    const newRange = createRange(Math.max(minX2, newX2), y2);
    return createSelection(newRange);
}

export function moveSelectionRight<T extends DataItem>(
    grid: TheGrid<T>,
    selection: Selection,
    count = 1,
): Immutable.RecordOf<Selection> {
    const { x2, y2 } = selection.range;
    const maxX2 = grid.columns.findLast(column => column.visible)?.index ?? 0;
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
    const newRange = createRange(Math.min(maxX2, newX2), y2);
    return createSelection(newRange);
}

export function moveSelectionUp<T extends DataItem>(
    _grid: TheGrid<T>,
    selection: Selection,
    count = 1,
): Immutable.RecordOf<Selection> {
    const { x2, y2 } = selection.range;
    const minY2 = 0;
    const newRange = createRange(x2, Math.max(minY2, y2 - count));
    return createSelection(newRange);
}

export function moveSelectionDown<T extends DataItem>(
    grid: TheGrid<T>,
    selection: Selection,
    count = 1,
): Immutable.RecordOf<Selection> {
    const { x2, y2 } = selection.range;
    const maxY2 = grid.source.size - 1;
    const newRange = createRange(x2, Math.min(maxY2, y2 + count));
    return createSelection(newRange);
}

export function expandSelectionLeft<T extends DataItem>(
    grid: TheGrid<T>,
    selection: Selection,
    count = 1,
): Immutable.RecordOf<Selection> {
    const { x1, y1, x2, y2 } = selection.range;
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
    const newRange = createRange(x1, y1, Math.max(minX2, newX2), y2);
    return createSelection(newRange);
}

export function expandSelectionRight<T extends DataItem>(
    grid: TheGrid<T>,
    selection: Selection,
    count = 1,
): Immutable.RecordOf<Selection> {
    const { x1, y1, x2, y2 } = selection.range;
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
    const newRange = createRange(x1, y1, Math.min(maxX2, newX2), y2);
    return createSelection(newRange);
}

export function expandSelectionUp<T extends DataItem>(
    _grid: TheGrid<T>,
    selection: Selection,
    count = 1,
): Immutable.RecordOf<Selection> {
    const { x1, y1, x2, y2 } = selection.range;
    const minY2 = 0;
    const newRange = createRange(x1, y1, x2, Math.max(minY2, y2 - count));
    return createSelection(newRange);
}

export function expandSelectionDown<T extends DataItem>(
    grid: TheGrid<T>,
    selection: Selection,
    count = 1,
): Immutable.RecordOf<Selection> {
    const { x1, y1, x2, y2 } = selection.range;
    const maxY2 = grid.source.size - 1;
    const newRange = createRange(x1, y1, x2, Math.min(maxY2, y2 + count));
    return createSelection(newRange);
}
