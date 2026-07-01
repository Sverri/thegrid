import type { ColumnCollection } from "@/column/columncollection";
import type { TheGrid } from "@/thegrid";
import { Point } from "@/shared/point";
import { Range } from "@/shared/range";

function getFirstColumn(columns: ColumnCollection, scrollLeft: number) {
    const items = columns.items;
    let rightEdge = 0;
    for (const column of items) {
        rightEdge += column.width;
        if (rightEdge > scrollLeft) {
            return column.index;
        }
    }
    return 0;
}

function getFirstRow(scrollTop: number, cellSize: number) {
    return Math.floor(scrollTop / cellSize);
}

function getStartPoint(grid: TheGrid<object>, cellsElement: HTMLDivElement): Point {
    const x = getFirstColumn(grid.columns, cellsElement.scrollLeft);
    const y = getFirstRow(cellsElement.scrollTop, grid.cellSize);
    return new Point(x, y);
}

function getLastColumn(columns: ColumnCollection, cellsElement: HTMLDivElement): number {
    const items = columns.items;
    const width = cellsElement.clientWidth;
    const scrollRight = cellsElement.scrollLeft + width;
    for (const column of items.reverse()) {
        const leftEdge = column.fromLeft;
        if (leftEdge <= scrollRight) {
            return column.index;
        }
    }
    return items.last()?.index ?? -1;
}

function getLastRow(cellsElement: HTMLDivElement, dataLength: number, cellSize: number) {
    const scrollTop = cellsElement.scrollTop;
    const height = cellsElement.clientHeight - 1;
    return Math.min(dataLength, Math.ceil((scrollTop + height) / cellSize));
}

function getEndPoint(grid: TheGrid<object>, cellsElement: HTMLDivElement): Point {
    const x = getLastColumn(grid.columns, cellsElement);
    const y = getLastRow(cellsElement, grid.collection.items.size, grid.cellSize);
    return new Point(x, y);
}

export function calculateRenderArea(grid: TheGrid<object>): Range {
    const cellsElement = grid.hostElement.querySelector<HTMLDivElement>("[data-area='cells']")!;
    const start = getStartPoint(grid, cellsElement);
    const end = getEndPoint(grid, cellsElement);
    return new Range(start.x, start.y, end.x, end.y);
}
