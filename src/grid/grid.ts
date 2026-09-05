import type { DataItem } from "@shared/types";
import { keyboardExtension } from "@extension/keyboard";
import { mouseExtension } from "@extension/mouse";
import { resizeObserverExtension } from "@extension/resizeobserver";
import { renderExtension } from "@extension/render";
import { expanderExtension } from "@extension/expander";
import { DataType, HeaderSelection } from "@shared/enums";
import { columnFromLeft, createColumn, type Column, type ColumnOptions } from "@structure/column";
import { createEvent } from "@shared/event";
import { debounce } from "throttle-debounce";
import { getElementScrollDimensions } from "@helpers/getelementscrolldimensions";
import { createCollectionView, type CollectionView } from "@structure/collection";
import { setupDomElements } from "./setup";
import { createSelection, type Selection } from "@structure/selection";

const DEFAULT_CELL_SIZE = 50;

export interface GridOptions<T extends DataItem> {
    /**
     * Source
     *
     * **Default:** `[]`
     */
    data?: T[];

    /**
     * Columns
     *
     * **Default:** `[]`
     */
    columns?: ColumnOptions<T>[];

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

class Grid<T extends DataItem> {
    readonly hostElement: HTMLElement;
    readonly cellsElement: HTMLDivElement;
    readonly columnHeadersElement: HTMLDivElement;
    readonly rowHeadersElement: HTMLDivElement;
    readonly data: CollectionView<T>;
    readonly columns: CollectionView<ColumnOptions<T>, Column<T>>;
    readonly selection: Selection;
    readonly cellSize: number;
    #onInvalidate = createEvent<() => void>();

    #showHeaderSelection = HeaderSelection.Both;

    constructor(hostElement: HTMLElement, options?: GridOptions<T>) {
        // Miscellaneous
        this.cellSize = options?.cellSize ?? DEFAULT_CELL_SIZE;
        this.#showHeaderSelection = options?.showHeaderSelection ?? HeaderSelection.Both;

        // DOM elements
        const { cellsElement, columnHeadersElement, rowHeadersElement } = setupDomElements(hostElement, this.cellSize);
        this.hostElement = hostElement;
        this.cellsElement = cellsElement;
        this.columnHeadersElement = columnHeadersElement;
        this.rowHeadersElement = rowHeadersElement;

        // Data
        this.data = createCollectionView<T>(options?.data ?? [], {
            onChange: () => this.invalidate(),
        });

        // Columns
        this.columns = createCollectionView<ColumnOptions<T>, Column<T>>(options?.columns, {
            filter: column => column.visible,
            mapper: column => createColumn(column),
            onChange: () => this.invalidate(),
        });

        // Selection
        this.selection = createSelection(this, {
            onChange: () => this.invalidate(true),
        });

        // Extensions
        expanderExtension(this);
        renderExtension(this);
        mouseExtension(this);
        keyboardExtension(this);
        resizeObserverExtension(this);

        // Get the show on the road
        this.invalidate();
    }

    get showHeaderSelection() {
        return this.#showHeaderSelection;
    }
    set showHeaderSelection(value: HeaderSelection) {
        this.#showHeaderSelection = value;
        this.invalidate();
    }

    get onInvalidate() {
        return this.#onInvalidate.unraisable;
    }

    debouncedInvalidate = debounce(32, () => {
        this.#onInvalidate.raise();
    });

    invalidate(immediately = false) {
        if (immediately) {
            this.#onInvalidate.raise();
        } else {
            this.debouncedInvalidate();
        }
    }

    scrollIntoView = debounce(64, (columnIndex: number, rowIndex: number) => {
        const { scrollLeft, scrollRight, scrollTop, scrollBottom } = getElementScrollDimensions(this.cellsElement);
        const column = this.columns.items.at(columnIndex);
        if (!column) {
            console.warn(`Was unable to scroll into view: [${columnIndex},${rowIndex}] (column does not exist)`);
            return;
        }
        let left = scrollLeft;
        const columnStart = columnFromLeft(this.columns.items, columnIndex);
        const columnEnd = columnStart + column.width;
        if (columnStart < scrollLeft) {
            left = columnStart;
        } else if (columnEnd > scrollRight) {
            left = scrollLeft + (columnEnd - scrollRight);
        }

        let top = scrollTop;
        const rowStart = rowIndex * this.cellSize;
        const rowEnd = rowStart + this.cellSize;
        if (rowStart < scrollTop) {
            top = rowStart;
        } else if (rowEnd > scrollBottom) {
            top = scrollTop + (rowEnd - scrollBottom);
        }

        this.cellsElement.scrollTo({ left, top, behavior: "instant" });
    });

    getCellData<DT extends DataType>(columnIndex: number, rowIndex: number): DT | undefined {
        const row = this.data.items.at(rowIndex);
        if (!row) {
            return undefined;
        }
        const column = this.columns.items.at(columnIndex);
        if (!column) {
            return undefined;
        }
        return row[column.binding];
    }

    setCellData(columnIndex: number, rowIndex: number, value: T[keyof T]): void {
        const row = this.data.items.at(rowIndex);
        if (!row) {
            return undefined;
        }
        const column = this.columns.items.at(columnIndex);
        if (!column) {
            return undefined;
        }
        row[column.binding] = value;

        this.invalidate();
    }
}

export type { Grid };

export function createGrid<T extends DataItem>(hostElement: HTMLElement, options?: GridOptions<T>) {
    return new Grid(hostElement, options);
}
