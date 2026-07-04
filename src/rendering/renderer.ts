import type { TheGrid } from "@/thegrid";
import type { ColumnManager } from "@/column/columnmanager";
import { CellType } from "@/shared/enums";
import { Point } from "@/shared/point";
import { Range } from "@/shared/range";

interface Options {
    grid: TheGrid<any>;
}

interface Coordinate {
    x: number;
    y: number;
}

export class Renderer {
    #grid: TheGrid<any>;

    constructor(options: Options) {
        this.#grid = options.grid;
        this.#grid.cellsElement.addEventListener("scroll", () => {
            this.render();
        });
    }

    render(): void {
        const range = this.#calculateRenderArea(this.#grid);
        this.#updateExpander();
        this.#renderCells(range);
        this.#renderColumnHeaders(range);
        this.#renderRowHeaders(range);
    }

    #renderCells({ left, right, top, bottom }: Range): void {
        const cells = Array.from(this.#grid.cellsElement.children) as HTMLDivElement[];
        const fragment = new DocumentFragment();

        for (let y = top; y < bottom; y++) {
            for (let x = left; x <= right; x++) {
                const index = cells.findIndex(
                    cell => cell.dataset.row == String(y) && cell.dataset.column == String(x),
                );
                if (index !== -1) {
                    cells.splice(index, 1);
                    continue;
                }
                const cell = this.#renderCell(y, x);
                const { binding } = this.#grid.columns.items.get(x)!;
                const content = this.#grid.source.items.get(y)![binding];
                cell.textContent = String(content);
                fragment.append(cell);
            }
        }

        this.#grid.cellsElement.append(fragment);

        if (cells.length > 0) {
            for (const element of cells) {
                element.remove();
            }
        }
    }

    #renderColumnHeaders({ left, right }: Range): void {
        const cells = Array.from(this.#grid.columnHeadersElement.children) as HTMLDivElement[];
        for (const cellElement of cells) {
            cellElement.remove();
        }
        const fragment = new DocumentFragment();

        for (let x = left; x <= right; x++) {
            const cell = this.#renderColumnHeaderCell(0, x);
            const { header } = this.#grid.columns.items.get(x)!;
            cell.textContent = header;
            fragment.append(cell);
        }

        this.#grid.columnHeadersElement.append(fragment);
    }

    #renderRowHeaders({ top, bottom }: Range): void {
        const cells = Array.from(this.#grid.rowHeadersElement.children) as HTMLDivElement[];
        for (const cellElement of cells) {
            cellElement.remove();
        }
        const fragment = new DocumentFragment();

        for (let y = top; y <= bottom; y++) {
            const cell = this.#renderRowHeaderCell(y, 0);
            fragment.append(cell);
        }

        this.#grid.rowHeadersElement.append(fragment);
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

    #renderCell(rowIndex: number, columnIndex: number): HTMLDivElement {
        const { fromLeft, width } = this.#grid.columns.items.get(columnIndex)!;

        const cell = this.#createCell(CellType.Cell, rowIndex, columnIndex);
        cell.style.transform = `translate(${fromLeft}px, ${rowIndex * this.#grid.cellSize}px)`;
        cell.style.width = `${width}px`;
        cell.style.height = `${this.#grid.cellSize}px`;

        return cell;
    }

    #renderColumnHeaderCell(rowIndex: number, columnIndex: number): HTMLDivElement {
        const { fromLeft, width } = this.#grid.columns.items.get(columnIndex)!;
        const leftScroll = this.#grid.cellsElement.scrollLeft;

        const cell = this.#createCell(CellType.Cell, rowIndex, columnIndex);
        cell.style.transform = `translate(${fromLeft - leftScroll}px, ${rowIndex * this.#grid.cellSize}px)`;
        cell.style.width = `${width}px`;
        cell.style.height = `${this.#grid.cellSize}px`;

        return cell;
    }

    #renderRowHeaderCell(rowIndex: number, columnIndex: number): HTMLDivElement {
        const cell = this.#createCell(CellType.Cell, rowIndex, columnIndex);
        const leftTop = this.#grid.cellsElement.scrollTop;
        cell.style.transform = `translate(0px, ${rowIndex * this.#grid.cellSize - leftTop}px)`;
        cell.style.width = `${this.#grid.cellSize}px`;
        cell.style.height = `${this.#grid.cellSize}px`;

        return cell;
    }

    #updateExpander() {
        const x = this.#grid.columns.items.reduce((value, column) => value + column.width, 0);
        const y = this.#grid.source.items.size * this.#grid.cellSize;
        const he = this.#grid.hostElement;
        he.style.setProperty("--internal-expander-translate-x", `${x}px`, "important");
        he.style.setProperty("--internal-expander-translate-y", `${y}px`, "important");
    }

    #getFirstColumn(columns: ColumnManager, scrollLeft: number): number {
        let rightEdge = 0;
        for (const column of columns.items) {
            rightEdge += column.width;
            if (rightEdge > scrollLeft) {
                return column.index;
            }
        }
        return -1;
    }

    #getFirstRow(scrollTop: number, cellSize: number): number {
        return Math.floor(scrollTop / cellSize);
    }

    #getStartPoint(grid: TheGrid<object>, cellsElement: HTMLDivElement): Point {
        const { scrollLeft, scrollTop } = cellsElement;
        const x = this.#getFirstColumn(grid.columns, scrollLeft);
        const y = this.#getFirstRow(scrollTop, grid.cellSize);
        return new Point(x, y);
    }

    #getLastColumn(columns: ColumnManager, cellsElement: HTMLDivElement): number {
        const items = columns.items;
        const scrollRight = cellsElement.scrollLeft + cellsElement.clientWidth;
        for (const { fromLeft, index } of items.reverse()) {
            const leftEdge = fromLeft;
            if (leftEdge <= scrollRight) {
                return index;
            }
        }
        return items.last()?.index ?? -1;
    }

    #getLastRow(cellsElement: HTMLDivElement, cellSize: number): number {
        const { scrollTop, clientHeight } = cellsElement;
        return Math.ceil((scrollTop + (clientHeight - 1)) / cellSize);
    }

    #getEndPoint(grid: TheGrid<object>, cellsElement: HTMLDivElement): Point {
        const x = this.#getLastColumn(grid.columns, cellsElement);
        const y = this.#getLastRow(cellsElement, grid.cellSize);
        return new Point(x, y);
    }

    #calculateRenderArea(grid: TheGrid<object>): Range {
        const cellsElement = grid.hostElement.querySelector<HTMLDivElement>("[data-area='cells']")!;
        const start = this.#getStartPoint(grid, cellsElement);
        const end = this.#getEndPoint(grid, cellsElement);
        return new Range(start.x, start.y, end.x, end.y);
    }
}
