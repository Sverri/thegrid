import type { ExtendObject } from "@/types";
import { getElementScrollDimensions } from "@/helpers/getelementscrolldimensions";
import { createRange } from "@/structures/range";
import { calculateRenderArea } from "@/extensions/shared/renderarea";
import {
    expandSelectionDown,
    expandSelectionLeft,
    expandSelectionRight,
    expandSelectionUp,
    moveSelectionDown,
    moveSelectionLeft,
    moveSelectionRight,
    moveSelectionUp,
} from "@/helpers/selection";

function moveToFirstColumn(meta: ExtendObject<any>, shiftHeld: boolean): void {
    const { x1, y1, y2 } = meta.grid.selection;
    const firstColumnIndex = meta.grid.columns.findIndex(column => column.visible);
    const newX1 = shiftHeld ? x1 : firstColumnIndex;
    const newY1 = shiftHeld ? y1 : y2;
    meta.modify(data => {
        return data.set("selection", createRange(newX1, newY1, firstColumnIndex, y2));
    });
    meta.scrollIntoView(firstColumnIndex, meta.grid.selection.y2);
}

function moveToFirstRow(meta: ExtendObject<any>, shiftHeld: boolean): void {
    const { x1, y1, x2 } = meta.grid.selection;
    const firstRowIndex = 0;
    const newX1 = shiftHeld ? x1 : x2;
    const newY1 = shiftHeld ? y1 : firstRowIndex;
    meta.modify(data => {
        return data.set("selection", createRange(newX1, newY1, x2, firstRowIndex));
    });
    meta.scrollIntoView(meta.grid.selection.x2, firstRowIndex);
}

function moveToLastColumn(meta: ExtendObject<any>, shiftHeld: boolean): void {
    const { x1, y1, y2 } = meta.grid.selection;
    const lastColumnIndex = meta.grid.columns.findLastIndex(column => column.visible);
    const newX1 = shiftHeld ? x1 : lastColumnIndex;
    const newY1 = shiftHeld ? y1 : y2;
    meta.modify(data => {
        return data.set("selection", createRange(newX1, newY1, lastColumnIndex, y2));
    });
    meta.scrollIntoView(lastColumnIndex, y2);
}

function moveToLastRow(meta: ExtendObject<any>, shiftHeld: boolean): void {
    const { x1, y1, x2 } = meta.grid.selection;
    const lastRowIndex = meta.grid.source.size - 1;
    const newX1 = shiftHeld ? x1 : x2;
    const newY1 = shiftHeld ? y1 : lastRowIndex;
    meta.modify(data => {
        return data.set("selection", createRange(newX1, newY1, x2, lastRowIndex));
    });
    meta.scrollIntoView(x2, lastRowIndex);
}

function selectAll(meta: ExtendObject<any>): void {
    const { scrollIntoView } = meta;
    const lastVisibleIndex = meta.grid.columns.findLastIndex(column => column.visible);
    const rowCount = meta.grid.source.size - 1;
    meta.modify(data => {
        return data.set("selection", createRange(0, 0, lastVisibleIndex, rowCount));
    });
    scrollIntoView(meta.grid.selection.x2, meta.grid.selection.y2);
}

function moveLeft(meta: ExtendObject<any>, shiftHeld: boolean, ctrlHeld: boolean): void {
    if (ctrlHeld) {
        moveToFirstColumn(meta, shiftHeld);
        return;
    }
    meta.modify(data => {
        if (shiftHeld) {
            return data.set("selection", expandSelectionLeft(meta.grid, data.selection));
        } else {
            return data.set("selection", moveSelectionLeft(meta.grid, data.selection));
        }
    });
    meta.scrollIntoView(meta.grid.selection.x2, meta.grid.selection.y2);
}

function moveRight(meta: ExtendObject<any>, shiftHeld: boolean, ctrlHeld: boolean): void {
    if (ctrlHeld) {
        moveToLastColumn(meta, shiftHeld);
        return;
    }
    meta.modify(data => {
        if (shiftHeld) {
            return data.set("selection", expandSelectionRight(meta.grid, data.selection));
        } else {
            return data.set("selection", moveSelectionRight(meta.grid, data.selection));
        }
    });
    meta.scrollIntoView(meta.grid.selection.x2, meta.grid.selection.y2);
}

function moveUp(meta: ExtendObject<any>, shiftHeld: boolean, ctrlHeld: boolean): void {
    if (ctrlHeld) {
        moveToFirstRow(meta, shiftHeld);
        return;
    }
    meta.modify(data => {
        if (shiftHeld) {
            return data.set("selection", expandSelectionUp(meta.grid, data.selection));
        } else {
            return data.set("selection", moveSelectionUp(meta.grid, data.selection));
        }
    });
    meta.scrollIntoView(meta.grid.selection.x2, meta.grid.selection.y2);
}

function moveDown(meta: ExtendObject<any>, shiftHeld: boolean, ctrlHeld: boolean): void {
    if (ctrlHeld) {
        moveToLastRow(meta, shiftHeld);
        return;
    }
    meta.modify(data => {
        if (shiftHeld) {
            return data.set("selection", expandSelectionDown(meta.grid, data.selection));
        } else {
            return data.set("selection", moveSelectionDown(meta.grid, data.selection));
        }
    });
    meta.scrollIntoView(meta.grid.selection.x2, meta.grid.selection.y2);
}

function pageDown(meta: ExtendObject<any>, shiftHeld: boolean): void {
    const dimensions = getElementScrollDimensions(meta.cellsElement);
    const renderArea = calculateRenderArea({ grid: meta.grid, renderAhead: { columns: 0, rows: 0 }, dimensions });
    meta.modify(data => {
        const rowsPerPage = renderArea.bottom - renderArea.top - 1;
        return shiftHeld
            ? data.set("selection", expandSelectionDown(meta.grid, meta.grid.selection, rowsPerPage))
            : data.set("selection", moveSelectionDown(meta.grid, meta.grid.selection, rowsPerPage));
    });
    meta.scrollIntoView(meta.grid.selection.x2, meta.grid.selection.y2);
}

function pageUp(meta: ExtendObject<any>, shiftHeld: boolean): void {
    const dimensions = getElementScrollDimensions(meta.cellsElement);
    const renderArea = calculateRenderArea({ grid: meta.grid, renderAhead: { columns: 0, rows: 0 }, dimensions });

    meta.modify(data => {
        const rowsPerPage = renderArea.bottom - renderArea.top - 1;
        return shiftHeld
            ? data.set("selection", expandSelectionUp(meta.grid, meta.grid.selection, rowsPerPage))
            : data.set("selection", moveSelectionUp(meta.grid, meta.grid.selection, rowsPerPage));
    });

    meta.scrollIntoView(meta.grid.selection.x2, meta.grid.selection.y2);
}

export function keyboardExtension(meta: ExtendObject<any>): void {
    meta.cellsElement.addEventListener("keydown", event => {
        switch (event.key) {
            case "a": {
                if (event.ctrlKey && !(event.shiftKey || event.altKey || event.metaKey)) {
                    event.preventDefault();
                    selectAll(meta);
                }
                break;
            }

            case "ArrowLeft": {
                if (!(event.altKey || event.metaKey)) {
                    event.preventDefault();
                    moveLeft(meta, event.shiftKey, event.ctrlKey);
                }
                break;
            }

            case "ArrowRight": {
                if (!(event.altKey || event.metaKey)) {
                    event.preventDefault();
                    moveRight(meta, event.shiftKey, event.ctrlKey);
                }
                break;
            }

            case "ArrowUp": {
                if (!(event.altKey || event.metaKey)) {
                    event.preventDefault();
                    moveUp(meta, event.shiftKey, event.ctrlKey);
                }
                break;
            }

            case "ArrowDown": {
                if (!(event.altKey || event.metaKey)) {
                    event.preventDefault();
                    moveDown(meta, event.shiftKey, event.ctrlKey);
                }
                break;
            }

            case "Home": {
                event.preventDefault();
                if (event.ctrlKey) {
                    moveToFirstRow(meta, event.shiftKey);
                } else {
                    moveToFirstColumn(meta, event.shiftKey);
                }
                break;
            }

            case "End": {
                event.preventDefault();
                if (event.ctrlKey) {
                    moveToLastRow(meta, event.shiftKey);
                } else {
                    moveToLastColumn(meta, event.shiftKey);
                }
                break;
            }

            case "PageDown": {
                if (!(event.ctrlKey || event.altKey || event.metaKey)) {
                    event.preventDefault();
                    pageDown(meta, event.shiftKey);
                }
                break;
            }

            case "PageUp": {
                if (!(event.ctrlKey || event.altKey || event.metaKey)) {
                    event.preventDefault();
                    pageUp(meta, event.shiftKey);
                }
                break;
            }
        }
    });
}
