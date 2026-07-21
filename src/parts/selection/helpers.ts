import { createRange } from "@/parts/range";
import type { Selection } from "./types";
import { createSelection } from "./factories";

export function moveSelectionLeft(selection: Selection, count = 1) {
    const { range, grid } = selection;
    const { x2, y2 } = range;
    let newX2 = x2;
    while (count > 0) {
        const column = grid.columns.items.get(--newX2)!;
        if (!column || column.visible) {
            count--;
        }
    }
    const minX2 = 0;
    const newRange = createRange(Math.max(minX2, newX2), y2);
    return createSelection(newRange, grid);
}

export function moveSelectionRight(selection: Selection, count = 1) {
    const { range, grid } = selection;
    const { x2, y2 } = range;
    let newX2 = x2;
    while (count > 0) {
        const column = grid.columns.items.get(++newX2)!;
        if (!column || column.visible) {
            count--;
        }
    }
    const maxX2 = grid.columns.lastVisibleIndex;
    const newRange = createRange(Math.min(maxX2, newX2), y2);
    return createSelection(newRange, grid);
}

export function moveSelectionUp(selection: Selection, count = 1) {
    const { range, grid } = selection;
    const { x2, y2 } = range;
    const minY2 = 0;
    const newRange = createRange(x2, Math.max(minY2, y2 - count));
    return createSelection(newRange, grid);
}

export function moveSelectionDown(selection: Selection, count = 1) {
    const { range, grid } = selection;
    const { x2, y2 } = range;
    const maxY2 = grid.source.items.size - 1;
    const newRange = createRange(x2, Math.min(maxY2, y2 + count));
    return createSelection(newRange, grid);
}

export function expandSelectionLeft(selection: Selection, count = 1) {
    const { range, grid } = selection;
    const { x1, y1, x2, y2 } = range;
    let newX2 = x2;
    while (count > 0) {
        const column = grid.columns.items.get(--newX2)!;
        count = !column || column.visible ? count - 1 : count;
    }
    const minX2 = 0;
    const newRange = createRange(x1, y1, Math.max(minX2, newX2), y2);
    return createSelection(newRange, grid);
}

export function expandSelectionRight(selection: Selection, count = 1) {
    const { range, grid } = selection;
    const { x1, y1, x2, y2 } = range;
    let newX2 = x2;
    while (count > 0) {
        const column = grid.columns.items.get(++newX2)!;
        count = !column || column.visible ? count - 1 : count;
    }
    const maxX2 = grid.columns.lastVisibleIndex;
    const newRange = createRange(x1, y1, Math.min(maxX2, newX2), y2);
    return createSelection(newRange, grid);
}

export function expandSelectionUp(selection: Selection, count = 1) {
    const { range, grid } = selection;
    const { x1, y1, x2, y2 } = range;
    const newRange = createRange(x1, y1, x2, Math.max(0, y2 - count));
    return createSelection(newRange, grid);
}

export function expandSelectionDown(selection: Selection, count = 1) {
    const { range, grid } = selection;
    const { x1, y1, x2, y2 } = range;
    const maxRows = grid.source.items.size - 1;
    const newRange = createRange(x1, y1, x2, Math.min(maxRows, y2 + count));
    return createSelection(newRange, grid);
}
