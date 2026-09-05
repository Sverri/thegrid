import type { Grid } from "@grid/grid";
import { calculateRenderArea } from "@extension/shared/calculaterenderarea";

interface KeyboardEventLike {
    key: string;
    shiftKey: boolean;
    ctrlKey: boolean;
    altKey: boolean;
    metaKey: boolean;
    preventDefault(): void;
}

type Direction = "left" | "right" | "up" | "down";

function moveToEdge(grid: Grid<any>, direction: Direction, shiftHeld: boolean): void {
    const { x1, y1, x2, y2 } = grid.selection.range;
    const isHorizontal = direction === "left" || direction === "right";
    let targetIndex: number;
    switch (direction) {
        case "left": {
            targetIndex = 0;
            break;
        }
        case "right": {
            targetIndex = grid.columns.items.length - 1;
            break;
        }
        case "up": {
            targetIndex = 0;
            break;
        }
        case "down": {
            targetIndex = grid.data.size - 1;
            break;
        }
    }
    const targetX = isHorizontal ? targetIndex : x2;
    const targetY = isHorizontal ? y2 : targetIndex;
    const anchorX = shiftHeld ? x1 : targetX;
    const anchorY = shiftHeld ? y1 : targetY;

    grid.selection.select(anchorX, anchorY, targetX, targetY);
    grid.scrollIntoView(targetX, targetY);
}

function selectAll(grid: Grid<any>): void {
    const { scrollIntoView } = grid;
    const lastVisibleIndex = grid.columns.items.length - 1;
    const rowCount = grid.data.size - 1;
    grid.selection.select(0, 0, lastVisibleIndex, rowCount);
    scrollIntoView(grid.selection.range.x2, grid.selection.range.y2);
}

function moveSelection(grid: Grid<any>, direction: Direction, shiftHeld: boolean, ctrlHeld: boolean): void {
    if (ctrlHeld) {
        moveToEdge(grid, direction, shiftHeld);
        return;
    }

    if (shiftHeld) {
        switch (direction) {
            case "left":
                grid.selection.expandSelectionLeft();
                break;
            case "right":
                grid.selection.expandSelectionRight();
                break;
            case "up":
                grid.selection.expandSelectionUp();
                break;
            case "down":
                grid.selection.expandSelectionDown();
                break;
        }
    } else {
        switch (direction) {
            case "left":
                grid.selection.moveSelectionLeft();
                break;
            case "right":
                grid.selection.moveSelectionRight();
                break;
            case "up":
                grid.selection.moveSelectionUp();
                break;
            case "down":
                grid.selection.moveSelectionDown();
                break;
        }
    }

    grid.scrollIntoView(grid.selection.range.x2, grid.selection.range.y2);
}

function page(grid: Grid<any>, direction: "up" | "down", shiftHeld: boolean): void {
    const renderArea = calculateRenderArea(grid, { columns: 0, rows: 0 });
    const rowsPerPage = renderArea.bottom - renderArea.top - 1;
    if (shiftHeld) {
        if (direction === "up") {
            grid.selection.expandSelectionUp(rowsPerPage);
        } else {
            grid.selection.expandSelectionDown(rowsPerPage);
        }
    } else {
        if (direction === "up") {
            grid.selection.moveSelectionUp(rowsPerPage);
        } else {
            grid.selection.moveSelectionDown(rowsPerPage);
        }
    }
    grid.scrollIntoView(grid.selection.range.x2, grid.selection.range.y2);
}

export function handleKeyDown(grid: Grid<any>, event: KeyboardEventLike): void {
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
                moveSelection(grid, "left", event.shiftKey, event.ctrlKey);
            }
            break;
        }

        case "ArrowRight": {
            if (!(event.altKey || event.metaKey)) {
                event.preventDefault();
                moveSelection(grid, "right", event.shiftKey, event.ctrlKey);
            }
            break;
        }

        case "ArrowUp": {
            if (!(event.altKey || event.metaKey)) {
                event.preventDefault();
                moveSelection(grid, "up", event.shiftKey, event.ctrlKey);
            }
            break;
        }

        case "ArrowDown": {
            if (!(event.altKey || event.metaKey)) {
                event.preventDefault();
                moveSelection(grid, "down", event.shiftKey, event.ctrlKey);
            }
            break;
        }

        case "Home": {
            event.preventDefault();
            if (event.ctrlKey) {
                moveToEdge(grid, "up", event.shiftKey);
            } else {
                moveToEdge(grid, "left", event.shiftKey);
            }
            break;
        }

        case "End": {
            event.preventDefault();
            if (event.ctrlKey) {
                moveToEdge(grid, "down", event.shiftKey);
            } else {
                moveToEdge(grid, "right", event.shiftKey);
            }
            break;
        }

        case "PageDown": {
            if (!(event.ctrlKey || event.altKey || event.metaKey)) {
                event.preventDefault();
                page(grid, "down", event.shiftKey);
            }
            break;
        }

        case "PageUp": {
            if (!(event.ctrlKey || event.altKey || event.metaKey)) {
                event.preventDefault();
                page(grid, "up", event.shiftKey);
            }
            break;
        }
    }
}

/**
 * Registers keyboard navigation handling for the grid's cells element.
 *
 * Keydown events are forwarded to {@link handleKeyDown}, which handles
 * selection movement, expansion, paging, and grid-wide shortcuts.
 *
 * @param grid The grid whose selection and cells element should be controlled.
 */
export function keyboardExtension(grid: Grid<any>): void {
    grid.cellsElement.addEventListener("keydown", event => {
        handleKeyDown(grid, event as KeyboardEventLike);
    });
}
