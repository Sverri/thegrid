import type { Grid } from "@grid/grid";
import type { Column } from "@grid/column";
import type { Disposer } from "@shared/types";

interface ResizeState {
    pointerId: number;
    column: Column<any>;
    startX: number;
    startWidth: number;
}

const RESIZING_CLASS = "thegrid-resizing-column";

/**
 * Lets the user resize columns by dragging the handle at the right edge of a column header.
 *
 * Columns with `allowResize` set to false are left alone, even if a handle
 * is somehow present. The new width goes through `Column.width`, so it is clamped to the column's
 * `minWidth` and `maxWidth`. Each change re-renders the grid immediately, so the
 * column follows the pointer. The pointer is captured by the column headers
 * element, because the header cells (and their handles) are rebuilt on every render.
 *
 * @param grid The grid whose column headers should be resizable.
 * @returns A function that removes the listeners and ends any resize in progress.
 */
export function columnResizeExtension(grid: Grid<any>): Disposer {
    const { columnHeadersElement, hostElement } = grid;
    const controller = new AbortController();
    const { signal } = controller;
    let state: ResizeState | undefined;

    const end = () => {
        state = undefined;
        hostElement.classList.remove(RESIZING_CLASS);
    };

    columnHeadersElement.addEventListener(
        "pointerdown",
        event => {
            if (event.button !== 0 || !(event.target instanceof HTMLElement)) {
                return;
            }
            const handle = event.target.closest<HTMLElement>(".thegrid-column-resizer");
            const cell = handle?.closest<HTMLElement>(".thegrid-cell");
            if (!cell) {
                return;
            }
            const column = grid.columns.items.at(Number.parseInt(cell.dataset["column"] ?? "", 10));
            if (!column?.allowResize) {
                return;
            }

            event.preventDefault();
            state = { pointerId: event.pointerId, column, startX: event.clientX, startWidth: column.width };
            columnHeadersElement.setPointerCapture?.(event.pointerId);
            hostElement.classList.add(RESIZING_CLASS);
        },
        { signal },
    );

    columnHeadersElement.addEventListener(
        "pointermove",
        event => {
            if (!state || event.pointerId !== state.pointerId) {
                return;
            }
            const { column, startX, startWidth } = state;
            if (!column.allowResize) {
                // Turned off mid-drag
                end();
                return;
            }
            const previousWidth = column.width;
            column.width = startWidth + (event.clientX - startX);
            if (column.width !== previousWidth) {
                grid.invalidate(true);
            }
        },
        { signal },
    );

    const onPointerEnd = (event: PointerEvent) => {
        if (state && event.pointerId === state.pointerId) {
            end();
        }
    };
    columnHeadersElement.addEventListener("pointerup", onPointerEnd, { signal });
    columnHeadersElement.addEventListener("pointercancel", onPointerEnd, { signal });
    columnHeadersElement.addEventListener("lostpointercapture", onPointerEnd, { signal });

    return () => {
        controller.abort();
        end();
    };
}
