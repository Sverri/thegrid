import type { TheGrid } from "@/thegrid";
import { CellType, ColumnType } from "@/shared/enums";
import { Range } from "@/shared/range";

interface Options {
    grid: TheGrid<any>;
    zebra: boolean;
}

interface RenderMeta {
    scrollLeft: number;
    scrollTop: number;
    clientWidth: number;
    clientHeight: number;
}

export class Renderer {
    #grid: TheGrid<any>;
    #zebra: boolean;

    constructor({ grid, zebra }: Options) {
        this.#grid = grid;
        this.#zebra = zebra;
        if (this.#zebra) {
            this.#grid.cellsElement.classList.add("thegrid-enable-zebra");
        }
        this.#grid.cellsElement.addEventListener("scroll", () => {
            this.render();
        });
    }

    render(): void {
        const meta = {
            scrollLeft: this.#grid.cellsElement.scrollLeft,
            scrollTop: this.#grid.cellsElement.scrollTop,
            clientWidth: this.#grid.cellsElement.clientWidth,
            clientHeight: this.#grid.cellsElement.clientHeight,
        };
        const range = this.#calculateRenderRange(meta);
        this.#updateExpander();
        this.#renderCells(range);
        this.#renderColumnHeaders(range, meta);
        this.#renderRowHeaders(range, meta);
    }

    #renderCells({ left, right, top, bottom }: Range): void {
        const { cellsElement } = this.#grid;
        const cells = Array.from(cellsElement.children) as HTMLDivElement[];
        const fragment = new DocumentFragment();

        for (let rowIndex = top; rowIndex <= bottom; rowIndex++) {
            for (let columnIndex = left; columnIndex <= right; columnIndex++) {
                const column = this.#grid.columns.items.get(columnIndex)!;
                if (!column.visible) {
                    continue;
                }
                const cell = this.#renderCell(rowIndex, columnIndex);
                cell.classList.add(rowIndex % 2 === 0 ? "row-even" : "row-odd");
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

    #renderColumnHeaders({ left, right }: Range, meta: RenderMeta): void {
        const { columnHeadersElement, columns, cellSize, selection } = this.#grid;
        const cells = Array.from(columnHeadersElement.children) as HTMLDivElement[];
        for (const cellElement of cells) {
            cellElement.remove();
        }
        if (left === -1 || right === -1) {
            return;
        }
        const fragment = new DocumentFragment();

        for (let columnIndex = left; columnIndex <= right; columnIndex++) {
            const { header, visible, fromLeft, width, index } = columns.items.get(columnIndex)!;
            if (!visible) {
                continue;
            }
            const cell = this.#createCell(CellType.ColumnHeader, 0, columnIndex);
            const { scrollLeft } = meta;
            cell.style.transform = `translateX(${fromLeft - scrollLeft}px)`;
            cell.style.width = `${width}px`;
            cell.style.height = `${cellSize}px`;

            if (selection) {
                if (index >= selection.left && index <= selection.right) {
                    cell.classList.add("column-selected");
                }
            }

            cell.textContent = header;
            fragment.append(cell);
        }

        columnHeadersElement.append(fragment);
    }

    #renderRowHeaders({ top, bottom }: Range, meta: RenderMeta): void {
        const { rowHeadersElement, cellSize, selection } = this.#grid;
        const cells = Array.from(rowHeadersElement.children) as HTMLDivElement[];

        for (const cellElement of cells) {
            cellElement.remove();
        }

        if (top === -1 || bottom === -1) {
            return;
        }

        const fragment = new DocumentFragment();

        for (let rowIndex = top; rowIndex <= bottom; rowIndex++) {
            const cell = this.#createCell(CellType.RowHeader, rowIndex, 0);
            const { scrollTop } = meta;
            cell.style.transform = `translateY(${rowIndex * cellSize - scrollTop}px)`;
            cell.style.width = `${cellSize}px`;
            cell.style.height = `${cellSize}px`;

            if (selection) {
                if (rowIndex >= selection.top && rowIndex <= selection.bottom) {
                    cell.classList.add("row-selected");
                }
            }

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
        const { columns, cellSize, selection } = this.#grid;
        const { fromLeft, width, dataType } = columns.items.get(columnIndex)!;

        const cell = this.#createCell(CellType.Cell, rowIndex, columnIndex);
        cell.tabIndex = 0;
        cell.style.transform = `translate(${fromLeft}px, ${rowIndex * cellSize}px)`;
        cell.style.width = `${width}px`;
        cell.style.height = `${cellSize}px`;

        if (selection) {
            this.#renderSelectionBorders(cell, rowIndex, columnIndex);
        }
        this.#setCellContent(cell, dataType, rowIndex, columnIndex);

        return cell;
    }

    #renderSelectionBorders(cell: HTMLElement, rowIndex: number, columnIndex: number): void {
        const { left, right, top, bottom } = this.#grid.selection!;

        if (columnIndex >= left && columnIndex <= right && rowIndex >= top && rowIndex <= bottom) {
            cell.classList.add("selection");
        }

        if (rowIndex >= top && rowIndex <= bottom) {
            if (columnIndex === 0 && columnIndex === left) {
                cell.classList.add("selection-left-border");
            } else if (columnIndex === left - 1) {
                cell.classList.add("selection-right-border");
            }
            if (columnIndex === right) {
                cell.classList.add("selection-right-border");
            }
        }

        if (columnIndex >= left && columnIndex <= right) {
            if (rowIndex === 0 && rowIndex === top) {
                cell.classList.add("selection-top-border");
            } else if (rowIndex === top - 1) {
                cell.classList.add("selection-bottom-border");
            }
            if (rowIndex === bottom) {
                cell.classList.add("selection-bottom-border");
            }
        }
    }

    #setCellContent(
        cell: HTMLElement,
        columnType: ColumnType,
        rowIndex: number,
        columnIndex: number,
    ): void {
        const cellData = this.#grid.getCellData(rowIndex, columnIndex);
        if (cellData != undefined) {
            switch (columnType) {
                case ColumnType.Boolean: {
                    cell.textContent = String(cellData === true);
                    break;
                }
                case ColumnType.Decimal: {
                    cell.textContent = Number(cellData).toFixed(2);
                    break;
                }
                case ColumnType.Integer: {
                    cell.textContent = Number(cellData).toFixed(0);
                    break;
                }
                case ColumnType.String:
                case ColumnType.Text:
                case ColumnType.URL:
                case ColumnType.Email: {
                    cell.textContent = String(cellData);
                    break;
                }
                case ColumnType.Date: {
                    cell.textContent = new Date(cellData as Date).toDateString();
                    break;
                }
            }
        } else {
            cell.textContent = "";
        }
    }

    #updateExpander() {
        const { columns, source, hostElement, cellSize } = this.#grid;
        const x = columns.items.reduce(
            (value, { visible, width }) => (visible ? value + width : 0),
            0,
        );
        const y = source.items.size * cellSize;
        hostElement.style.setProperty("--internal-expander-translate-x", `${x}px`, "important");
        hostElement.style.setProperty("--internal-expander-translate-y", `${y}px`, "important");
    }

    #calculateRenderRange(meta: RenderMeta) {
        const { columns, source, cellSize } = this.#grid;
        const { scrollLeft, scrollTop, clientWidth, clientHeight } = meta;
        const rowsCount = source.items.size;

        const firstColumn = columns.items.find(
            ({ visible, fromLeft, width }) => visible && fromLeft + width >= scrollLeft,
        );

        const lastColumn = columns.items
            .reverse()
            .find(({ visible, fromLeft }) => visible && fromLeft <= scrollLeft + clientWidth);

        let firstRow: number = -1;
        let lastRow: number = -1;
        if (rowsCount > 0) {
            firstRow = Math.min(rowsCount - 1, Math.floor(scrollTop / cellSize));
            lastRow = Math.min(rowsCount - 1, Math.floor((scrollTop + clientHeight) / cellSize));
        }

        return new Range(firstColumn?.index ?? -1, firstRow, lastColumn?.index ?? -1, lastRow);
    }
}
