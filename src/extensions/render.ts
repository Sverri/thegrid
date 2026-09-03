import type { DataItem } from "@shared/types";
import type { Grid } from "@grid/grid";
import { type Range } from "@structure/range";
import { getElementScrollDimensions, type ElementScrollDimensions } from "@helpers/getelementscrolldimensions";
import { createCell } from "@extension/shared/createcell";
import { calculateRenderArea } from "@extension/shared/calculaterenderarea";
import { renderCellSelection } from "@extension/shared/renderselection";
import { setCellContents } from "@extension/shared/setcellcontents";
import { CellType, HeaderSelection } from "@shared/enums";
import { columnFromLeft } from "@structure/column";

const renderAhead = {
    columns: 1,
    rows: 3,
};

export function renderExtension<T extends DataItem>(grid: Grid<T>): void {
    grid.cellsElement.classList.add("thegrid-enable-zebra");

    const renderCells = (range: Range) => {
        const { cellsElement, cellSize, columns, selection } = grid;
        cellsElement.textContent = "";

        for (const { x, y } of range.iterator()) {
            const column = columns.items.at(x);
            if (!column) {
                continue;
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

            renderCellSelection(cell, selection, columns.items, x, y);
            setCellContents(cell, column.dataType, grid.getCellData(x, y));

            cell.classList.add(y % 2 === 0 ? "row-even" : "row-odd");
            cellsElement.append(cell);
        }
    };

    const renderColumnHeaders = (range: Range, { scrollLeft }: ElementScrollDimensions) => {
        const { columnHeadersElement, cellSize, showHeaderSelection, columns, selection } = grid;
        columnHeadersElement.textContent = "";

        for (const { x } of range.horizontalIterator()) {
            const column = columns.items.at(x);
            if (!column) {
                continue;
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

            const showColumnSelected =
                showHeaderSelection === (HeaderSelection.Columns || showHeaderSelection === HeaderSelection.Both);

            if (showColumnSelected && selection && x >= selection.left && x <= selection.right) {
                cell.classList.add("column-selected");
            }
            cell.textContent = column.header;
            columnHeadersElement.append(cell);
        }
    };

    const renderRowHeaders = (range: Range, { scrollTop }: ElementScrollDimensions) => {
        const { rowHeadersElement, cellSize, showHeaderSelection, selection } = grid;
        rowHeadersElement.textContent = "";
        if (range.left === -1) {
            // No columns, don't show rows
            return;
        }
        for (const { y } of range.verticalIterator()) {
            const cell = createCell({
                type: CellType.RowHeader,
                width: cellSize,
                height: cellSize,
                top: y * cellSize - scrollTop,
                left: 0,
                columnIndex: 0,
                rowIndex: y,
            });

            const showColumnSelected =
                showHeaderSelection === HeaderSelection.Rows || showHeaderSelection === HeaderSelection.Both;

            if (showColumnSelected && selection && y >= selection.top && y <= selection.bottom) {
                cell.classList.add("row-selected");
            }
            rowHeadersElement.append(cell);
        }
    };

    const render = () => {
        const dimensions = getElementScrollDimensions(grid.cellsElement);
        const renderArea = calculateRenderArea(grid, renderAhead);
        renderCells(renderArea);
        renderColumnHeaders(renderArea, dimensions);
        renderRowHeaders(renderArea, dimensions);
    };

    grid.cellsElement.addEventListener("scroll", render, { passive: true });
    grid.onInvalidate.subscribe(render);
}
