import { CellType } from "@/shared/enums";

export interface CellManager {
    retrieve(columnIndex: number, rowIndex: number, type: CellType): HTMLDivElement;
    turnIn(cell: HTMLDivElement): void;
}

export function createCellManager(): CellManager {
    const cells: HTMLDivElement[] = [];
    return Object.freeze({
        retrieve(columnIndex: number, rowIndex: number, type: CellType) {
            let cell = cells.pop() ?? document.createElement("div");
            cell.className = "";
            cell.classList.add("thegrid-cell");
            cell.dataset.column = String(columnIndex);
            cell.dataset.row = String(rowIndex);
            cell.classList.toggle("thegrid-cell-column-header", type === CellType.ColumnHeader);
            cell.classList.toggle("thegrid-cell-row-header", type === CellType.RowHeader);
            cell.classList.toggle("thegrid-cell-top-left", type === CellType.TopLeft);
            cell.textContent = "";
            return cell;
        },
        turnIn(cell: HTMLDivElement) {
            cell.remove();
            cells.unshift(cell);
        },
    });
}
