import type { Grid } from "@grid/grid";
import type { Disposer } from "@shared/types";
import { nextSortDirection } from "@grid/sort";

/**
 * Lets the user sort the grid by clicking column headers.
 *
 * Each click moves the column from unsorted, to ascending, to descending, and
 * back to unsorted. A plain click sorts by that column only. A click with
 * Ctrl (or Cmd on macOS) held keeps the other sorted columns, so the grid is
 * sorted by several columns, the left-most one first.
 *
 * Clicks on a resize handle, or on a column with `allowSorting` set to false,
 * do nothing. A plain click on a sortable column still clears the sorting
 * of every other column, including ones that do not allow sorting.
 *
 * @param grid The grid whose column headers should be sortable.
 * @returns A function that removes the listener.
 */
export function columnSortExtension(grid: Grid<any>): Disposer {
    const controller = new AbortController();

    grid.columnHeadersElement.addEventListener(
        "click",
        event => {
            if (event.button !== 0 || !(event.target instanceof HTMLElement)) {
                return;
            }
            if (event.target.closest(".thegrid-column-resizer")) {
                return;
            }
            const cell = event.target.closest<HTMLElement>(".thegrid-cell-column-header");
            const index = Number.parseInt(cell?.dataset["column"] ?? "", 10);
            const column = Number.isNaN(index) ? undefined : grid.columns.items.at(index);
            if (!column?.allowSorting) {
                return;
            }

            const direction = nextSortDirection(column.sortDirection);
            if (!event.ctrlKey && !event.metaKey) {
                for (const other of grid.columns.items) {
                    if (other !== column && other.sortDirection !== undefined) {
                        other.sortDirection = undefined;
                    }
                }
            }
            column.sortDirection = direction;
        },
        { signal: controller.signal },
    );

    return () => controller.abort();
}
