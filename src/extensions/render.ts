import type { TheGrid } from "@/grid";
import { type Range } from "@/shared/range";
import { getElementScrollDimensions, type ElementScrollDimensions } from "@/helpers/getelementscrolldimensions";
import { createCellElementManager } from "@/render/cellelementmanager";
import { calculateRenderArea } from "@/render/renderarea";
import { renderCellSelection } from "@/render/renderselection";
import { setCellContents } from "@/render/setcellcontents";
import { CellType } from "@/shared/enums";

export function renderExtension(grid: TheGrid<any>) {
    const renderAhead = {
        columns: 1,
        rows: 3,
    };

    const { retrieveCell, turnInCells } = createCellElementManager();
    grid.cellsElement.classList.add("thegrid-enable-zebra");

    const renderCells = (range: Range) => {
        const { cellsElement, columns, cellSize } = grid;
        const cells = Array.from(cellsElement.children) as HTMLDivElement[];

        turnInCells(...cells);

        const fragment = new DocumentFragment();

        for (const { x, y } of range.iterator()) {
            const { dataType, visible } = columns.items.get(x)!;
            if (!visible) {
                continue;
            }
            const { fromLeft, width } = columns.items.get(x)!;
            const cell = retrieveCell(x, y, CellType.Cell);

            cell.style.transform = `translate(${fromLeft}px, ${y * cellSize}px)`;
            cell.style.width = `${width}px`;
            cell.style.height = `${cellSize}px`;

            renderCellSelection(cell, grid.selection.range, grid.columns.items, x, y);
            setCellContents(cell, dataType, grid.getCellData(x, y));

            cell.classList.add(y % 2 === 0 ? "row-even" : "row-odd");
            fragment.append(cell);
        }

        cellsElement.append(fragment);
    };

    const renderColumnHeaders = (range: Range, { scrollLeft }: ElementScrollDimensions) => {
        const { columnHeadersElement, columns, cellSize, selection } = grid;
        const cells = Array.from(columnHeadersElement.children) as HTMLDivElement[];

        turnInCells(...cells);

        const fragment = new DocumentFragment();

        for (const { x } of range.horizontalIterator()) {
            const { header, visible, fromLeft, width, index } = columns.items.get(x)!;
            if (!visible) {
                continue;
            }
            const cell = retrieveCell(x, 0, CellType.ColumnHeader);
            cell.style.transform = `translateX(${fromLeft - scrollLeft}px)`;
            cell.style.width = `${width}px`;
            cell.style.height = `${cellSize}px`;
            if (selection && index >= selection.range.left && index <= selection.range.right) {
                cell.classList.add("column-selected");
            }
            cell.textContent = header;
            fragment.append(cell);
        }

        columnHeadersElement.append(fragment);
    };

    const renderRowHeaders = (range: Range, { scrollTop }: ElementScrollDimensions) => {
        const { rowHeadersElement, cellSize, selection } = grid;
        const cells = Array.from(rowHeadersElement.children) as HTMLDivElement[];

        turnInCells(...cells);

        const fragment = new DocumentFragment();

        for (const { y } of range.verticalIterator()) {
            const cell = retrieveCell(0, y, CellType.RowHeader);
            cell.style.transform = `translateY(${y * cellSize - scrollTop}px)`;
            cell.style.width = `${cellSize}px`;
            cell.style.height = `${cellSize}px`;
            if (selection && y >= selection.range.top && y <= selection.range.bottom) {
                cell.classList.add("row-selected");
            }
            fragment.append(cell);
        }

        rowHeadersElement.append(fragment);
    };

    const render = () => {
        const dimensions = getElementScrollDimensions(grid.cellsElement);
        const renderArea = calculateRenderArea({
            columns: grid.columns.items,
            source: grid.source.items,
            cellSize: grid.cellSize,
            renderAhead,
            dimensions,
        });
        renderCells(renderArea);
        renderColumnHeaders(renderArea, dimensions);
        renderRowHeaders(renderArea, dimensions);
    };

    render();

    grid.cellsElement.addEventListener("scroll", render);
    grid.onInvalidate.subscribe(render);
}
