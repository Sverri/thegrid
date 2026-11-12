import type { DataItem, Disposer } from "@shared/types";
import { keyboardExtension } from "@extension/keyboard";
import { mouseExtension } from "@extension/mouse";
import { resizeObserverExtension } from "@extension/resizeobserver";
import { expanderExtension } from "@extension/expander";
import { Headers } from "@shared/enums";
import { columnFromLeft, createColumn, type Column, type ColumnOptions } from "@structure/column";
import { createEvent } from "@shared/event";
import { debounce } from "throttle-debounce";
import { getElementScrollDimensions } from "@helpers/getelementscrolldimensions";
import { createCollectionView, type CollectionView } from "@structure/collection";
import { setupDomElements, teardownDomElements } from "./setup";
import { createSelection, type Selection } from "@grid/selection";
import { type Point } from "@structure/point";
import { createRenderer, type Renderer } from "./renderer";

const DEFAULT_CELL_SIZE = 50;

/**
 * Options accepted by {@link createGrid}.
 *
 * @typeParam T The shape of a data row.
 */
export interface GridOptions<T extends DataItem> {
    /**
     * The rows to display. The array is copied, but the row objects are not.
     *
     * **Default:** `[]`
     */
    data?: T[];

    /**
     * The columns to display, in order.
     *
     * **Default:** `[]`
     */
    columns?: ColumnOptions<T>[];

    /**
     * Which headers to show.
     *
     * **Default:** {@link Headers.Both}
     */
    showHeaders?: Headers;

    /**
     * Which headers highlight the rows and columns that contain the selection.
     *
     * **Default:** {@link Headers.Both}
     */
    showHeaderSelection?: Headers;

    /**
     * The height of every row, and the width of the row headers, in pixels.
     *
     * **Default:** `50`
     */
    cellSize?: number;

    /**
     * Locale
     *
     * You can either provide a simple locale like "en-UK", "de" or "pl", or,
     * if you need to customize it further you can also provide a `Intl.Locale`
     * instance.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Locale
     */
    locale?: string | Intl.Locale;
}

/**
 * A virtualized data grid rendered into a host element.
 *
 * Create one with {@link createGrid}.
 *
 * @typeParam T The shape of a data row.
 */
class Grid<T extends DataItem> {
    /**
     * The element the grid was created in.
     */
    readonly hostElement: HTMLElement;

    /**
     * The scrollable, focusable element that contains the data cells.
     */
    readonly cellsElement: HTMLDivElement;

    /**
     * The element that contains the column header cells.
     */
    readonly columnHeadersElement: HTMLDivElement;

    /**
     * The element that contains the row header cells.
     */
    readonly rowHeadersElement: HTMLDivElement;

    /**
     * The rows. Set its `filter` and `sorter` to change which rows are shown, and in what order.
     */
    readonly data: CollectionView<T>;

    /**
     * The columns. `columns.source` holds the options, and `columns.items` holds the visible columns.
     */
    readonly columns: CollectionView<ColumnOptions<T>, Column<T>>;

    /**
     * The selected range of cells.
     */
    readonly selection: Selection;

    /**
     * The locale used to format numbers and dates.
     */
    readonly locale: Intl.Locale;

    // Misc.
    #destroyed = false;
    #disposers: Disposer[] = [];
    #cellSize: number;
    #showHeaderSelection: Headers;
    #showHeaders: Headers;
    #onInvalidate = createEvent<() => void>();
    #renderer: Renderer;

    constructor(hostElement: HTMLElement, options?: GridOptions<T>) {
        // Miscellaneous
        this.#cellSize = options?.cellSize ?? DEFAULT_CELL_SIZE;
        this.#showHeaders = options?.showHeaders ?? Headers.Both;
        this.#showHeaderSelection = options?.showHeaderSelection ?? Headers.Both;
        this.locale = new Intl.Locale(options?.locale ?? "en-US");

        // DOM elements
        const { cellsElement, columnHeadersElement, rowHeadersElement } = setupDomElements(hostElement, this.#cellSize);
        this.hostElement = hostElement;
        this.cellsElement = cellsElement;
        this.columnHeadersElement = columnHeadersElement;
        this.rowHeadersElement = rowHeadersElement;

        // Data
        this.data = createCollectionView<T>(options?.data ?? [], {
            onChange: () => this.invalidate(),
        });

        // Columns
        //
        // Each options object maps to one Column instance for its lifetime, so
        // changes made to a Column survive the view being rebuilt. Changing a
        // column refreshes the view (to re-apply `visible`) and re-renders.
        const columnCache = new WeakMap<ColumnOptions<T>, Column<T>>();
        this.columns = createCollectionView<ColumnOptions<T>, Column<T>>(options?.columns, {
            filter: column => column.visible,
            mapper: options => {
                let column = columnCache.get(options);
                if (!column) {
                    column = createColumn(options);
                    column.onChange.subscribe(() => this.columns.refresh());
                    columnCache.set(options, column);
                }
                return column;
            },
            onChange: () => this.invalidate(),
        });

        // Selection
        this.selection = createSelection(this, {
            onChange: () => {
                if (!this.#destroyed) {
                    this.#renderer.updateSelection();
                }
            },
        });

        // Renderer
        this.#renderer = createRenderer(this);
        const onScroll = () => this.#renderer.requestRender();
        const render = () => this.#renderer.render();
        this.cellsElement.addEventListener("scroll", onScroll, { passive: true });
        this.#onInvalidate.subscribe(render);
        this.#disposers.push(() => {
            this.cellsElement.removeEventListener("scroll", onScroll);
            this.#onInvalidate.unsubscribe(render);
            this.#renderer.cancel();
        });

        // Extensions
        this.#disposers.push(
            expanderExtension(this),
            mouseExtension(this),
            keyboardExtension(this),
            resizeObserverExtension(this),
        );

        // Get the show on the road!
        this.invalidate();
    }

    /**
     * Which headers are shown. Changing it re-renders the grid.
     */
    get showHeaders() {
        return this.#showHeaders;
    }
    set showHeaders(value: Headers) {
        this.#showHeaders = value;
        this.invalidate();
    }

    /**
     * Which headers highlight the rows and columns that contain the selection.
     * Changing it re-renders the grid.
     */
    get showHeaderSelection() {
        return this.#showHeaderSelection;
    }
    set showHeaderSelection(value: Headers) {
        this.#showHeaderSelection = value;
        this.invalidate();
    }

    /**
     * The height of every row, and the width of the row headers, in pixels.
     * Changing it re-renders the grid.
     */
    get cellSize() {
        return this.#cellSize;
    }
    set cellSize(value: number) {
        this.#cellSize = value;
        this.hostElement.style.setProperty("--cell-size", `${value}px`);
        this.invalidate();
    }

    /**
     * Event raised when the grid re-renders, after {@link invalidate}.
     */
    get onInvalidate() {
        return this.#onInvalidate.unraisable;
    }

    #debouncedInvalidate = debounce(32, () => {
        this.#onInvalidate.raise();
    });

    /**
     * Schedules a full re-render of the grid.
     *
     * Calls within 32 milliseconds of each other are combined into one render.
     * Does nothing after {@link destroy}.
     *
     * @param immediate Render now, without waiting.
     */
    invalidate(immediate = false) {
        if (this.#destroyed) {
            return;
        }
        if (immediate) {
            this.#onInvalidate.raise();
        } else {
            this.#debouncedInvalidate();
        }
    }

    /**
     * Whether {@link destroy} has been called.
     */
    get destroyed() {
        return this.#destroyed;
    }

    /**
     * Removes the grid from its host element.
     *
     * Removes all event listeners and observers, cancels scheduled renders,
     * and restores the host element. The grid cannot be used afterwards.
     */
    destroy(): void {
        if (this.#destroyed) {
            return;
        }
        this.#destroyed = true;
        this.#debouncedInvalidate.cancel();
        for (const dispose of this.#disposers.splice(0)) {
            dispose();
        }
        teardownDomElements(this.hostElement);
    }

    /**
     * Scrolls the cells element by the smallest amount that brings a cell fully into view.
     *
     * Logs a warning, and does not scroll, if the column does not exist.
     *
     * @param point The cell's view coordinates (`x` is the column, `y` is the row).
     */
    scrollIntoView(point: Point): void {
        const { scrollLeft, scrollRight, scrollTop, scrollBottom } = getElementScrollDimensions(this.cellsElement);
        const column = this.columns.items.at(point.x);
        if (!column) {
            console.warn(`Was unable to scroll into view: [${point.x},${point.y}] (column does not exist)`);
            return;
        }

        let left = scrollLeft;
        const columnStart = columnFromLeft(this.columns.items, point.x);
        const columnEnd = columnStart + column.width;
        if (columnStart < scrollLeft) {
            left = columnStart;
        } else if (columnEnd > scrollRight) {
            left = scrollLeft + (columnEnd - scrollRight);
        }

        let top = scrollTop;
        const rowStart = point.y * this.#cellSize;
        const rowEnd = rowStart + this.#cellSize;
        if (rowStart < scrollTop) {
            top = rowStart;
        } else if (rowEnd > scrollBottom) {
            top = scrollTop + (rowEnd - scrollBottom);
        }

        this.cellsElement.scrollTo({ left, top, behavior: "instant" });
    }

    /**
     * Reads the value of the cell at the given view coordinates.
     *
     * @returns The value, or `undefined` for cells outside the grid.
     */
    getCellData(columnIndex: number, rowIndex: number): T[keyof T] | undefined {
        const column = this.columns.items.at(columnIndex);
        if (!column) {
            return undefined;
        }
        const row = this.data.items.at(rowIndex);
        if (!row) {
            return undefined;
        }
        return row[column.binding];
    }

    /**
     * Writes a value to the cell at the given view coordinates.
     *
     * Writes to readonly columns and to cells outside the grid are ignored.
     * The data view is refreshed afterwards, so sorting and filtering reflect the new value.
     *
     * @returns `true` if the value was written.
     */
    setCellData(columnIndex: number, rowIndex: number, value: T[keyof T]): boolean {
        const row = this.data.items.at(rowIndex);
        const column = this.columns.items.at(columnIndex);
        if (!row || !column || column.readonly) {
            return false;
        }
        row[column.binding] = value;
        this.data.refresh();
        return true;
    }
}

export type { Grid };

/**
 * Creates a grid inside a host element.
 *
 * Any existing content of the host element is replaced.
 *
 * @example
 * ```ts
 * const grid = createGrid(document.querySelector(".grid")!, {
 *     data: users,
 *     columns: [
 *         { binding: "name", header: "Name", width: 200 },
 *         { binding: "age", header: "Age", dataType: DataType.Integer },
 *     ],
 * });
 * ```
 *
 * @typeParam T The shape of a data row.
 * @param hostElement The element to render the grid in.
 * @param options The grid's data, columns and settings.
 * @returns The new grid.
 */
export function createGrid<T extends DataItem>(hostElement: HTMLElement, options?: GridOptions<T>) {
    return new Grid(hostElement, options);
}
