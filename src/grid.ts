import type { DataItem, ExtendObject } from "@/types";
import type { ColumnOptions } from "@/structures/column";
import { List } from "immutable";
import { keyboardExtension } from "@/extensions/keyboard";
import { mouseExtension } from "@/extensions/mouse";
import { resizeObserverExtension } from "@/extensions/resizeobserver";
import { renderExtension } from "@/extensions/render";
import { expanderExtension } from "@/extensions/expander";
import { HeaderSelection } from "@/shared/enums";
import { createColumn, type Column } from "@/structures/column";
import { createGridData, type GridData } from "@/structures/grid";
import { useInvalidator } from "@/shards/invalidator";
import { useDom } from "@/shards/dom";
import { useScroller } from "@/shards/scroller";

const DEFAULT_CELL_SIZE = 50;

export interface TheGridOptions<T extends DataItem> {
    /**
     * Source
     *
     * **Default:** `[]`
     */
    source?: ArrayLike<T>;

    /**
     * Columns
     *
     * **Default:** `[]`
     */
    columns?: ArrayLike<ColumnOptions<T>>;

    /**
     * Header selection indicator
     *
     * **Default:** {@link HeaderSelection.Both}
     */
    showHeaderSelection?: HeaderSelection;

    /**
     * Cell size
     */
    cellSize?: number;
}

export function createGrid<T extends DataItem>(hostElement: HTMLElement, options?: TheGridOptions<T>) {
    let grid = createGridData<T>().withMutations(data => {
        const columns = List<Column<T>>(Array.from(options?.columns ?? []).map(data => createColumn(data)));
        data.set("columns", columns);
        if (options?.source) {
            data.set("source", List(options.source));
        }
        if (options?.showHeaderSelection) {
            data.set("showHeaderSelection", options.showHeaderSelection);
        }
        data.set("cellSize", options?.cellSize ?? DEFAULT_CELL_SIZE);
    });

    const { cellsElement, columnHeadersElement, rowHeadersElement } = useDom(hostElement, grid.cellSize);
    const { onInvalidate, invalidate } = useInvalidator();
    const { scrollIntoView } = useScroller({
        get grid() {
            return grid;
        },
        get cellsElement() {
            return cellsElement;
        },
    });
    const showHeaderSelection = options?.showHeaderSelection ?? HeaderSelection.Both;

    const modify = (callback: (grid: Immutable.RecordOf<GridData<T>>) => Immutable.RecordOf<GridData<T>>) => {
        grid = callback(grid);
        invalidate(true);
    };

    const getCellData = <DT>(columnIndex: number, rowIndex: number): DT | undefined => {
        const row = grid.source.get(rowIndex);
        if (!row) {
            return undefined;
        }
        const column = grid.columns.get(columnIndex);
        if (!column) {
            return undefined;
        }
        return row[column.binding];
    };

    const extend = (callback: (meta: ExtendObject<T>) => void): void => {
        callback({
            get grid() {
                return grid;
            },
            get hostElement() {
                return hostElement;
            },
            get cellsElement() {
                return cellsElement;
            },
            get columnHeadersElement() {
                return columnHeadersElement;
            },
            get rowHeadersElement() {
                return rowHeadersElement;
            },
            modify,
            invalidate,
            scrollIntoView,
            getCellData,
            extend,
            get cellSize() {
                return grid.cellSize;
            },
            get onInvalidate() {
                return onInvalidate;
            },
            get showHeaderSelection() {
                return showHeaderSelection;
            },
        });
    };

    // Official extensions
    extend(expanderExtension);
    extend(renderExtension);
    extend(mouseExtension);
    extend(keyboardExtension);
    extend(resizeObserverExtension);

    // Kick off rendering
    invalidate(true);

    return Object.freeze({
        get hostElement() {
            return hostElement;
        },
        get cellsElement() {
            return cellsElement;
        },
        get columnHeadersElement() {
            return columnHeadersElement;
        },
        get rowHeadersElement() {
            return rowHeadersElement;
        },
        get grid() {
            return grid;
        },
        get cellSize() {
            return grid.cellSize;
        },
        get onInvalidate() {
            return onInvalidate;
        },
        get showHeaderSelection() {
            return showHeaderSelection;
        },
        invalidate,
        scrollIntoView,
        getCellData,
        extend,
        modify,
    });
}
