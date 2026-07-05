import { ColumnManager } from "@/column/columnmanager";
import { Column, type ColumnOptions } from "@/column/column";
import { gridReferences } from "@/shared/meta";
import { extractPropertiesFromObjects } from "@/helpers/extractpropertiesfromobjects";
import { debounce } from "throttle-debounce";
import { Source } from "@/data/source";
import { Renderer } from "@/rendering/renderer";

type GridSizes = "full" | "none" | { width: number | string; height: number | string };

interface Options<T extends Record<string, any>> {
    data?: ArrayLike<T>;
    columns?: ArrayLike<ColumnOptions>;
    size?: GridSizes;
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

    #renderer: Renderer;
    #size: GridSizes = "full";
    #cellSize: number;

    constructor(hostElement: HTMLElement, options: Options<T> = { data: [], columns: undefined }) {
        gridReferences.add(new WeakRef(this));

        // Host element
        this.#hostElement = hostElement;
        this.#hostElement.innerHTML = HTML;
        this.#hostElement.classList.add("thegrid");

        // Cells element
        this.#cellsElement = this.#hostElement.querySelector<HTMLElement>("[data-area='cells']")!;

        this.#columnHeadersElement = this.#hostElement.querySelector<HTMLElement>(
            "[data-area='columns-headers']",
        )!;
        this.#rowHeadersElement = this.#hostElement.querySelector<HTMLElement>(
            "[data-area='row-headers']",
        )!;

        // Source
        this.#source = new Source(options.data ?? []);
        this.#source.onChange.subscribe(this.invalidate);

        // Columns
        this.#columnManager = new ColumnManager(this.#getColumns(options.columns));
        this.#columnManager.onChange.subscribe(this.invalidate);

        this.#renderer = new Renderer(this);

        // Set size
        this.size = options.size ?? "full";

        // Detect cell size based on styling
        this.#cellSize = Number.parseInt(
            window.getComputedStyle(this.#hostElement).getPropertyValue("--cell-size"),
            10,
        );

        this.#registerResizeObserver();
        this.invalidate();
    }

    invalidate() {
        this.#renderer.render();
    }

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

    #getColumns(columns: ArrayLike<ColumnOptions> | undefined): Column[] {
        const columnOptions = !columns
            ? extractPropertiesFromObjects(this.#source.items).map(binding => ({ binding }))
            : Array.from(columns);

        return columnOptions.map(c => new Column(c));
    }

    #registerResizeObserver() {
        const resizeObserver = new ResizeObserver(
            debounce(100, (): void => {
                this.#renderer.render();
            }),
        );
        resizeObserver.observe(this.#hostElement);
    }
}
