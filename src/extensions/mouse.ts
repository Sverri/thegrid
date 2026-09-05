import type { Grid } from "@grid/grid";
import { createRange } from "@structure/range";

interface CellCoordinates {
    row: number;
    column: number;
}

function getCellCoordinates(target: EventTarget | null): CellCoordinates | undefined {
    if (!(target instanceof HTMLElement)) {
        return undefined;
    }

    const cell = target.closest<HTMLElement>(".thegrid-cell");
    if (!cell) {
        return undefined;
    }

    const row = Number.parseInt(cell.dataset["row"] ?? "", 10);
    const column = Number.parseInt(cell.dataset["column"] ?? "", 10);
    if (Number.isNaN(row) || Number.isNaN(column)) {
        return undefined;
    }

    return { row, column };
}

/**
 * Registers mouse selection handling for the grid's cells element.
 *
 * Primary-button events select cells, extend selections while dragging, and
 * preserve the current selection anchor when Shift is held.
 *
 * @param grid The grid whose cells element and selection should be controlled.
 */
export function mouseExtension(grid: Grid<any>): void {
    let startCoords: CellCoordinates | undefined;

    grid.cellsElement.addEventListener("mousedown", event => {
        if (event.button !== 0) {
            return;
        }

        const cellCoordinates = getCellCoordinates(event.target);
        if (!cellCoordinates) {
            return;
        }

        if (event.shiftKey) {
            const { x1, y1 } = grid.selection.range;
            startCoords = { row: y1, column: x1 };
        } else {
            startCoords = cellCoordinates;
            grid.selection.select(cellCoordinates.column, cellCoordinates.row);
        }
    });

    grid.cellsElement.addEventListener("mousemove", event => {
        if ((event.buttons & 1) === 0 || !startCoords) {
            return;
        }

        const downRowIndex = startCoords.row;
        const downColumnIndex = startCoords.column;
        const cellCoordinates = getCellCoordinates(event.target);
        if (!cellCoordinates) {
            return;
        }

        const { row: upRowIndex, column: upColumnIndex } = cellCoordinates;
        const oldRange = grid.selection.range;
        const newRange = createRange(downColumnIndex, downRowIndex, upColumnIndex, upRowIndex);
        if (!newRange.identicalTo(oldRange)) {
            grid.selection.select(newRange);
        }
    });

    grid.cellsElement.addEventListener("mouseenter", () => {
        startCoords = undefined;
    });

    grid.cellsElement.addEventListener("mouseleave", () => {
        startCoords = undefined;
    });

    grid.cellsElement.addEventListener("mouseup", event => {
        if (event.button !== 0) {
            return;
        }

        const cellCoordinates = getCellCoordinates(event.target);
        if (!cellCoordinates) {
            return;
        }

        const { row: upRowIndex, column: upColumnIndex } = cellCoordinates;
        const downColumnIndex = startCoords?.column ?? upColumnIndex;
        const downRowIndex = startCoords?.row ?? upRowIndex;
        grid.selection.select(downColumnIndex, downRowIndex, upColumnIndex, upRowIndex);

        startCoords = undefined;
    });
}
