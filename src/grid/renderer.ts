import type { Grid } from "./grid";
import type { Range } from "@structure/range";
import { createCell } from "@extension/shared/createcell";
import { CellType, Headers } from "@shared/enums";
import { columnFromLeft } from "@structure/column";
import { renderCellSelection } from "@extension/shared/renderselection";
import { setCellContents } from "@extension/shared/setcellcontents";
import { getElementScrollDimensions, type ElementScrollDimensions } from "@helpers/getelementscrolldimensions";
import { calculateRenderArea } from "@extension/shared/calculaterenderarea";
import type { Point } from "@structure/point";
import { debounce } from "throttle-debounce";

const renderAhead = {
    columns: 1,
    rows: 3,
};

/**
 * Class that handles everything having to do with rendering of the grid.
 */
class Renderer {
    #grid: Grid<any>;

    constructor(grid: Grid<any>) {
        this.#grid = grid;
    }

    render() {
        const { cellsElement } = this.#grid;
        const dimensions = getElementScrollDimensions(cellsElement);
        const renderArea = calculateRenderArea(this.#grid, renderAhead);
        this.#renderCells(renderArea);
        this.#renderColumnHeaders(renderArea, dimensions);
        this.#renderRowHeaders(renderArea, dimensions);
    }

    updateSelection = debounce(16, () => {
        const { selection, cellsElement, columns } = this.#grid;
        const renderArea = calculateRenderArea(this.#grid, renderAhead);
        const dimensions = getElementScrollDimensions(cellsElement);

        this.#removeSelectionFromCells();

        for (const { x, y } of renderArea.iterator()) {
            const cell = cellsElement.querySelector<HTMLDivElement>(`[data-column="${x}"][data-row="${y}"]`);
            if (cell) {
                renderCellSelection(cell, selection.range, columns.items, x, y);
            }
        }

        this.#renderColumnHeaders(renderArea, dimensions);
        this.#renderRowHeaders(renderArea, dimensions);
    });

    #renderItems(
        element: HTMLElement,
        points: Generator<Point>,
        createItem: (point: Point) => HTMLElement | undefined,
    ): void {
        element.textContent = "";
        for (const point of points) {
            const item = createItem(point);
            if (item) {
                element.append(item);
            }
        }
    }

    #renderCells(range: Range) {
        const grid = this.#grid;
        const { cellsElement, cellSize, columns, selection } = grid;

        this.#renderItems(cellsElement, range.iterator(), ({ x, y }) => {
            const column = columns.items.at(x);
            if (!column) {
                return undefined;
            }

            const cell = createCell({
                type: CellType.Cell,
                width: column.width,
                height: cellSize,
                top: y * cellSize,
                left: columnFromLeft(columns.items, x),
                columnIndex: x,
                rowIndex: y,
            });

            setCellContents(cell, column, grid.getCellData(x, y));
            renderCellSelection(cell, selection.range, columns.items, x, y);

            cell.classList.add(y % 2 === 0 ? "row-even" : "row-odd");

            column.formatter?.(
                Object.freeze({
                    cell,
                    columnIndex: x,
                    rowIndex: y,
                    get data() {
                        return grid.getCellData(x, y);
                    },
                }),
            );
            return cell;
        });
    }

    #renderColumnHeaders(range: Range, { scrollLeft }: ElementScrollDimensions) {
        const { showHeaders, hostElement } = this.#grid;
        const renderColumnHeaders = showHeaders == Headers.Columns || showHeaders == Headers.Both;

        hostElement.classList.toggle("thegrid-hide-column-headers", !renderColumnHeaders);

        if (!renderColumnHeaders) {
            return;
        }

        const { columnHeadersElement, cellSize, showHeaderSelection, columns, selection } = this.#grid;

        this.#renderItems(columnHeadersElement, range.horizontalIterator(), ({ x }) => {
            const column = columns.items.at(x);
            if (!column) {
                return undefined;
            }

            const cell = createCell({
                type: CellType.ColumnHeader,
                width: column.width,
                height: cellSize,
                top: 0,
                left: columnFromLeft(columns.items, x) - scrollLeft,
                columnIndex: x,
                rowIndex: 0,
            });

            const showColumnSelected = showHeaderSelection === Headers.Columns || showHeaderSelection === Headers.Both;

            if (showColumnSelected && x >= selection.range.left && x <= selection.range.right) {
                cell.classList.add("column-selected");
            }
            cell.textContent = column.header;
            return cell;
        });
    }

    #renderRowHeaders(range: Range, { scrollTop }: ElementScrollDimensions) {
        const { rowHeadersElement, cellSize, showHeaderSelection, selection, showHeaders, hostElement } = this.#grid;
        const renderRowHeaders = showHeaders == Headers.Rows || showHeaders == Headers.Both;

        hostElement.classList.toggle("thegrid-hide-row-headers", !renderRowHeaders);

        if (!renderRowHeaders) {
            return;
        }

        if (range.left === -1) {
            // No columns, don't show rows
            rowHeadersElement.textContent = "";
            return;
        }

        this.#renderItems(rowHeadersElement, range.verticalIterator(), ({ y }) => {
            const cell = createCell({
                type: CellType.RowHeader,
                width: cellSize,
                height: cellSize,
                top: y * cellSize - scrollTop,
                left: 0,
                columnIndex: 0,
                rowIndex: y,
            });

            const showColumnSelected = showHeaderSelection === Headers.Rows || showHeaderSelection === Headers.Both;

            const { top, bottom } = selection.range;
            if (showColumnSelected && y >= top && y <= bottom) {
                cell.classList.add("row-selected");
            }
            return cell;
        });
    }

    #removeSelectionFromCells() {
        const selectionCells = this.#grid.cellsElement.querySelectorAll(
            ".selection, .selection-right-border, .selection-bottom-border",
        );
        for (const child of selectionCells) {
            child.classList.remove("selection");
            child.classList.remove("selection-right-border");
            child.classList.remove("selection-bottom-border");
            child.classList.remove("selection-current");
        }
    }
}

export type { Renderer };

export function createRenderer(grid: Grid<any>) {
    return new Renderer(grid);
}
