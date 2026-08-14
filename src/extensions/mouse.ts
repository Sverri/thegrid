import { createRange } from "@/structures/range";
import { rangeIdenticalTo } from "@/helpers/range";
import type { ExtendObject } from "@/types";

export function mouseExtension(meta: ExtendObject<any>): void {
    let startCoords: { row: number; column: number } | undefined;

    meta.cellsElement.addEventListener("mousedown", event => {
        if (
            event.button !== 0 ||
            !(event.target instanceof HTMLElement) ||
            !event.target.classList.contains("thegrid-cell")
        ) {
            return;
        }

        if (event.shiftKey) {
            const { x1, y1 } = meta.grid.selection;
            startCoords = {
                row: y1,
                column: x1,
            };
        } else {
            startCoords = {
                row: Number.parseInt(event.target!.dataset.row!, 10),
                column: Number.parseInt(event.target!.dataset.column!, 10),
            };
            meta.modify(data => {
                return data.set("selection", createRange(startCoords?.column ?? -1, startCoords?.row ?? -1));
            });
        }
    });

    meta.cellsElement.addEventListener("mousemove", event => {
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

        const oldRange = meta.grid.selection;
        const newRange = createRange(downColumnIndex, downRowIndex, upColumnIndex, upRowIndex);
        if (!rangeIdenticalTo(newRange, oldRange)) {
            meta.modify(data => {
                return data.set("selection", createRange(downColumnIndex, downRowIndex, upColumnIndex, upRowIndex));
            });
        }
    });

    meta.cellsElement.addEventListener("mouseenter", () => {
        startCoords = undefined;
    });

    meta.cellsElement.addEventListener("mouseleave", () => {
        startCoords = undefined;
    });

    meta.cellsElement.addEventListener("mouseup", event => {
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

        meta.modify(data => {
            return data.set("selection", createRange(downColumnIndex, downRowIndex, upColumnIndex, upRowIndex));
        });
        startCoords = undefined;
    });
}
