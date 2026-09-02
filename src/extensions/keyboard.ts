import { getElementScrollDimensions } from "@helpers/getelementscrolldimensions";
import { createRange } from "@structure/range";
import { calculateRenderArea } from "@extension/shared/calculaterenderarea";
import {
    expandSelectionDown,
    expandSelectionLeft,
    expandSelectionRight,
    expandSelectionUp,
    moveSelectionDown,
    moveSelectionLeft,
    moveSelectionRight,
    moveSelectionUp,
} from "@helpers/selection";
import type { Grid } from "../grid";

function moveToFirstColumn(grid: Grid<any>, shiftHeld: boolean): void {
    const { x1, y1, y2 } = grid.selection;
    const firstColumnIndex = grid.columns.items.findIndex(column => column.visible);
    const newX1 = shiftHeld ? x1 : firstColumnIndex;
    const newY1 = shiftHeld ? y1 : y2;
    grid.selection = createRange(newX1, newY1, firstColumnIndex, y2);
    grid.scrollIntoView(firstColumnIndex, grid.selection.y2);
}

function moveToFirstRow(grid: Grid<any>, shiftHeld: boolean): void {
    const { x1, y1, x2 } = grid.selection;
    const firstRowIndex = 0;
    const newX1 = shiftHeld ? x1 : x2;
    const newY1 = shiftHeld ? y1 : firstRowIndex;
    grid.selection = createRange(newX1, newY1, x2, firstRowIndex);
    grid.scrollIntoView(grid.selection.x2, firstRowIndex);
}

function moveToLastColumn(grid: Grid<any>, shiftHeld: boolean): void {
    const { x1, y1, y2 } = grid.selection;
    const lastColumnIndex = grid.columns.items.findLastIndex(column => column.visible);
    const newX1 = shiftHeld ? x1 : lastColumnIndex;
    const newY1 = shiftHeld ? y1 : y2;
    grid.selection = createRange(newX1, newY1, lastColumnIndex, y2);
    grid.scrollIntoView(lastColumnIndex, y2);
}

function moveToLastRow(grid: Grid<any>, shiftHeld: boolean): void {
    const { x1, y1, x2 } = grid.selection;
    const lastRowIndex = grid.source.length - 1;
    const newX1 = shiftHeld ? x1 : x2;
    const newY1 = shiftHeld ? y1 : lastRowIndex;
    grid.selection = createRange(newX1, newY1, x2, lastRowIndex);
    grid.scrollIntoView(x2, lastRowIndex);
}

function selectAll(grid: Grid<any>): void {
    const { scrollIntoView } = grid;
    const lastVisibleIndex = grid.columns.items.findLastIndex(column => column.visible);
    const rowCount = grid.source.length - 1;
    grid.selection = createRange(0, 0, lastVisibleIndex, rowCount);
    scrollIntoView(grid.selection.x2, grid.selection.y2);
}

function moveLeft(grid: Grid<any>, shiftHeld: boolean, ctrlHeld: boolean): void {
    if (ctrlHeld) {
        moveToFirstColumn(grid, shiftHeld);
        return;
    }
    if (shiftHeld) {
        grid.selection = expandSelectionLeft(grid, grid.selection);
    } else {
        grid.selection = moveSelectionLeft(grid, grid.selection);
    }
    grid.scrollIntoView(grid.selection.x2, grid.selection.y2);
}

function moveRight(grid: Grid<any>, shiftHeld: boolean, ctrlHeld: boolean): void {
    if (ctrlHeld) {
        moveToLastColumn(grid, shiftHeld);
        return;
    }
    if (shiftHeld) {
        grid.selection = expandSelectionRight(grid, grid.selection);
    } else {
        grid.selection = moveSelectionRight(grid, grid.selection);
    }
    grid.scrollIntoView(grid.selection.x2, grid.selection.y2);
}

function moveUp(grid: Grid<any>, shiftHeld: boolean, ctrlHeld: boolean): void {
    if (ctrlHeld) {
        moveToFirstRow(grid, shiftHeld);
        return;
    }
    if (shiftHeld) {
        grid.selection = expandSelectionUp(grid, grid.selection);
    } else {
        grid.selection = moveSelectionUp(grid, grid.selection);
    }
    grid.scrollIntoView(grid.selection.x2, grid.selection.y2);
}

function moveDown(grid: Grid<any>, shiftHeld: boolean, ctrlHeld: boolean): void {
    if (ctrlHeld) {
        moveToLastRow(grid, shiftHeld);
        return;
    }
    if (shiftHeld) {
        grid.selection = expandSelectionDown(grid, grid.selection);
    } else {
        grid.selection = moveSelectionDown(grid, grid.selection);
    }
    grid.scrollIntoView(grid.selection.x2, grid.selection.y2);
}

function pageDown(grid: Grid<any>, shiftHeld: boolean): void {
    const dimensions = getElementScrollDimensions(grid.cellsElement);
    const renderArea = calculateRenderArea({ grid, dimensions, renderAhead: { columns: 0, rows: 0 } });
    const rowsPerPage = renderArea.bottom - renderArea.top - 1;
    if (shiftHeld) {
        grid.selection = expandSelectionDown(grid, grid.selection, rowsPerPage);
    } else {
        grid.selection = moveSelectionDown(grid, grid.selection, rowsPerPage);
    }
    grid.scrollIntoView(grid.selection.x2, grid.selection.y2);
}

function pageUp(grid: Grid<any>, shiftHeld: boolean): void {
    const dimensions = getElementScrollDimensions(grid.cellsElement);
    const renderArea = calculateRenderArea({ grid, dimensions, renderAhead: { columns: 0, rows: 0 } });
    const rowsPerPage = renderArea.bottom - renderArea.top - 1;
    if (shiftHeld) {
        grid.selection = expandSelectionUp(grid, grid.selection, rowsPerPage);
    } else {
        grid.selection = moveSelectionUp(grid, grid.selection, rowsPerPage);
    }
    grid.scrollIntoView(grid.selection.x2, grid.selection.y2);
}

export function keyboardExtension(grid: Grid<any>): void {
    grid.cellsElement.addEventListener("keydown", event => {
        switch (event.key) {
            case "a": {
                if (event.ctrlKey && !(event.shiftKey || event.altKey || event.metaKey)) {
                    event.preventDefault();
                    selectAll(grid);
                }
                break;
            }

            case "ArrowLeft": {
                if (!(event.altKey || event.metaKey)) {
                    event.preventDefault();
                    moveLeft(grid, event.shiftKey, event.ctrlKey);
                }
                break;
            }

            case "ArrowRight": {
                if (!(event.altKey || event.metaKey)) {
                    event.preventDefault();
                    moveRight(grid, event.shiftKey, event.ctrlKey);
                }
                break;
            }

            case "ArrowUp": {
                if (!(event.altKey || event.metaKey)) {
                    event.preventDefault();
                    moveUp(grid, event.shiftKey, event.ctrlKey);
                }
                break;
            }

            case "ArrowDown": {
                if (!(event.altKey || event.metaKey)) {
                    event.preventDefault();
                    moveDown(grid, event.shiftKey, event.ctrlKey);
                }
                break;
            }

            case "Home": {
                event.preventDefault();
                if (event.ctrlKey) {
                    moveToFirstRow(grid, event.shiftKey);
                } else {
                    moveToFirstColumn(grid, event.shiftKey);
                }
                break;
            }

            case "End": {
                event.preventDefault();
                if (event.ctrlKey) {
                    moveToLastRow(grid, event.shiftKey);
                } else {
                    moveToLastColumn(grid, event.shiftKey);
                }
                break;
            }

            case "PageDown": {
                if (!(event.ctrlKey || event.altKey || event.metaKey)) {
                    event.preventDefault();
                    pageDown(grid, event.shiftKey);
                }
                break;
            }

            case "PageUp": {
                if (!(event.ctrlKey || event.altKey || event.metaKey)) {
                    event.preventDefault();
                    pageUp(grid, event.shiftKey);
                }
                break;
            }
        }
    });
}
