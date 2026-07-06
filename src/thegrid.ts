import type { ColumnOptions } from "@/column/column";
import { Range } from "@/shared/range";
import { debounce } from "throttle-debounce";
import { ColumnManager } from "@/column/columnmanager";
import { gridReferences } from "@/shared/meta";
import { extractPropertiesFromObjects } from "@/helpers/extractpropertiesfromobjects";
import { Source } from "@/data/source";
import { Renderer } from "@/rendering/renderer";

type GridSizes = "full" | "none" | { width: number | string; height: number | string };

interface Options<T extends Record<string, any>> {
    data?: ArrayLike<T>;
    columns?: ArrayLike<ColumnOptions>;
    size?: GridSizes;
    zebra?: boolean;
}

const HTML = `
    <div data-area="cells"></div>
    <div data-area="top-left"></div>
    <div data-area="columns-headers"></div>
    <div data-area="row-headers"></div>
`;

export class TheGrid<T extends Record<string, any>> {
    // Elements
    #hostElement: HTMLElement;
    #cellsElement: HTMLElement;
    #columnHeadersElement: HTMLElement;
    #rowHeadersElement: HTMLElement;

    #columnManager: ColumnManager;
    #source: Source<T>;
    #selection: Range | undefined;

    #renderer: Renderer;
    #size: GridSizes = "full";
    #cellSize: number;

    constructor(hostElement: HTMLElement, options: Options<T> = { data: [], columns: undefined }) {
        gridReferences.add(new WeakRef(this));

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
        this.#cellsElement = host.querySelector("[data-area='cells']")!;
        this.#columnHeadersElement = host.querySelector("[data-area='columns-headers']")!;
        this.#rowHeadersElement = host.querySelector("[data-area='row-headers']")!;

        // Source
        this.#source = new Source(options.data ?? []);
        this.#source.onChange.subscribe(() => {
            this.invalidate();
        });

        // Columns
        this.#columnManager = new ColumnManager(this, this.#getColumns(options.columns));
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

        let mouseDownElement: HTMLElement | undefined;

        this.#cellsElement.addEventListener("mousedown", event => {
            if (
                event.button !== 0 ||
                !(event.target instanceof HTMLElement) ||
                !event.target.classList.contains("thegrid-cell")
            ) {
                return;
            }
            mouseDownElement = event.target;
            const downRowIndex = Number.parseInt(mouseDownElement!.dataset.row!, 10);
            const downColumnIndex = Number.parseInt(mouseDownElement!.dataset.column!, 10);
            this.selection = new Range(downColumnIndex, downRowIndex);
        });

        this.#cellsElement.addEventListener("mousemove", event => {
            if (event.button !== 0 || !(event.target instanceof HTMLElement) || !mouseDownElement) {
                return;
            }
            const mouseMoveElement = event.target;

            const downRowIndex = Number.parseInt(mouseDownElement!.dataset.row!, 10);
            const downColumnIndex = Number.parseInt(mouseDownElement!.dataset.column!, 10);
            const upRowIndex = Number.parseInt(mouseMoveElement.dataset.row!, 10);
            const upColumnIndex = Number.parseInt(mouseMoveElement.dataset.column!, 10);
            if (
                Number.isNaN(downRowIndex) ||
                Number.isNaN(downColumnIndex) ||
                Number.isNaN(upRowIndex) ||
                Number.isNaN(upColumnIndex)
            ) {
                return;
            }
            this.selection = new Range(downColumnIndex, downRowIndex, upColumnIndex, upRowIndex);
        });

        this.#cellsElement.addEventListener("mouseup", event => {
            if (event.button !== 0 || !(event.target instanceof HTMLElement)) {
                return;
            }
            const mouseUpElement = event.target;

            if (mouseDownElement === mouseUpElement) {
                const target = event.target;
                const rowIndex = Number.parseInt(target.dataset.row!, 10);
                const columnIndex = Number.parseInt(target.dataset.column!, 10);
                if (Number.isNaN(rowIndex) || Number.isNaN(columnIndex)) {
                    return;
                }
                this.selection = new Range(columnIndex, rowIndex);
            } else if (mouseDownElement) {
                const downRowIndex = Number.parseInt(mouseDownElement!.dataset.row!, 10);
                const downColumnIndex = Number.parseInt(mouseDownElement!.dataset.column!, 10);
                const upRowIndex = Number.parseInt(mouseUpElement.dataset.row!, 10);
                const upColumnIndex = Number.parseInt(mouseUpElement.dataset.column!, 10);
                if (
                    Number.isNaN(downRowIndex) ||
                    Number.isNaN(downColumnIndex) ||
                    Number.isNaN(upRowIndex) ||
                    Number.isNaN(upColumnIndex)
                ) {
                    return;
                }
                this.selection = new Range(
                    downColumnIndex,
                    downRowIndex,
                    upColumnIndex,
                    upRowIndex,
                );
            }

            mouseDownElement = undefined;
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

    get source(): Source<T> {
        return this.#source;
    }

    get columns(): ColumnManager {
        return this.#columnManager;
    }

    get cellSize(): number {
        return this.#cellSize;
    }

    get size(): GridSizes {
        return this.#size;
    }

    get selection(): Range | undefined {
        return this.#selection;
    }

    set selection(point: Range | undefined) {
        this.#selection = point;
        this.#renderer.render();
    }

    set size(size: GridSizes) {
        this.#size = size;
        this.#hostElement.classList.remove("full-size", "no-size");
        this.#hostElement.style.removeProperty("width");
        this.#hostElement.style.removeProperty("height");
        switch (this.#size) {
            case "full": {
                this.#hostElement.classList.add("full-size");
                break;
            }
            case "none": {
                this.#hostElement.classList.add("no-size");
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

    #getColumns(columns: ArrayLike<ColumnOptions> | undefined): ColumnOptions[] {
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

    getCellData(rowIndex: number, columnIndex: number): unknown {
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
