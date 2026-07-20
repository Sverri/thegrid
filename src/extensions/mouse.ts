import type { TheGrid } from "@/grid";

export function mouseExtension({ cellsElement, selection }: TheGrid) {
    let startCoords: { row: number; column: number } | undefined;

    cellsElement.addEventListener("mousedown", event => {
        if (
            event.button !== 0 ||
            !(event.target instanceof HTMLElement) ||
            !event.target.classList.contains("thegrid-cell")
        ) {
            return;
        }
        startCoords = {
            row: Number.parseInt(event.target!.dataset.row!, 10),
            column: Number.parseInt(event.target!.dataset.column!, 10),
        };
        selection.update(startCoords.column, startCoords.row);
    });

    cellsElement.addEventListener("mousemove", event => {
        if (event.button !== 0 || !(event.target instanceof HTMLElement) || !startCoords) {
            return;
        }
        const downRowIndex = startCoords.row;
        const downColumnIndex = startCoords.column;
        const upRowIndex = Number.parseInt(event.target.dataset.row!, 10);
        const upColumnIndex = Number.parseInt(event.target.dataset.column!, 10);
        if (
            Number.isNaN(downRowIndex) ||
            Number.isNaN(downColumnIndex) ||
            Number.isNaN(upRowIndex) ||
            Number.isNaN(upColumnIndex)
        ) {
            return;
        }
        selection.update(downColumnIndex, downRowIndex, upColumnIndex, upRowIndex);
    });

    cellsElement.addEventListener("mouseenter", () => {
        startCoords = undefined;
    });

    cellsElement.addEventListener("mouseleave", () => {
        startCoords = undefined;
    });

    cellsElement.addEventListener("mouseup", event => {
        if (event.button !== 0 || !(event.target instanceof HTMLElement)) {
            return;
        }
        const upColumnIndex = Number.parseInt(event.target.dataset.column!, 10);
        const upRowIndex = Number.parseInt(event.target.dataset.row!, 10);
        const downColumnIndex = startCoords?.column ?? upColumnIndex;
        const downRowIndex = startCoords?.row ?? upRowIndex;
        if (
            Number.isNaN(downRowIndex) ||
            Number.isNaN(downColumnIndex) ||
            Number.isNaN(upRowIndex) ||
            Number.isNaN(upColumnIndex)
        ) {
            return;
        }
        selection.update(downColumnIndex, downRowIndex, upColumnIndex, upRowIndex);
        startCoords = undefined;
    });
}
