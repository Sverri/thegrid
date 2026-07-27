import type { TheGrid } from "@/parts/grid";
import { createRange } from "@/parts/range";
import {
    expandSelectionDown,
    expandSelectionLeft,
    expandSelectionRight,
    expandSelectionUp,
    moveSelectionDown,
    moveSelectionLeft,
    moveSelectionRight,
    moveSelectionUp,
} from "@/parts/selection";

function moveToFirst(grid: TheGrid<any>, shiftHeld: boolean, ctrlHeld: boolean) {
    if (ctrlHeld) {
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
    } else {
        const { x1, y1, y2 } = grid.selection.range;
        const firstColumnIndex = grid.columns.firstVisibleIndex;
        const newX1 = shiftHeld ? x1 : firstColumnIndex;
        const newY1 = shiftHeld ? y1 : y2;
        grid.updateSelection(data => {
            return data.withMutations(selection => {
                selection.set("range", createRange(newX1, newY1, firstColumnIndex, y2));
            });
        });
        grid.scrollIntoView(firstColumnIndex, grid.selection.range.y2);
    }
}

function moveToLast(grid: TheGrid<any>, shiftHeld: boolean, ctrlHeld: boolean) {
    if (ctrlHeld) {
        const { x1, y1, x2 } = grid.selection.range;
        const lastRowIndex = grid.source.items.size - 1;
        const newX1 = shiftHeld ? x1 : x2;
        const newY1 = shiftHeld ? y1 : lastRowIndex;
        grid.updateSelection(data => {
            return data.withMutations(selection => {
                selection.set("range", createRange(newX1, newY1, x2, lastRowIndex));
            });
        });
        grid.scrollIntoView(x2, lastRowIndex);
    } else {
        const { x1, y1, y2 } = grid.selection.range;
        const lastColumnIndex = grid.columns.lastVisibleIndex;
        const newX1 = shiftHeld ? x1 : lastColumnIndex;
        const newY1 = shiftHeld ? y1 : y2;
        grid.updateSelection(data => {
            return data.withMutations(selection => {
                selection.set("range", createRange(newX1, newY1, lastColumnIndex, y2));
            });
        });
        grid.scrollIntoView(lastColumnIndex, y2);
    }
}

function selectAll(grid: TheGrid<any>) {
    const { source, columns, scrollIntoView } = grid;
    const { lastVisibleIndex } = columns;
    const rowCount = source.items.size - 1;
    grid.updateSelection(data => {
        return data.withMutations(selection => {
            selection.set("range", createRange(0, 0, lastVisibleIndex, rowCount));
        });
    });
    scrollIntoView(grid.selection.range.x2, grid.selection.range.y2);
}

function moveLeft(grid: TheGrid<any>, shiftHeld: boolean, ctrlHeld: boolean) {
    if (ctrlHeld) {
        moveToFirst(grid, shiftHeld, false);
        return;
    }
    grid.updateSelection(data => {
        return data.withMutations(selection => {
            if (shiftHeld) {
                const { range } = expandSelectionLeft(selection);
                selection.set("range", range);
            } else {
                const { range } = moveSelectionLeft(selection);
                selection.set("range", range);
            }
        });
    });
    grid.scrollIntoView(grid.selection.range.x2, grid.selection.range.y2);
}

function moveRight(grid: TheGrid<any>, shiftHeld: boolean, ctrlHeld: boolean) {
    if (ctrlHeld) {
        moveToLast(grid, shiftHeld, false);
        return;
    }
    grid.updateSelection(data => {
        return data.withMutations(selection => {
            if (shiftHeld) {
                const { range } = expandSelectionRight(selection);
                selection.set("range", range);
            } else {
                const { range } = moveSelectionRight(selection);
                selection.set("range", range);
            }
        });
    });
    grid.scrollIntoView(grid.selection.range.x2, grid.selection.range.y2);
}

function moveUp(grid: TheGrid<any>, shiftHeld: boolean, ctrlHeld: boolean) {
    if (ctrlHeld) {
        moveToFirst(grid, shiftHeld, true);
        return;
    }
    grid.updateSelection(data => {
        return data.withMutations(selection => {
            if (shiftHeld) {
                const { range } = expandSelectionUp(selection);
                selection.set("range", range);
            } else {
                const { range } = moveSelectionUp(selection);
                selection.set("range", range);
            }
        });
    });
    grid.scrollIntoView(grid.selection.range.x2, grid.selection.range.y2);
}

function moveDown(grid: TheGrid<any>, shiftHeld: boolean, ctrlHeld: boolean) {
    if (ctrlHeld) {
        moveToLast(grid, shiftHeld, true);
        return;
    }
    grid.updateSelection(data => {
        return data.withMutations(selection => {
            if (shiftHeld) {
                const { range } = expandSelectionDown(selection);
                selection.set("range", range);
            } else {
                const { range } = moveSelectionDown(selection);
                selection.set("range", range);
            }
        });
    });
    grid.scrollIntoView(grid.selection.range.x2, grid.selection.range.y2);
}

export function keyboardExtension(grid: TheGrid<any>) {
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
                moveToFirst(grid, event.shiftKey, event.ctrlKey);
                break;
            }

            case "End": {
                event.preventDefault();
                moveToLast(grid, event.shiftKey, event.ctrlKey);
                break;
            }
        }
    });
}
