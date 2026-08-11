import type { DataItem } from "@/types";
import type { TheGrid } from "@/objects/grid";
import { rangeHorizontalIterator, rangeIterator, rangeVerticalIterator, type Range } from "@/objects/range";
import { getElementScrollDimensions, type ElementScrollDimensions } from "@/helpers/getelementscrolldimensions";
import { createCellElementManager } from "@/render/cellelementmanager";
import { calculateRenderArea } from "@/render/renderarea";
import { renderCellSelection } from "@/render/renderselection";
import { setCellContents } from "@/render/setcellcontents";
import { CellType, HeaderSelection } from "@/shared/enums";
import { columnFromLeft } from "@/helpers/column/columnfromleft";

export function renderExtension<T extends DataItem>(grid: TheGrid<T>): void {
    const renderAhead = {
        columns: 1,
        rows: 3,
    };

    const { retrieveCell, turnInCells } = createCellElementManager();
    grid.cellsElement.classList.add("thegrid-enable-zebra");

    const renderCells = (range: Range) => {
        const { cellsElement, columns, cellSize, selection } = grid;
        const cells = Array.from(cellsElement.children) as HTMLDivElement[];

        turnInCells(...cells);

        const fragment = new DocumentFragment();

        for (const { x, y } of rangeIterator(range)) {
            const { dataType, visible } = columns.get(x)!;
            if (!visible) {
                continue;
            }
            const column = columns.get(x)!;
            const cell = retrieveCell(x, y, CellType.Cell);

            cell.style.transform = `translate(${columnFromLeft(columns, column)}px, ${y * cellSize}px)`;
            cell.style.width = `${column.width}px`;
            cell.style.height = `${cellSize}px`;

            renderCellSelection(cell, selection, columns, x, y);
            setCellContents(cell, dataType, grid.getCellData(x, y));

            cell.classList.add(y % 2 === 0 ? "row-even" : "row-odd");
            fragment.append(cell);
        }

        cellsElement.append(fragment);
    };

    const renderColumnHeaders = (range: Range, { scrollLeft }: ElementScrollDimensions) => {
        const { columnHeadersElement, columns, cellSize, selection, showHeaderSelection } = grid;
        const cells = Array.from(columnHeadersElement.children) as HTMLDivElement[];

        turnInCells(...cells);

        const fragment = new DocumentFragment();

        for (const { x } of rangeHorizontalIterator(range)) {
            const column = columns.get(x)!;
            if (!column.visible) {
                continue;
            }
            const cell = retrieveCell(x, 0, CellType.ColumnHeader);
            cell.style.transform = `translateX(${columnFromLeft(columns, column) - scrollLeft}px)`;
            cell.style.width = `${column.width}px`;
            cell.style.height = `${cellSize}px`;

            const showColumnSelected =
                showHeaderSelection === HeaderSelection.Columns || showHeaderSelection === HeaderSelection.Both;

            if (showColumnSelected && selection && x >= selection.left && x <= selection.right) {
                cell.classList.add("column-selected");
            }
            cell.textContent = column.header;
            fragment.append(cell);
        }

        columnHeadersElement.append(fragment);
    };

    const renderRowHeaders = (range: Range, { scrollTop }: ElementScrollDimensions) => {
        const { rowHeadersElement, cellSize, selection, showHeaderSelection } = grid;
        const cells = Array.from(rowHeadersElement.children) as HTMLDivElement[];

        turnInCells(...cells);

        const fragment = new DocumentFragment();

        for (const { y } of rangeVerticalIterator(range)) {
            const cell = retrieveCell(0, y, CellType.RowHeader);
            cell.style.transform = `translateY(${y * cellSize - scrollTop}px)`;
            cell.style.width = `${cellSize}px`;
            cell.style.height = `${cellSize}px`;

            const showColumnSelected =
                showHeaderSelection === HeaderSelection.Rows || showHeaderSelection === HeaderSelection.Both;

            if (showColumnSelected && selection && y >= selection.top && y <= selection.bottom) {
                cell.classList.add("row-selected");
            }
            fragment.append(cell);
        }

        rowHeadersElement.append(fragment);
    };

    const render = () => {
        const dimensions = getElementScrollDimensions(grid.cellsElement);
        const renderArea = calculateRenderArea({ grid, renderAhead, dimensions });
        renderCells(renderArea);
        renderColumnHeaders(renderArea, dimensions);
        renderRowHeaders(renderArea, dimensions);
    };

    grid.cellsElement.addEventListener("scroll", render);
    grid.onInvalidate.subscribe(render);
}
