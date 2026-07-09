import type { TheGrid } from "@/grid";
import { CellType, DataType } from "@/shared/enums";
import { type Range } from "@/shared/range";
import { getElementScrollDimensions, type ElementScrollDimensions } from "./helpers/getelementscrolldimensions";
import { createCell } from "@/helpers/createcell";
import { calculateRenderArea } from "@/render/calculaterenderarea";

interface Options {
    grid: TheGrid<any>;
    zebra: boolean;
}

export class Renderer {
    #grid: TheGrid<object>;
    #zebra: boolean;

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
        this.#updateExpander();
        this.#renderCells(renderArea);
        this.#renderColumnHeaders(renderArea, dimensions);
        this.#renderRowHeaders(renderArea, dimensions);
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

    #renderColumnHeaders({ left, right }: Range, { scrollLeft }: ElementScrollDimensions): void {
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
            const cell = createCell(CellType.ColumnHeader, 0, columnIndex, {
                transform: `translateX(${fromLeft - scrollLeft}px)`,
                width: `${width}px`,
                height: `${cellSize}px`,
            });

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

    #renderRowHeaders({ top, bottom }: Range, { scrollTop }: ElementScrollDimensions): void {
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
            const cell = createCell(CellType.RowHeader, rowIndex, 0, {
                transform: `translateY(${rowIndex * cellSize - scrollTop}px)`,
                width: `${cellSize}px`,
                height: `${cellSize}px`,
            });

            if (selection) {
                if (rowIndex >= selection.top && rowIndex <= selection.bottom) {
                    cell.classList.add("row-selected");
                }
            }

            fragment.append(cell);
        }

        rowHeadersElement.append(fragment);
    }

    #renderCell(rowIndex: number, columnIndex: number): HTMLDivElement {
        const { columns, cellSize, selection } = this.#grid;
        const { fromLeft, width, dataType } = columns.items.get(columnIndex)!;

        const cell = createCell(CellType.Cell, rowIndex, columnIndex, {
            transform: `translate(${fromLeft}px, ${rowIndex * cellSize}px)`,
            width: `${width}px`,
            height: `${cellSize}px`,
        });
        cell.tabIndex = 0;

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

    #setCellContent(cell: HTMLElement, columnType: DataType, rowIndex: number, columnIndex: number): void {
        const cellData = this.#grid.getCellData(rowIndex, columnIndex);
        if (cellData != undefined) {
            switch (columnType) {
                case DataType.Boolean: {
                    cell.textContent = String(cellData === true);
                    break;
                }
                case DataType.Decimal: {
                    cell.textContent = Number(cellData).toFixed(2);
                    break;
                }
                case DataType.Integer: {
                    cell.textContent = Number(cellData).toFixed(0);
                    break;
                }
                case DataType.String:
                case DataType.Text:
                case DataType.URL:
                case DataType.Email: {
                    cell.textContent = String(cellData);
                    break;
                }
                case DataType.Date: {
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
        const x = columns.items.reduce((value, { visible, width }) => (visible ? value + width : 0), 0);
        const y = source.items.size * cellSize;
        hostElement.style.setProperty("--internal-expander-translate-x", `${x}px`, "important");
        hostElement.style.setProperty("--internal-expander-translate-y", `${y}px`, "important");
    }
}
