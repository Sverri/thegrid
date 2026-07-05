import type { TheGrid } from "@/thegrid";
import { CellType } from "@/shared/enums";
import { Range } from "@/shared/range";

export class Renderer {
    #grid: TheGrid<any>;

    constructor(grid: TheGrid<any>) {
        this.#grid = grid;
        this.#grid.cellsElement.addEventListener("scroll", () => {
            this.render();
        });
    }

    render(): void {
        const range = this.#calculateRenderRange();
        this.#updateExpander();
        this.#renderCells(range);
        this.#renderColumnHeaders(range);
        this.#renderRowHeaders(range);
    }

    #renderCells({ left, right, top, bottom }: Range): void {
        const { cellsElement, columns, source } = this.#grid;
        const cells = Array.from(cellsElement.children) as HTMLDivElement[];
        const fragment = new DocumentFragment();

        for (let rowIndex = top; rowIndex <= bottom; rowIndex++) {
            for (let columnIndex = left; columnIndex <= right; columnIndex++) {
                const index = cells.findIndex(
                    cell =>
                        cell.dataset.row == String(rowIndex) &&
                        cell.dataset.column == String(columnIndex),
                );
                if (index !== -1) {
                    cells.splice(index, 1);
                    continue;
                }
                const cell = this.#renderCell(rowIndex, columnIndex);
                const { binding } = columns.items.get(columnIndex)!;
                const content = source.items.get(rowIndex)![binding];
                cell.textContent = String(content);
                fragment.append(cell);
            }
        }

        cellsElement.append(fragment);

        if (cells.length > 0) {
            for (const element of cells) {
                element.remove();
            }
        }
    }

    #renderColumnHeaders({ left, right }: Range): void {
        const { columns, columnHeadersElement } = this.#grid;
        const cells = Array.from(columnHeadersElement.children) as HTMLDivElement[];
        for (const cellElement of cells) {
            cellElement.remove();
        }
        if (left === -1) {
            return;
        }
        const fragment = new DocumentFragment();

        for (let columnIndex = left; columnIndex <= right; columnIndex++) {
            const cell = this.#renderColumnHeaderCell(0, columnIndex);
            const { header } = columns.items.get(columnIndex)!;
            cell.textContent = header;
            fragment.append(cell);
        }

        columnHeadersElement.append(fragment);
    }

    #renderRowHeaders({ top, bottom }: Range): void {
        const { rowHeadersElement } = this.#grid;

        const cells = Array.from(rowHeadersElement.children) as HTMLDivElement[];
        for (const cellElement of cells) {
            cellElement.remove();
        }
        const fragment = new DocumentFragment();

        for (let rowIndex = top; rowIndex <= bottom; rowIndex++) {
            const cell = this.#renderRowHeaderCell(rowIndex, 0);
            fragment.append(cell);
        }

        rowHeadersElement.append(fragment);
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
        const { columns, cellSize } = this.#grid;
        const { fromLeft, width } = columns.items.get(columnIndex)!;

        const cell = this.#createCell(CellType.Cell, rowIndex, columnIndex);
        cell.style.transform = `translate(${fromLeft}px, ${rowIndex * cellSize}px)`;
        cell.style.width = `${width}px`;
        cell.style.height = `${cellSize}px`;

        return cell;
    }

    #renderColumnHeaderCell(rowIndex: number, columnIndex: number): HTMLDivElement {
        const { columns, cellsElement, cellSize } = this.#grid;
        const { fromLeft, width } = columns.items.get(columnIndex)!;
        const leftScroll = cellsElement.scrollLeft;

        const cell = this.#createCell(CellType.ColumnHeader, rowIndex, columnIndex);
        cell.style.transform = `translate(${fromLeft - leftScroll}px, ${rowIndex * cellSize}px)`;
        cell.style.width = `${width}px`;
        cell.style.height = `${cellSize}px`;

        return cell;
    }

    #renderRowHeaderCell(rowIndex: number, columnIndex: number): HTMLDivElement {
        const { cellsElement, cellSize } = this.#grid;
        const cell = this.#createCell(CellType.RowHeader, rowIndex, columnIndex);
        const leftTop = cellsElement.scrollTop;
        cell.style.transform = `translate(0px, ${rowIndex * cellSize - leftTop}px)`;
        cell.style.width = `${cellSize}px`;
        cell.style.height = `${cellSize}px`;

        return cell;
    }

    #updateExpander() {
        const { columns, source, hostElement, cellSize } = this.#grid;
        const x = columns.items.reduce((value, column) => value + column.width, 0);
        const y = source.items.size * cellSize;
        hostElement.style.setProperty("--internal-expander-translate-x", `${x}px`, "important");
        hostElement.style.setProperty("--internal-expander-translate-y", `${y}px`, "important");
    }

    #calculateRenderRange() {
        const { columns, source, cellsElement, cellSize } = this.#grid;
        const { scrollLeft, scrollTop, clientWidth, clientHeight } = cellsElement;
        const rowsCount = source.items.size;

        const firstColumn = columns.items.find(
            column => column.fromLeft + column.width >= scrollLeft,
        );

        const lastColumn = columns.items
            .reverse()
            .find(column => column.fromLeft <= scrollLeft + clientWidth);

        let firstRow: number = -1;
        let lastRow: number = -1;
        if (rowsCount > 0) {
            firstRow = Math.min(rowsCount - 1, Math.floor(scrollTop / cellSize));
            lastRow = Math.min(rowsCount - 1, Math.ceil((scrollTop + clientHeight) / cellSize));
        }

        return new Range(firstColumn?.index ?? -1, firstRow, lastColumn?.index ?? -1, lastRow);
    }
}
