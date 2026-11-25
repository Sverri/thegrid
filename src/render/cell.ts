import { CellType } from "@shared/enums";

/**
 * Describes a cell for {@link createCell}.
 */
interface CellSpecs {
    /**
     * The kind of cell, which sets its CSS class.
     */
    type: CellType;

    /**
     * The width in pixels.
     */
    width: number;

    /**
     * The height in pixels.
     */
    height: number;

    /**
     * The column index, stored in `data-column`.
     */
    columnIndex: number;

    /**
     * The row index, stored in `data-row`.
     */
    rowIndex: number;

    /**
     * The vertical offset in pixels within the parent region.
     */
    top: number;

    /**
     * The horizontal offset in pixels within the parent region.
     */
    left: number;
}

/**
 * Creates a DOM element representing a grid cell.
 *
 * The returned element is positioned by translating it into the grid's coordinate space,
 * sized according to the supplied dimensions, and tagged with dataset metadata and CSS
 * classes that describe the cell type.
 *
 * @param specs The cell configuration.
 * @param specs.type The kind of cell being rendered.
 * @param specs.width The cell width in pixels.
 * @param specs.height The cell height in pixels.
 * @param specs.columnIndex The logical column index for the cell.
 * @param specs.rowIndex The logical row index for the cell.
 * @param specs.top The vertical offset in pixels.
 * @param specs.left The horizontal offset in pixels.
 * @returns A configured HTML div element ready to be appended to the grid.
 */
export function createCell({ type, width, height, columnIndex, rowIndex, left, top }: CellSpecs) {
    const cell = document.createElement("div");
    cell.className = "thegrid-cell";
    cell.dataset["column"] = String(columnIndex);
    cell.dataset["row"] = String(rowIndex);
    cell.style.transform = `translate(${left}px, ${top}px)`;
    cell.style.width = `${width}px`;
    cell.style.height = `${height}px`;
    cell.classList.toggle("thegrid-cell-column-header", type === CellType.ColumnHeader);
    cell.classList.toggle("thegrid-cell-row-header", type === CellType.RowHeader);
    cell.classList.toggle("thegrid-cell-top-left", type === CellType.TopLeft);
    return cell;
}
