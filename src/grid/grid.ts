import type { DataItem } from "@shared/types";
import { keyboardExtension } from "@extension/keyboard";
import { mouseExtension } from "@extension/mouse";
import { resizeObserverExtension } from "@extension/resizeobserver";
import { renderExtension } from "@extension/render";
import { expanderExtension } from "@extension/expander";
import { HeaderSelection } from "@shared/enums";
import { columnFromLeft, createColumn, type Column, type ColumnOptions } from "@structure/column";
import { createEvent } from "@shared/event";
import { debounce } from "throttle-debounce";
import { getElementScrollDimensions } from "@helpers/getelementscrolldimensions";
import { createRange, type Range } from "@structure/range";
import { createCollectionView, type CollectionView } from "@structure/collection";
import { setupDomElements } from "./setup";

const DEFAULT_CELL_SIZE = 50;

export interface GridOptions<T extends DataItem> {
    /**
     * Source
     *
     * **Default:** `[]`
     */
    source?: T[];

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
    readonly columns: CollectionView<ColumnOptions<T>, Column<T>>;
    #data: T[];
    #selection: Range;
    #showHeaderSelection = HeaderSelection.Both;
    #cellSize: number;
    readonly onInvalidate = createEvent<() => void>();

    constructor(hostElement: HTMLElement, options?: GridOptions<T>) {
        // Miscellaneous
        this.#cellSize = options?.cellSize ?? DEFAULT_CELL_SIZE;
        this.#showHeaderSelection = options?.showHeaderSelection ?? HeaderSelection.Both;

        // DOM elements
        const { cellsElement, columnHeadersElement, rowHeadersElement } = setupDomElements(hostElement, this.#cellSize);
        this.hostElement = hostElement;
        this.cellsElement = cellsElement;
        this.columnHeadersElement = columnHeadersElement;
        this.rowHeadersElement = rowHeadersElement;

        // Data
        this.#data = options?.source ?? [];

        // Columns
        this.columns = createCollectionView<ColumnOptions<T>, Column<T>>(options?.columns, {
            filter: column => column.visible,
            mapper: column => createColumn(column),
        });
        this.columns.onChange.subscribe(() => {
            console.log("Columns CHANGED");
            this.invalidate();
        });

        // Selection
        this.#selection = createRange(0, 0);

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

    get data() {
        return this.#data;
    }
    set data(value: T[]) {
        this.#data = value;
        this.invalidate();
    }

    get cellSize() {
        return this.#cellSize;
    }
    set cellSize(value: number) {
        this.#cellSize = value;
        this.invalidate();
    }

    get selection() {
        return this.#selection;
    }
    set selection(value: Range) {
        this.#selection = value;
        this.invalidate();
    }

    debouncedInvalidate = debounce(32, () => {
        this.onInvalidate.raise();
    });

    invalidate(immediately = false) {
        if (immediately) {
            this.onInvalidate.raise();
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
        const rowStart = rowIndex * this.#cellSize;
        const rowEnd = rowStart + this.#cellSize;
        if (rowStart < scrollTop) {
            top = rowStart;
        } else if (rowEnd > scrollBottom) {
            top = scrollTop + (rowEnd - scrollBottom);
        }

        this.cellsElement.scrollTo({ left, top, behavior: "instant" });
    });

    getCellData<DT>(columnIndex: number, rowIndex: number): DT | undefined {
        const row = this.#data[rowIndex];
        if (!row) {
            return undefined;
        }
        const column = this.columns.items.at(columnIndex);
        if (!column) {
            return undefined;
        }
        return row[column.binding];
    }
}

export type { Grid };

export function createGrid<T extends DataItem>(hostElement: HTMLElement, options?: GridOptions<T>) {
    return new Grid(hostElement, options);
}
