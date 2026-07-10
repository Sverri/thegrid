import { createColumns, type ColumnOptions, type Columns } from "@/columns";
import { createSource, type Source } from "@/source";
import { createRange, type Range } from "@/shared/range";
import { extractPropertiesFromObjects } from "@/helpers/extractpropertiesfromobjects";
import { Renderer } from "@/renderer";
import { debounce } from "throttle-debounce";
import { List } from "immutable";

type GridSizes = "full" | { width: number | string; height: number | string };

interface Options<T extends Record<string, any>> {
    data?: ArrayLike<T>;
    columns?: ArrayLike<ColumnOptions<T>>;
    size?: GridSizes;
    zebra?: boolean;
}

const HTML = `
    <div class="thegrid-area-cells"></div>
    <div class="thegrid-area-topleft"></div>
    <div class="thegrid-area-columnheaders"></div>
    <div class="thegrid-area-rowheaders"></div>
`;

export class TheGrid<T extends Record<string, any>> {
    // Elements
    #hostElement: HTMLElement;
    #cellsElement: HTMLElement;
    #columnHeadersElement: HTMLElement;
    #rowHeadersElement: HTMLElement;

    #columnManager: Columns<T>;
    #source: Source<T>;
    #selection: Range = createRange(-1, -1);

    #renderer: Renderer;
    #size: GridSizes = "full";
    #cellSize: number;

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

        this.#renderer = new Renderer({
            grid: this,
            zebra: options.zebra === true,
        });

        // Set size
        this.size = options.size ?? "full";

        this.#registerResizeObserver();
        this.invalidate();

        let startCoords: { row: number; column: number } | undefined;

        this.#cellsElement.addEventListener("mousedown", event => {
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
            this.selection = createRange(startCoords.column, startCoords.row);
        });

        this.#cellsElement.addEventListener("mousemove", event => {
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
            this.selection = createRange(downColumnIndex, downRowIndex, upColumnIndex, upRowIndex);
        });

        this.#cellsElement.addEventListener("mouseenter", () => {
            startCoords = undefined;
        });

        this.#cellsElement.addEventListener("mouseleave", () => {
            startCoords = undefined;
        });

        this.#cellsElement.addEventListener("mouseup", event => {
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
            this.selection = createRange(downColumnIndex, downRowIndex, upColumnIndex, upRowIndex);
            startCoords = undefined;
        });
    }

    invalidate = debounce(100, () => {
        this.#renderer.render();
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

    set selection(point: Range) {
        this.#selection = point;
        this.#renderer.render();
    }

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

    #registerResizeObserver() {
        const resizeObserver = new ResizeObserver(
            debounce(100, (): void => {
                this.#renderer.render();
            }),
        );
        resizeObserver.observe(this.#hostElement);
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
