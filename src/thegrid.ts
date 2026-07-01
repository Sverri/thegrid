import { ColumnCollection } from "@/column/columncollection";
import { Column, type ColumnOptions } from "@/column/column";
import { gridReferences } from "@/shared/meta";
import { extractPropertiesFromObjects } from "@/helpers/extractpropertiesfromobjects";
import { CellType } from "@/shared/enums";
import { calculateRenderArea } from "./rendering/calculaterenderarea";
import { debounce } from "throttle-debounce";
import { List } from "immutable";
import { Collection } from "./data/collection";

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
    #hostElement: HTMLElement;
    #cellsElement: HTMLElement;

    #columns = new ColumnCollection();
    #size: GridSizes = "full";
    #collection: Collection<T>;
    #cellSize = 30;

    constructor(hostElement: HTMLElement, options: Options<T> = { data: [], columns: undefined }) {
        gridReferences.add(new WeakRef(this));
        this.#hostElement = hostElement;
        this.#hostElement.innerHTML = HTML;
        this.#cellsElement = this.#hostElement.querySelector<HTMLElement>("[data-area='cells']")!;

        this.#collection = new Collection({
            data: options.data ?? [],
        });

        if (options.size) {
            this.#size = options.size;
        }

        const columns = !options.columns
            ? extractPropertiesFromObjects(this.#collection.items).map(binding => ({ binding }))
            : Array.from(options.columns);

        for (const columnOptions of columns) {
            this.#columns.add(new Column(columnOptions));
        }

        // Kick off rendering
        this.#setupHostElement();

        this.#cellSize = Number.parseInt(
            window.getComputedStyle(this.#hostElement).getPropertyValue("--cell-size"),
            10,
        );

        this.#updateExpander();

        // Add event handlers
        this.#columns.onChange.subscribe(this.render);

        this.render();

        this.#registerResizeObserver();
    }

    get hostElement(): HTMLElement {
        return this.#hostElement;
    }

    get collection(): Collection<T> {
        return this.#collection;
    }

    get columns(): ColumnCollection {
        return this.#columns;
    }

    get cellSize(): number {
        return this.#cellSize;
    }

    #setupHostElement(): void {
        this.#hostElement.classList.add("thegrid");
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
        if (this.#size === "full") {
            this.#hostElement.classList.add("full-size");
        }
        const cellsElement = this.#hostElement.querySelector<HTMLElement>("[data-area='cells']")!;
        cellsElement.addEventListener(
            "scroll",
            () => {
                this.render();
            },
            // { passive: true },
        );
    }

    #createCell(type: CellType, row: number, column: number): HTMLDivElement {
        const div = document.createElement("div");
        div.classList.add("thegrid-cell");
        div.dataset.column = column.toString();
        div.dataset.row = row.toString();
        switch (type) {
            case CellType.ColumnHeader: {
                div.classList.add("thegrid-cell-column-header");
                break;
            }
            case CellType.RowHeader: {
                div.classList.add("thegrid-cell-row-header");
                break;
            }
            case CellType.TopLeft: {
                div.classList.add("thegrid-cell-topleft");
                break;
            }
        }
        return div;
    }

    *#generateRenderCoordinates() {
        const renderArea = calculateRenderArea(this);
        for (let y = renderArea.top; y < renderArea.bottom; y++) {
            for (let x = renderArea.left; x <= renderArea.right; x++) {
                yield { x, y };
            }
        }
    }

    render(): void {
        const cells = Array.from(this.#cellsElement.children) as HTMLDivElement[];
        const fragment = new DocumentFragment();

        for (const { x, y } of this.#generateRenderCoordinates()) {
            // Skip already rendered cells
            const index = cells.findIndex(cell => cell.dataset.row == String(y) && cell.dataset.column == String(x));
            if (index !== -1) {
                cells.splice(index, 1);
                continue;
            }

            const column = this.#columns.items.get(x)!;

            const cell = this.#createCell(CellType.Cell, y, x);
            cell.style.left = `${column.fromLeft}px`;
            cell.style.top = `${y * this.#cellSize}px`;
            cell.style.width = `${column.width}px`;
            cell.style.height = `${this.#cellSize}px`;

            const content = this.#collection.items.get(y)![column.binding];
            cell.textContent = String(content);

            fragment.append(cell);
        }

        this.#cellsElement.append(fragment);

        // Remove unused cells
        if (cells.length > 0) {
            for (const cell of cells) {
                cell.remove();
            }
        }
    }

    #updateExpander() {
        const x = this.columns.items.reduce((value, column) => value + column.width, 0);
        const y = this.#collection.items.size * this.cellSize;
        const he = this.#hostElement;
        he.style.setProperty("--internal-expander-translate-x", `${x}px`, "important");
        he.style.setProperty("--internal-expander-translate-y", `${y}px`, "important");
    }

    #registerResizeObserver() {
        const resizeObserver = new ResizeObserver(
            debounce(100, () => {
                this.#updateExpander();
                this.render();
            }),
        );
        resizeObserver.observe(this.#hostElement);
    }
}
