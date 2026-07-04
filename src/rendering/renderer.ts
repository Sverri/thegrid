import { CellType } from "@/shared/enums";
import { calculateRenderArea } from "@/rendering/calculaterenderarea";
import type { TheGrid } from "@/thegrid";

interface Options {
    grid: TheGrid<any>;
}

export class Renderer {
    #grid: TheGrid<any>;

    constructor(options: Options) {
        this.#grid = options.grid;
    }

    render(): void {
        this.#updateExpander();
        this.#renderCells();
        this.#renderColumnHeaders();
        this.#renderRowHeaders();
    }

    #renderCells(): void {
        const cells = Array.from(this.#grid.cellsElement.children) as HTMLDivElement[];
        const fragment = new DocumentFragment();

        for (const { x, y } of this.#generateRenderCoordinates()) {
            const index = cells.findIndex(
                cell => cell.dataset.row == String(y) && cell.dataset.column == String(x),
            );
            if (index !== -1) {
                cells.splice(index, 1);
                continue;
            }
            const cell = this.#renderCell(y, x);
            fragment.append(cell);
        }

        this.#grid.cellsElement.append(fragment);

        if (cells.length > 0) {
            for (const element of cells) {
                element.remove();
            }
        }
    }

    #renderColumnHeaders(): void {
        // const cells = Array.from(this.#grid.columnHeadersElement.children) as HTMLDivElement[];
        // const fragment = new DocumentFragment();
        // for (const { x, y } of this.#generateRenderCoordinates()) {
        //     const index = cells.findIndex(
        //         cell => cell.dataset.row == String(y) && cell.dataset.column == String(x),
        //     );
        //     if (index !== -1) {
        //         cells.splice(index, 1);
        //         continue;
        //     }
        //     const cell = this.#renderCell(y, x);
        //     fragment.append(cell);
        // }
        // this.#grid.columnHeadersElement.append(fragment);
        // if (cells.length > 0) {
        //     for (const element of cells) {
        //         element.remove();
        //     }
        // }
    }

    #renderRowHeaders(): void {
        // const cells = Array.from(this.#grid.cellsElement.children) as HTMLDivElement[];
        // const fragment = new DocumentFragment();
        // for (const { x, y } of this.#generateRenderCoordinates()) {
        //     const index = cells.findIndex(
        //         cell => cell.dataset.row == String(y) && cell.dataset.column == String(x),
        //     );
        //     if (index !== -1) {
        //         cells.splice(index, 1);
        //         continue;
        //     }
        //     const cell = this.#renderCell(y, x);
        //     fragment.append(cell);
        // }
        // this.#grid.cellsElement.append(fragment);
        // if (cells.length > 0) {
        //     for (const element of cells) {
        //         element.remove();
        //     }
        // }
    }

    *#generateRenderCoordinates() {
        const { top, bottom, left, right } = calculateRenderArea(this.#grid);
        for (let y = top; y < bottom; y++) {
            for (let x = left; x <= right; x++) {
                yield { x, y };
            }
        }
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
        const { fromLeft, width, binding } = this.#grid.columns.items.get(columnIndex)!;

        const cell = this.#createCell(CellType.Cell, rowIndex, columnIndex);
        cell.style.transform = `translate(${fromLeft}px, ${rowIndex * this.#grid.cellSize}px)`;
        cell.style.width = `${width}px`;
        cell.style.height = `${this.#grid.cellSize}px`;

        const content = this.#grid.source.items.get(rowIndex)![binding];
        cell.textContent = String(content);

        return cell;
    }

    #updateExpander() {
        const x = this.#grid.columns.items.reduce((value, column) => value + column.width, 0);
        const y = this.#grid.source.items.size * this.#grid.cellSize;
        const he = this.#grid.hostElement;
        he.style.setProperty("--internal-expander-translate-x", `${x}px`, "important");
        he.style.setProperty("--internal-expander-translate-y", `${y}px`, "important");
    }
}
