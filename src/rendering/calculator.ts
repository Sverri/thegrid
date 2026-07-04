import type { ColumnManager } from "@/column/columnmanager";
import type { TheGrid } from "@/thegrid";
import { Point } from "@/shared/point";

export class Calculator {
    #grid: TheGrid<Record<string, any>>;
    #cellsElement: HTMLDivElement;
    #columns: ColumnManager;

    constructor(grid: TheGrid<Record<string, any>>) {
        this.#grid = grid;
        this.#cellsElement = grid.hostElement.querySelector<HTMLDivElement>("[data-area='cells']")!;
        this.#columns = grid.columns;
    }

    #getFirstColumn() {
        const items = this.#columns.items;
        const scrollLeft = this.#cellsElement.scrollLeft;
        let rightEdge = 0;
        for (const column of items) {
            rightEdge += column.width;
            if (rightEdge > scrollLeft) {
                return column.index;
            }
        }
        return 0;
    }

    #getFirstRow() {
        return Math.floor(this.#cellsElement.scrollTop / this.#grid.cellSize);
    }

    getStartPoint(): Point {
        const x = this.#getFirstColumn();
        const y = this.#getFirstRow();
        return new Point(x, y);
    }

    #getLastColumn() {
        const items = this.#columns.items;
        const width = this.#cellsElement.clientWidth;
        const scrollRight = this.#cellsElement.scrollLeft + width;
        for (const column of items.reverse()) {
            const leftEdge = column.fromLeft;
            if (leftEdge <= scrollRight) {
                return column.index;
            }
        }
        return items.last()?.index ?? -1;
    }

    #getLastRow() {
        const scrollTop = this.#cellsElement.scrollTop;
        const height = this.#cellsElement.clientHeight - 1;
        const max = this.#grid.source.items.size;
        return Math.min(max, Math.ceil((scrollTop + height) / this.#grid.cellSize));
    }

    getEndPoint(): Point {
        const x = this.#getLastColumn();
        const y = this.#getLastRow();
        return new Point(x, y);
    }
}
