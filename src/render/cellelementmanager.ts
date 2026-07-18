import { CellType } from "@/shared/enums";

/**
 * Manages a pool of reusable grid cell elements.
 *
 * The manager reuses DOM nodes for grid cells instead of creating a new element
 * each time the viewport renders content, which reduces memory pressure during
 * scrolling and repeated updates.
 */
export interface CellElementManager {
    /**
     * Retrieves a reusable cell element for the provided grid coordinates and type.
     *
     * @param columnIndex The column index of the cell.
     * @param rowIndex The row index of the cell.
     * @param type The cell type that determines which CSS classes should be applied.
     * @returns A prepared cell element ready to be rendered.
     */
    retrieveCell(columnIndex: number, rowIndex: number, type: CellType): HTMLDivElement;

    /**
     * Returns a previously used cell element to the pool for reuse.
     *
     * @param cell The cell element to recycle.
     */
    turnInCells(...cell: HTMLDivElement[]): void;
}

/**
 * Creates a reusable pool of cell elements for the grid.
 *
 * The returned manager keeps a collection of detached DOM nodes that can be
 * reused when new cells are rendered, helping reduce the number of elements
 * created while the user scrolls.
 *
 * @returns Cell-element manager with retrieve and turn-in operations.
 */
export function createCellElementManager(): CellElementManager {
    const cells: HTMLDivElement[] = [];
    return Object.freeze({
        retrieveCell(columnIndex: number, rowIndex: number, type: CellType) {
            let cell = cells.pop();
            if (!cell) {
                cell = document.createElement("div");
            }
            cell.className = "thegrid-cell";
            cell.dataset.column = String(columnIndex);
            cell.dataset.row = String(rowIndex);
            cell.classList.toggle("thegrid-cell-column-header", type === CellType.ColumnHeader);
            cell.classList.toggle("thegrid-cell-row-header", type === CellType.RowHeader);
            cell.classList.toggle("thegrid-cell-top-left", type === CellType.TopLeft);
            cell.textContent = "";
            return cell;
        },
        turnInCells(...elements: HTMLDivElement[]) {
            for (const element of elements) {
                element.remove();
            }
            cells.push(...elements);
        },
    });
}
