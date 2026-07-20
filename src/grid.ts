import {
    transformColumnsToOptions,
    createColumns,
    createColumnOptions,
    type ColumnCollection,
    type ColumnOptions,
} from "@/parts/column";
import { createSource, type Source } from "@/parts/source";
import { debounce } from "throttle-debounce";
import { List } from "immutable";
import { getElementScrollDimensions } from "@/helpers/getelementscrolldimensions";
import { keyboardExtension } from "@/extensions/keyboard";
import { mouseExtension } from "@/extensions/mouse";
import { resizeObserverExtension } from "@/extensions/resizeobserver";
import { renderExtension } from "@/extensions/render";
import { expanderExtension } from "@/extensions/expander";
import { createEvent } from "@/shared/event";
import { createRange, type Range } from "./parts/range";
import { createSelection, type Selection } from "./parts/selection";

type GridSizes = "full" | { width: number | string; height: number | string };

interface Options<T extends Record<string, any>> {
    data?: ArrayLike<T>;
    columns?: ArrayLike<ColumnOptions<T>>;
    size?: GridSizes;
    zebra?: boolean;
}

const HTML = `
    <div class="thegrid-area-cells" tabindex="0"></div>
    <div class="thegrid-area-topleft"></div>
    <div class="thegrid-area-columnheaders"></div>
    <div class="thegrid-area-rowheaders"></div>
`;

export class TheGrid<T extends Record<string, any> = any> {
    #hostElement: HTMLElement;
    #cellsElement: HTMLElement;
    #columnHeadersElement: HTMLElement;
    #rowHeadersElement: HTMLElement;
    #columns: Immutable.RecordOf<ColumnCollection<T>>;
    #source: Source<T>;
    #selection: Immutable.RecordOf<Selection>;
    #size: GridSizes = "full";
    #cellSize: number;
    #onInvalidate = createEvent<() => void>();

    constructor(hostElement: HTMLElement, options?: Options<T>) {
        this.#hostElement = hostElement;
        this.#hostElement.innerHTML = HTML;
        this.#hostElement.classList.add("thegrid");

        this.#cellsElement = this.#hostElement.querySelector(".thegrid-area-cells")!;
        this.#columnHeadersElement = this.#hostElement.querySelector(".thegrid-area-columnheaders")!;
        this.#rowHeadersElement = this.#hostElement.querySelector(".thegrid-area-rowheaders")!;

        this.#cellSize = Number.parseInt(
            window.getComputedStyle(this.#hostElement).getPropertyValue("--cell-size"),
            10,
        );

        this.#columns = createColumns(this.#getColumns(options?.columns), this);
        this.#source = createSource<T>(List(options?.data ?? []), this);

        this.size = options?.size ?? "full";
        this.#selection = createSelection(createRange(-1, -1), this);

        this.extend(expanderExtension);
        this.extend(renderExtension);
        this.extend(resizeObserverExtension);
        this.extend(mouseExtension);
        this.extend(keyboardExtension);
    }

    /**
     * Update the columns
     *
     * The callback receives the current immutable columns and must return
     * a new immutable columns.
     *
     * @param callback A function that receives the current columns and returns new columns.
     */
    updateColumns(
        callback: (columns: List<Immutable.RecordOf<ColumnOptions<T>>>) => List<Immutable.RecordOf<ColumnOptions<T>>>,
    ) {
        const options = transformColumnsToOptions(this.#columns);
        const newOptions = callback(options);
        this.#columns = createColumns(newOptions, this);
        this.invalidate();
    }

    /**
     * Update the source
     *
     * The callback receives the current immutable source and must return
     * a new immutable source.
     *
     * @param callback A function that receives the current source and returns a new source.
     */
    updateSource(callback: (source: List<Immutable.RecordOf<T>>) => List<Immutable.RecordOf<T>>) {
        const newSource = callback(this.#source.items);
        this.#source = createSource(newSource, this);
        this.invalidate();
    }

    /**
     * Update the source
     *
     * The callback receives the current immutable source and must return
     * a new immutable source.
     *
     * @param callback A function that receives the current source and returns a new source.
     */
    updateSelection(callback: (source: Immutable.RecordOf<Selection>) => Immutable.RecordOf<Selection>) {
        const newSelection = callback(this.#selection);
        this.#selection = createSelection(newSelection.range, this);
        this.invalidate(true);
    }

    extend(callback: (grid: TheGrid<T>) => void): void {
        callback(this);
    }

    invalidate(immediately = false) {
        if (immediately) {
            this.#onInvalidate.raise();
        } else {
            this.#debouncedInvalidate();
        }
    }

    #debouncedInvalidate = debounce(100, () => {
        this.#onInvalidate.raise();
    });

    get hostElement(): HTMLElement {
        return this.#hostElement;
    }

    get cellsElement(): HTMLElement {
        return this.#cellsElement;
    }

    get columnHeadersElement(): HTMLElement {
        return this.#columnHeadersElement;
    }

    get rowHeadersElement(): HTMLElement {
        return this.#rowHeadersElement;
    }

    get source() {
        return this.#source;
    }

    get columns(): ColumnCollection<T> {
        return this.#columns;
    }

    get cellSize(): number {
        return this.#cellSize;
    }

    get selection() {
        return this.#selection;
    }

    get onInvalidate() {
        return this.#onInvalidate;
    }

    scrollIntoView = debounce(64, (columnIndex: number, rowIndex: number) => {
        const { scrollLeft, scrollRight, scrollTop, scrollBottom } = getElementScrollDimensions(this.#cellsElement);
        const column = this.#columns.items.get(columnIndex)!;

        let left = scrollLeft;
        const columnStart = column.fromLeft;
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

        this.#cellsElement.scrollTo({ left, top, behavior: "instant" });
    });

    get size(): GridSizes {
        return this.#size;
    }

    set size(size: GridSizes) {
        this.#size = size;
        switch (this.#size) {
            case "full": {
                this.#hostElement.style.setProperty("width", "100%");
                this.#hostElement.style.setProperty("height", "100%");
                break;
            }
            default: {
                const { width, height } = this.#size!;
                this.#hostElement.style.setProperty("width", `${width}px`);
                this.#hostElement.style.setProperty("height", `${height}px`);
                break;
            }
        }
    }

    #getColumns(columns: ArrayLike<ColumnOptions<T>> | undefined): List<Immutable.RecordOf<ColumnOptions<T>>> {
        let options: ColumnOptions<T>[];
        if (columns) {
            options = Array.from(columns);
        } else {
            const bindings = new Set<string>();
            for (const obj of this.#source.items) {
                for (const key of Object.keys(obj)) {
                    bindings.add(key);
                }
            }
            options = [...bindings].map(binding => ({ binding }));
        }
        return List(options.map(option => createColumnOptions(option)));
    }

    getCellData(columnIndex: number, rowIndex: number): unknown {
        const row = this.source.items.get(rowIndex);
        if (!row) {
            return undefined;
        }
        const column = this.columns.items.get(columnIndex);
        if (!column) {
            return undefined;
        }
        return row[column.binding];
    }
}
