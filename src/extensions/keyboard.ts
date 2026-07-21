import type { TheGrid } from "@/grid";
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

export function keyboardExtension(grid: TheGrid) {
    grid.cellsElement.addEventListener("keydown", event => {
        const { source, columns, scrollIntoView } = grid;
        switch (event.key) {
            case "a": {
                if (event.shiftKey || event.altKey || event.metaKey) {
                    break;
                }
                if (event.ctrlKey) {
                    event.preventDefault();
                    const rowCount = source.items.size - 1;
                    const { lastVisibleIndex } = columns;
                    grid.updateSelection(data => {
                        return data.withMutations(selection => {
                            selection.set("range", createRange(0, 0, lastVisibleIndex, rowCount));
                        });
                    });
                    scrollIntoView(grid.selection.range.x2, grid.selection.range.y2);
                }
                break;
            }

            case "ArrowLeft": {
                if (event.ctrlKey || event.altKey || event.metaKey) {
                    break;
                }
                event.preventDefault();
                grid.updateSelection(data => {
                    return data.withMutations(selection => {
                        if (event.shiftKey) {
                            const { range } = expandSelectionLeft(selection);
                            selection.set("range", range);
                        } else {
                            const { range } = moveSelectionLeft(selection);
                            selection.set("range", range);
                        }
                    });
                });
                scrollIntoView(grid.selection.range.x2, grid.selection.range.y2);
                break;
            }

            case "ArrowRight": {
                if (event.ctrlKey || event.altKey || event.metaKey) {
                    break;
                }
                event.preventDefault();
                grid.updateSelection(data => {
                    return data.withMutations(selection => {
                        if (event.shiftKey) {
                            const { range } = expandSelectionRight(selection);
                            selection.set("range", range);
                        } else {
                            const { range } = moveSelectionRight(selection);
                            selection.set("range", range);
                        }
                    });
                });
                scrollIntoView(grid.selection.range.x2, grid.selection.range.y2);
                break;
            }

            case "ArrowUp": {
                if (event.ctrlKey || event.altKey || event.metaKey) {
                    break;
                }
                event.preventDefault();
                grid.updateSelection(data => {
                    return data.withMutations(selection => {
                        if (event.shiftKey) {
                            const { range } = expandSelectionUp(selection);
                            selection.set("range", range);
                        } else {
                            const { range } = moveSelectionUp(selection);
                            selection.set("range", range);
                        }
                    });
                });
                scrollIntoView(grid.selection.range.x2, grid.selection.range.y2);
                break;
            }

            case "ArrowDown": {
                if (event.ctrlKey || event.altKey || event.metaKey) {
                    break;
                }
                event.preventDefault();
                grid.updateSelection(data => {
                    return data.withMutations(selection => {
                        if (event.shiftKey) {
                            const { range } = expandSelectionDown(selection);
                            selection.set("range", range);
                        } else {
                            const { range } = moveSelectionDown(selection);
                            selection.set("range", range);
                        }
                    });
                });
                scrollIntoView(grid.selection.range.x2, grid.selection.range.y2);
                break;
            }

            case "Home": {
                event.preventDefault();
                if (event.ctrlKey) {
                    const { x1, y1, x2 } = grid.selection.range;
                    const firstRowIndex = 0;
                    const newX1 = event.shiftKey ? x1 : x2;
                    const newY1 = event.shiftKey ? y1 : firstRowIndex;
                    grid.updateSelection(data => {
                        return data.withMutations(selection => {
                            selection.set("range", createRange(newX1, newY1, x2, firstRowIndex));
                        });
                    });
                    scrollIntoView(grid.selection.range.x2, firstRowIndex);
                } else {
                    const { x1, y1, y2 } = grid.selection.range;
                    const firstColumnIndex = columns.firstVisibleIndex;
                    const newX1 = event.shiftKey ? x1 : firstColumnIndex;
                    const newY1 = event.shiftKey ? y1 : y2;
                    grid.updateSelection(data => {
                        return data.withMutations(selection => {
                            selection.set("range", createRange(newX1, newY1, firstColumnIndex, y2));
                        });
                    });
                    scrollIntoView(firstColumnIndex, grid.selection.range.y2);
                }
                break;
            }

            case "End": {
                event.preventDefault();
                if (event.ctrlKey) {
                    const { x1, y1, x2 } = grid.selection.range;
                    const lastRowIndex = source.items.size - 1;
                    const newX1 = event.shiftKey ? x1 : x2;
                    const newY1 = event.shiftKey ? y1 : lastRowIndex;
                    grid.updateSelection(data => {
                        return data.withMutations(selection => {
                            selection.set("range", createRange(newX1, newY1, x2, lastRowIndex));
                        });
                    });
                    scrollIntoView(x2, lastRowIndex);
                } else {
                    const { x1, y1, y2 } = grid.selection.range;
                    const lastColumnIndex = columns.lastVisibleIndex;
                    const newX1 = event.shiftKey ? x1 : lastColumnIndex;
                    const newY1 = event.shiftKey ? y1 : y2;
                    grid.updateSelection(data => {
                        return data.withMutations(selection => {
                            selection.set("range", createRange(newX1, newY1, lastColumnIndex, y2));
                        });
                    });
                    scrollIntoView(lastColumnIndex, y2);
                }
                break;
            }
        }
    });
}
