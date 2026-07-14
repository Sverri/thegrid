import { createColumns, type ColumnOptions, type Columns } from "@/columns";
import { createSource, type Source } from "@/source";
import { extractPropertiesFromObjects } from "@/helpers/extractpropertiesfromobjects";
import { Renderer } from "@/renderer";
import { debounce } from "throttle-debounce";
import { List } from "immutable";
import { getElementScrollDimensions } from "@/helpers/getelementscrolldimensions";
import { createSelection, type Selection } from "@/selection/createselection";

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

        this.#selection = createSelection(this);

        this.#registerResizeObserver();
        this.invalidate();

        // TODO Move event handlers into dedicated function/method/something

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
            this.selection.update(startCoords.column, startCoords.row);
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
            this.selection.update(downColumnIndex, downRowIndex, upColumnIndex, upRowIndex);
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
            this.selection.update(downColumnIndex, downRowIndex, upColumnIndex, upRowIndex);
            startCoords = undefined;
        });

        this.#cellsElement.addEventListener("keydown", event => {
            switch (event.key) {
                case "a": {
                    if (event.shiftKey || event.altKey || event.metaKey) {
                        break;
                    }
                    if (event.ctrlKey) {
                        event.preventDefault();
                        const rowCount = this.#source.items.size - 1;
                        const { lastVisibleIndex } = this.#columnManager;
                        this.selection.update(0, 0, lastVisibleIndex, rowCount);
                        this.#scrollIntoView(this.selection.range.x2, this.selection.range.y2);
                    }
                    break;
                }

                case "ArrowLeft": {
                    if (event.ctrlKey || event.altKey || event.metaKey) {
                        break;
                    }
                    event.preventDefault();
                    if (event.shiftKey) {
                        this.selection.expandLeft();
                    } else {
                        this.selection.moveLeft();
                    }
                    this.#scrollIntoView(this.selection.range.x2, this.selection.range.y2);
                    break;
                }

                case "ArrowRight": {
                    if (event.ctrlKey || event.altKey || event.metaKey) {
                        break;
                    }
                    event.preventDefault();
                    if (event.shiftKey) {
                        this.selection.expandRight();
                    } else {
                        this.selection.moveRight();
                    }
                    this.#scrollIntoView(this.selection.range.x2, this.selection.range.y2);
                    break;
                }

                case "ArrowUp": {
                    if (event.ctrlKey || event.altKey || event.metaKey) {
                        break;
                    }
                    event.preventDefault();
                    if (event.shiftKey) {
                        this.selection.expandUp();
                    } else {
                        this.selection.moveUp();
                    }
                    this.#scrollIntoView(this.selection.range.x2, this.selection.range.y2);
                    break;
                }

                case "ArrowDown": {
                    if (event.ctrlKey || event.altKey || event.metaKey) {
                        break;
                    }
                    event.preventDefault();
                    if (event.shiftKey) {
                        this.selection.expandDown();
                    } else {
                        this.selection.moveDown();
                    }
                    this.#scrollIntoView(this.selection.range.x2, this.selection.range.y2);
                    break;
                }

                case "Home": {
                    event.preventDefault();
                    if (event.ctrlKey) {
                        const { x1, y1, x2 } = this.selection.range;
                        const firstRowIndex = 0;
                        const newY1 = event.shiftKey ? y1 : firstRowIndex;
                        this.selection.update(x1, newY1, x2, firstRowIndex);
                        this.#scrollIntoView(x2, firstRowIndex);
                    } else {
                        const { x1, y1, y2 } = this.selection.range;
                        const firstColumnIndex = this.columns.firstVisibleIndex;
                        const newX1 = event.shiftKey ? x1 : firstColumnIndex;
                        this.selection.update(newX1, y1, firstColumnIndex, y2);
                        this.#scrollIntoView(firstColumnIndex, y2);
                    }
                    break;
                }

                case "End": {
                    event.preventDefault();
                    if (event.ctrlKey) {
                        const { x1, y1, x2 } = this.selection.range;
                        const lastRowIndex = this.#source.items.size - 1;
                        const newY1 = event.shiftKey ? y1 : lastRowIndex;
                        this.selection.update(x1, newY1, x2, lastRowIndex);
                        this.#scrollIntoView(x2, lastRowIndex);
                    } else {
                        const { x1, y1, y2 } = this.selection.range;
                        const lastColumnIndex = this.columns.lastVisibleIndex;
                        const newX1 = event.shiftKey ? x1 : lastColumnIndex;
                        this.selection.update(newX1, y1, lastColumnIndex, y2);
                        this.#scrollIntoView(lastColumnIndex, y2);
                    }
                    break;
                }
            }
        });
    }

    invalidate(immediately = false) {
        if (immediately) {
            this.#renderer.render();
        } else {
            this.#debouncedInvalidate();
        }
    }

    #debouncedInvalidate = debounce(100, () => {
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

    #scrollIntoView = debounce(64, (columnIndex: number, rowIndex: number) => {
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
