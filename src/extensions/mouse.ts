import type { TheGrid } from "@/grid";
import { createRange } from "@/parts/range";

export function mouseExtension(grid: TheGrid<any>) {
    let startCoords: { row: number; column: number } | undefined;

    grid.cellsElement.addEventListener("mousedown", event => {
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
        grid.updateSelection(data => {
            return data.withMutations(selection => {
                selection.set("range", createRange(startCoords?.column ?? -1, startCoords?.row ?? -1));
            });
        });
    });

    grid.cellsElement.addEventListener("mousemove", event => {
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
        grid.updateSelection(data => {
            return data.withMutations(selection => {
                selection.set("range", createRange(downColumnIndex, downRowIndex, upColumnIndex, upRowIndex));
            });
        });
    });

    grid.cellsElement.addEventListener("mouseenter", () => {
        startCoords = undefined;
    });

    grid.cellsElement.addEventListener("mouseleave", () => {
        startCoords = undefined;
    });

    grid.cellsElement.addEventListener("mouseup", event => {
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
        grid.updateSelection(data => {
            return data.withMutations(selection => {
                selection.set("range", createRange(downColumnIndex, downRowIndex, upColumnIndex, upRowIndex));
            });
        });
        startCoords = undefined;
    });
}
