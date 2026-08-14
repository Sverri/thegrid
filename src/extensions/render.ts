import type { DataItem, ExtendObject } from "@/types";
import { type Range } from "@/structures/range";
import { getElementScrollDimensions, type ElementScrollDimensions } from "@/helpers/getelementscrolldimensions";
import { createCell } from "@/extensions/shared/createcell";
import { calculateRenderArea } from "@/extensions/shared/renderarea";
import { renderCellSelection } from "@/extensions/shared/renderselection";
import { setCellContents } from "@/extensions/shared/setcellcontents";
import { CellType, HeaderSelection } from "@/shared/enums";
import { columnFromLeft } from "@/helpers/column";
import { rangeHorizontalIterator, rangeIterator, rangeVerticalIterator } from "@/helpers/range";

export function renderExtension<T extends DataItem>(meta: ExtendObject<T>): void {
    const renderAhead = {
        columns: 1,
        rows: 3,
    };

    meta.cellsElement.classList.add("thegrid-enable-zebra");

    const renderCells = (range: Range) => {
        const { cellsElement, cellSize, grid } = meta;
        const { columns, selection } = grid;
        cellsElement.textContent = "";

        for (const { x, y } of rangeIterator(range)) {
            const { dataType, visible } = columns.get(x)!;
            if (!visible) {
                continue;
            }
            const column = columns.get(x)!;

            const cell = createCell({
                type: CellType.Cell,
                width: column.width,
                height: cellSize,
                top: y * cellSize,
                left: columnFromLeft(columns, column),
                columnIndex: x,
                rowIndex: y,
            });

            renderCellSelection(cell, selection, columns, x, y);
            setCellContents(cell, dataType, meta.getCellData(x, y));

            cell.classList.add(y % 2 === 0 ? "row-even" : "row-odd");
            cellsElement.append(cell);
        }
    };

    const renderColumnHeaders = (range: Range, { scrollLeft }: ElementScrollDimensions) => {
        const { columnHeadersElement, cellSize, showHeaderSelection, grid } = meta;
        const { columns, selection } = grid;
        columnHeadersElement.textContent = "";

        for (const { x } of rangeHorizontalIterator(range)) {
            const column = columns.get(x)!;
            if (!column.visible) {
                continue;
            }

            const cell = createCell({
                type: CellType.ColumnHeader,
                width: column.width,
                height: cellSize,
                top: 0,
                left: columnFromLeft(columns, column) - scrollLeft,
                columnIndex: x,
                rowIndex: 0,
            });

            const showColumnSelected =
                showHeaderSelection === HeaderSelection.Columns || showHeaderSelection === HeaderSelection.Both;

            if (showColumnSelected && selection && x >= selection.left && x <= selection.right) {
                cell.classList.add("column-selected");
            }
            cell.textContent = column.header;
            columnHeadersElement.append(cell);
        }
    };

    const renderRowHeaders = (range: Range, { scrollTop }: ElementScrollDimensions) => {
        const { rowHeadersElement, cellSize, showHeaderSelection, grid } = meta;
        const { selection } = grid;
        rowHeadersElement.textContent = "";

        for (const { y } of rangeVerticalIterator(range)) {
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
        const dimensions = getElementScrollDimensions(meta.cellsElement);
        const renderArea = calculateRenderArea({ grid: meta.grid, renderAhead, dimensions });
        renderCells(renderArea);
        renderColumnHeaders(renderArea, dimensions);
        renderRowHeaders(renderArea, dimensions);
    };

    meta.cellsElement.addEventListener("scroll", render, { passive: true });
    meta.onInvalidate.subscribe(render);
}
