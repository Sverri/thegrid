import type { TheGrid } from "@/grid";
import { type Range } from "@/shared/range";
import { CellType } from "@/shared/enums";
import { getElementScrollDimensions, type ElementScrollDimensions } from "./helpers/getelementscrolldimensions";
import { calculateRenderArea } from "@/render/renderarea";
import { createExpander, type Expander } from "@/render/expander";
import { setCellContents } from "@/render/setcellcontents";
import { renderCellSelection } from "@/render/renderselection";
import { createCellElementManager, type CellElementManager } from "@/render/cellelementmanager";

interface Options {
    grid: TheGrid<any>;
    zebra: boolean;
}

export class Renderer {
    #grid: TheGrid<object>;
    #zebra: boolean;
    #expander: Expander;
    #cellManager: CellElementManager;

    /**
     * Render ahead (outside viewport) to make sure cells are visible when user
     * scrolls, to prevent empty space. This is not a panacea, but it does make
     * it look nicer when you scroll using the mouse scroll-wheel or similar.
     */
    #renderAhead = {
        columns: 1,
        rows: 3,
    };

    constructor({ grid, zebra }: Options) {
        this.#grid = grid;
        this.#zebra = zebra;
        this.#expander = createExpander(grid);
        this.#cellManager = createCellElementManager();
        this.#grid.cellsElement.classList.toggle("thegrid-enable-zebra", this.#zebra);
        this.#grid.cellsElement.addEventListener("scroll", () => {
            this.render();
        });
    }

    render(): void {
        const dimensions = getElementScrollDimensions(this.#grid.cellsElement);
        const renderArea = calculateRenderArea({
            columns: this.#grid.columns.items,
            source: this.#grid.source.items,
            cellSize: this.#grid.cellSize,
            renderAhead: this.#renderAhead,
            dimensions,
        });
        this.#expander.update();
        this.#renderCells(renderArea);
        this.#renderColumnHeaders(renderArea, dimensions);
        this.#renderRowHeaders(renderArea, dimensions);
    }

    #renderCells(range: Range): void {
        const { cellsElement, selection, columns, cellSize } = this.#grid;
        const cells = Array.from(cellsElement.children) as HTMLDivElement[];

        cells.forEach(this.#cellManager.turnIn);

        const fragment = new DocumentFragment();

        for (const { x, y } of range.iterator()) {
            const { dataType, visible } = columns.items.get(x)!;
            if (!visible) {
                continue;
            }
            const { fromLeft, width } = columns.items.get(x)!;
            const cell = this.#cellManager.retrieve(x, y, CellType.Cell);

            cell.style.transform = `translate(${fromLeft}px, ${y * cellSize}px)`;
            cell.style.width = `${width}px`;
            cell.style.height = `${cellSize}px`;

            renderCellSelection(cell, selection.range, columns.items, x, y);
            setCellContents(cell, dataType, this.#grid.getCellData(x, y));

            cell.classList.add(y % 2 === 0 ? "row-even" : "row-odd");
            fragment.append(cell);
        }

        cellsElement.append(fragment);
    }

    #renderColumnHeaders(range: Range, { scrollLeft }: ElementScrollDimensions): void {
        const { columnHeadersElement, columns, cellSize, selection } = this.#grid;
        const cells = Array.from(columnHeadersElement.children) as HTMLDivElement[];

        cells.forEach(this.#cellManager.turnIn);

        const fragment = new DocumentFragment();

        for (const { x } of range.horizontalIterator()) {
            const { header, visible, fromLeft, width, index } = columns.items.get(x)!;
            if (!visible) {
                continue;
            }
            const cell = this.#cellManager.retrieve(x, 0, CellType.ColumnHeader);
            cell.style.transform = `translateX(${fromLeft - scrollLeft}px)`;
            cell.style.width = `${width}px`;
            cell.style.height = `${cellSize}px`;
            if (selection && index >= selection.range.left && index <= selection.range.right) {
                cell.classList.add("column-selected");
            }
            cell.textContent = header;
            fragment.append(cell);
        }

        columnHeadersElement.append(fragment);
    }

    #renderRowHeaders(range: Range, { scrollTop }: ElementScrollDimensions): void {
        const { rowHeadersElement, cellSize, selection } = this.#grid;
        const cells = Array.from(rowHeadersElement.children) as HTMLDivElement[];

        cells.forEach(this.#cellManager.turnIn);

        const fragment = new DocumentFragment();

        for (const { y } of range.verticalIterator()) {
            const cell = this.#cellManager.retrieve(0, y, CellType.RowHeader);
            cell.style.transform = `translateY(${y * cellSize - scrollTop}px)`;
            cell.style.width = `${cellSize}px`;
            cell.style.height = `${cellSize}px`;
            if (selection && y >= selection.range.top && y <= selection.range.bottom) {
                cell.classList.add("row-selected");
            }
            fragment.append(cell);
        }

        rowHeadersElement.append(fragment);
    }
}
