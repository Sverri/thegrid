import type { CellType, DataType } from "@/shared/enums";
import { createColumns, type ColumnOptions, type Columns } from "@/columns";
import { createSource, type Source } from "@/source";
import { extractPropertiesFromObjects } from "@/helpers/extractpropertiesfromobjects";
import { debounce } from "throttle-debounce";
import { List } from "immutable";
import { getElementScrollDimensions } from "@/helpers/getelementscrolldimensions";
import { createSelection, type Selection } from "@/selection/createselection";
import { keyboardExtension } from "@/extensions/keyboard";
import { mouseExtension } from "@/extensions/mouse";
import { resizeObserverExtension } from "@/extensions/resizeobserver";
import { createEvent } from "@/shared/event";
import { renderExtension } from "@/extensions/render";
import { expanderExtension } from "@/extensions/expander";

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

export class TheGrid<T extends Record<string, any>> {
    #hostElement: HTMLElement;
    #cellsElement: HTMLElement;
    #columnHeadersElement: HTMLElement;
    #rowHeadersElement: HTMLElement;
    #columnManager: Columns<T>;
    #source: Source<T>;
    #selection: Selection;
    #size: GridSizes = "full";
    #cellSize: number;
    #onInvalidate = createEvent<() => void>();
    #onCellRender =
        createEvent<
            (meta: {
                cell: HTMLDivElement;
                columnIndex: number;
                rowIndex: number;
                grid: TheGrid<T>;
                cellType: CellType;
                dataType: DataType;
            }) => void
        >();

    constructor(hostElement: HTMLElement, options: Options<T> = { data: [], columns: undefined }) {
        // Host element
        this.#hostElement = hostElement;
        this.#hostElement.innerHTML = HTML;
        this.#hostElement.classList.add("thegrid");

        const host = this.#hostElement;

        // Detect cell size based on styling
        this.#cellSize = Number.parseInt(
            window.getComputedStyle(this.#hostElement).getPropertyValue("--cell-size"),
            10,
        );

        // Elements
        this.#cellsElement = host.querySelector(".thegrid-area-cells")!;
        this.#columnHeadersElement = host.querySelector(".thegrid-area-columnheaders")!;
        this.#rowHeadersElement = host.querySelector(".thegrid-area-rowheaders")!;

        // Source
        this.#source = createSource<T>();
        this.#source.update(() => List(options.data ?? []));
        this.#source.onChange.subscribe(() => {
            this.invalidate();
        });

        // Columns
        this.#columnManager = createColumns(this);
        this.#columnManager.update(() => List(this.#getColumns(options.columns)));
        this.#columnManager.onChange.subscribe(() => {
            this.invalidate();
        });

        // Set size
        this.size = options.size ?? "full";

        this.#selection = createSelection(this);

        this.extend(expanderExtension);
        this.extend(renderExtension);
        this.extend(resizeObserverExtension);
        this.extend(mouseExtension);
        this.extend(keyboardExtension);
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

    get columns(): Columns<T> {
        return this.#columnManager;
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

    get onCellRender() {
        return this.#onCellRender;
    }

    scrollIntoView = debounce(64, (columnIndex: number, rowIndex: number) => {
        const { scrollLeft, scrollRight, scrollTop, scrollBottom } = getElementScrollDimensions(this.#cellsElement);
        const column = this.#columnManager.items.get(columnIndex)!;

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

    #getColumns(columns: ArrayLike<ColumnOptions<T>> | undefined): ColumnOptions<T>[] {
        const columnOptions = !columns
            ? extractPropertiesFromObjects(this.#source.items).map(binding => ({ binding }))
            : Array.from(columns);

        return columnOptions;
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
