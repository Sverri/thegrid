import type { ColumnManager } from "@/column/columnmanager";
import type { TheGrid } from "@/thegrid";
import { Point } from "@/shared/point";
import { Range } from "@/shared/range";

function getFirstColumn(columns: ColumnManager, scrollLeft: number): number {
    let rightEdge = 0;
    for (const column of columns.items) {
        rightEdge += column.width;
        if (rightEdge > scrollLeft) {
            return column.index;
        }
    }
    return -1;
}

function getFirstRow(scrollTop: number, cellSize: number): number {
    return Math.floor(scrollTop / cellSize);
}

function getStartPoint(grid: TheGrid<object>, cellsElement: HTMLDivElement): Point {
    const { scrollLeft, scrollTop } = cellsElement;
    const x = getFirstColumn(grid.columns, scrollLeft);
    const y = getFirstRow(scrollTop, grid.cellSize);
    return new Point(x, y);
}

function getLastColumn(columns: ColumnManager, cellsElement: HTMLDivElement): number {
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

function getLastRow(cellsElement: HTMLDivElement, cellSize: number): number {
    const { scrollTop, clientHeight } = cellsElement;
    return Math.ceil((scrollTop + (clientHeight - 1)) / cellSize);
}

function getEndPoint(grid: TheGrid<object>, cellsElement: HTMLDivElement): Point {
    const x = getLastColumn(grid.columns, cellsElement);
    const y = getLastRow(cellsElement, grid.cellSize);
    return new Point(x, y);
}

export function calculateRenderArea(grid: TheGrid<object>): Range {
    const cellsElement = grid.hostElement.querySelector<HTMLDivElement>("[data-area='cells']")!;
    const start = getStartPoint(grid, cellsElement);
    const end = getEndPoint(grid, cellsElement);
    return new Range(start.x, start.y, end.x, end.y);
}
