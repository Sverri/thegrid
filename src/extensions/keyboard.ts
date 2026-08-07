import type { TheGrid } from "@/objects/grid";
import { getElementScrollDimensions } from "@/helpers/getelementscrolldimensions";
import { createRange } from "@/objects/range";
import { calculateRenderArea } from "@/render/renderarea";
import {
    createSelection,
    expandSelectionDown,
    expandSelectionLeft,
    expandSelectionRight,
    expandSelectionUp,
    moveSelectionDown,
    moveSelectionLeft,
    moveSelectionRight,
    moveSelectionUp,
} from "@/objects/selection";

function moveToFirstColumn(grid: TheGrid<any>, shiftHeld: boolean): void {
    const { x1, y1, y2 } = grid.selection.range;
    const firstColumnIndex = grid.columns.findIndex(column => column.visible);
    const newX1 = shiftHeld ? x1 : firstColumnIndex;
    const newY1 = shiftHeld ? y1 : y2;
    grid.updateSelection(data => {
        return data.withMutations(selection => {
            selection.set("range", createRange(newX1, newY1, firstColumnIndex, y2));
        });
    });
    grid.scrollIntoView(firstColumnIndex, grid.selection.range.y2);
}

function moveToFirstRow(grid: TheGrid<any>, shiftHeld: boolean): void {
    const { x1, y1, x2 } = grid.selection.range;
    const firstRowIndex = 0;
    const newX1 = shiftHeld ? x1 : x2;
    const newY1 = shiftHeld ? y1 : firstRowIndex;
    grid.updateSelection(data => {
        return data.withMutations(selection => {
            selection.set("range", createRange(newX1, newY1, x2, firstRowIndex));
        });
    });
    grid.scrollIntoView(grid.selection.range.x2, firstRowIndex);
}

function moveToLastColumn(grid: TheGrid<any>, shiftHeld: boolean): void {
    const { x1, y1, y2 } = grid.selection.range;
    const lastColumnIndex = grid.columns.findLastIndex(column => column.visible);
    const newX1 = shiftHeld ? x1 : lastColumnIndex;
    const newY1 = shiftHeld ? y1 : y2;
    grid.updateSelection(data => {
        return data.withMutations(selection => {
            selection.set("range", createRange(newX1, newY1, lastColumnIndex, y2));
        });
    });
    grid.scrollIntoView(lastColumnIndex, y2);
}

function moveToLastRow(grid: TheGrid<any>, shiftHeld: boolean): void {
    const { x1, y1, x2 } = grid.selection.range;
    const lastRowIndex = grid.source.size - 1;
    const newX1 = shiftHeld ? x1 : x2;
    const newY1 = shiftHeld ? y1 : lastRowIndex;
    grid.updateSelection(data => {
        return data.withMutations(selection => {
            selection.set("range", createRange(newX1, newY1, x2, lastRowIndex));
        });
    });
    grid.scrollIntoView(x2, lastRowIndex);
}

function selectAll(grid: TheGrid<any>): void {
    const { source, columns, scrollIntoView } = grid;
    const lastVisibleIndex = columns.findLastIndex(column => column.visible);
    const rowCount = source.size - 1;
    grid.updateSelection(data => {
        return data.withMutations(selection => {
            selection.set("range", createRange(0, 0, lastVisibleIndex, rowCount));
        });
    });
    scrollIntoView(grid.selection.range.x2, grid.selection.range.y2);
}

function moveLeft(grid: TheGrid<any>, shiftHeld: boolean, ctrlHeld: boolean): void {
    if (ctrlHeld) {
        moveToFirstColumn(grid, shiftHeld);
        return;
    }
    grid.updateSelection(data => {
        return data.withMutations(selection => {
            if (shiftHeld) {
                const { range } = expandSelectionLeft(grid, selection);
                selection.set("range", range);
            } else {
                const { range } = moveSelectionLeft(grid, selection);
                selection.set("range", range);
            }
        });
    });
    grid.scrollIntoView(grid.selection.range.x2, grid.selection.range.y2);
}

function moveRight(grid: TheGrid<any>, shiftHeld: boolean, ctrlHeld: boolean): void {
    if (ctrlHeld) {
        moveToLastColumn(grid, shiftHeld);
        return;
    }
    grid.updateSelection(data => {
        return data.withMutations(selection => {
            if (shiftHeld) {
                const { range } = expandSelectionRight(grid, selection);
                selection.set("range", range);
            } else {
                const { range } = moveSelectionRight(grid, selection);
                selection.set("range", range);
            }
        });
    });
    grid.scrollIntoView(grid.selection.range.x2, grid.selection.range.y2);
}

function moveUp(grid: TheGrid<any>, shiftHeld: boolean, ctrlHeld: boolean): void {
    if (ctrlHeld) {
        moveToFirstRow(grid, shiftHeld);
        return;
    }
    grid.updateSelection(data => {
        return data.withMutations(selection => {
            if (shiftHeld) {
                const { range } = expandSelectionUp(grid, selection);
                selection.set("range", range);
            } else {
                const { range } = moveSelectionUp(grid, selection);
                selection.set("range", range);
            }
        });
    });
    grid.scrollIntoView(grid.selection.range.x2, grid.selection.range.y2);
}

function moveDown(grid: TheGrid<any>, shiftHeld: boolean, ctrlHeld: boolean): void {
    if (ctrlHeld) {
        moveToLastRow(grid, shiftHeld);
        return;
    }
    grid.updateSelection(data => {
        return data.withMutations(selection => {
            if (shiftHeld) {
                const { range } = expandSelectionDown(grid, selection);
                selection.set("range", range);
            } else {
                const { range } = moveSelectionDown(grid, selection);
                selection.set("range", range);
            }
        });
    });
    grid.scrollIntoView(grid.selection.range.x2, grid.selection.range.y2);
}

function pageDown(grid: TheGrid<any>, shiftHeld: boolean): void {
    const dimensions = getElementScrollDimensions(grid.cellsElement);
    const renderArea = calculateRenderArea({ grid, renderAhead: { columns: 0, rows: 0 }, dimensions });
    grid.updateSelection(() => {
        const rowsPerPage = renderArea.bottom - renderArea.top - 1;
        const newSelection = shiftHeld
            ? expandSelectionDown(grid, grid.selection, rowsPerPage)
            : moveSelectionDown(grid, grid.selection, rowsPerPage);
        return createSelection(newSelection.range);
    });
    grid.scrollIntoView(grid.selection.range.x2, grid.selection.range.y2);
}

function pageUp(grid: TheGrid<any>, shiftHeld: boolean): void {
    const dimensions = getElementScrollDimensions(grid.cellsElement);
    const renderArea = calculateRenderArea({ grid, renderAhead: { columns: 0, rows: 0 }, dimensions });
    grid.updateSelection(() => {
        const rowsPerPage = renderArea.bottom - renderArea.top - 1;
        const newSelection = shiftHeld
            ? expandSelectionUp(grid, grid.selection, rowsPerPage)
            : moveSelectionUp(grid, grid.selection, rowsPerPage);
        return createSelection(newSelection.range);
    });
    grid.scrollIntoView(grid.selection.range.x2, grid.selection.range.y2);
}

export function keyboardExtension(grid: TheGrid<any>): void {
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
