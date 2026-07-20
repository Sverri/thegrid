import type { TheGrid } from "@/grid";

export function keyboardExtension({ cellsElement, source, selection, columns, scrollIntoView }: TheGrid) {
    cellsElement.addEventListener("keydown", event => {
        switch (event.key) {
            case "a": {
                if (event.shiftKey || event.altKey || event.metaKey) {
                    break;
                }
                if (event.ctrlKey) {
                    event.preventDefault();
                    const rowCount = source.items.size - 1;
                    const { lastVisibleIndex } = columns;
                    selection.update(0, 0, lastVisibleIndex, rowCount);
                    scrollIntoView(selection.range.x2, selection.range.y2);
                }
                break;
            }

            case "ArrowLeft": {
                if (event.ctrlKey || event.altKey || event.metaKey) {
                    break;
                }
                event.preventDefault();
                if (event.shiftKey) {
                    selection.expandLeft();
                } else {
                    selection.moveLeft();
                }
                scrollIntoView(selection.range.x2, selection.range.y2);
                break;
            }

            case "ArrowRight": {
                if (event.ctrlKey || event.altKey || event.metaKey) {
                    break;
                }
                event.preventDefault();
                if (event.shiftKey) {
                    selection.expandRight();
                } else {
                    selection.moveRight();
                }
                scrollIntoView(selection.range.x2, selection.range.y2);
                break;
            }

            case "ArrowUp": {
                if (event.ctrlKey || event.altKey || event.metaKey) {
                    break;
                }
                event.preventDefault();
                if (event.shiftKey) {
                    selection.expandUp();
                } else {
                    selection.moveUp();
                }
                scrollIntoView(selection.range.x2, selection.range.y2);
                break;
            }

            case "ArrowDown": {
                if (event.ctrlKey || event.altKey || event.metaKey) {
                    break;
                }
                event.preventDefault();
                if (event.shiftKey) {
                    selection.expandDown();
                } else {
                    selection.moveDown();
                }
                scrollIntoView(selection.range.x2, selection.range.y2);
                break;
            }

            case "Home": {
                event.preventDefault();
                if (event.ctrlKey) {
                    const { x1, y1, x2 } = selection.range;
                    const firstRowIndex = 0;
                    const newY1 = event.shiftKey ? y1 : firstRowIndex;
                    selection.update(x1, newY1, x2, firstRowIndex);
                    scrollIntoView(x2, firstRowIndex);
                } else {
                    const { x1, y1, y2 } = selection.range;
                    const firstColumnIndex = columns.firstVisibleIndex;
                    const newX1 = event.shiftKey ? x1 : firstColumnIndex;
                    selection.update(newX1, y1, firstColumnIndex, y2);
                    scrollIntoView(firstColumnIndex, y2);
                }
                break;
            }

            case "End": {
                event.preventDefault();
                if (event.ctrlKey) {
                    const { x1, y1, x2 } = selection.range;
                    const lastRowIndex = source.items.size - 1;
                    const newY1 = event.shiftKey ? y1 : lastRowIndex;
                    selection.update(x1, newY1, x2, lastRowIndex);
                    scrollIntoView(x2, lastRowIndex);
                } else {
                    const { x1, y1, y2 } = selection.range;
                    const lastColumnIndex = columns.lastVisibleIndex;
                    const newX1 = event.shiftKey ? x1 : lastColumnIndex;
                    selection.update(newX1, y1, lastColumnIndex, y2);
                    scrollIntoView(lastColumnIndex, y2);
                }
                break;
            }
        }
    });
}
