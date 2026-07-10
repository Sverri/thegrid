import { CellType } from "@/shared/enums";

export function createCell(type: CellType, column: number, row: number) {
    const element = document.createElement("div");
    element.classList.add("thegrid-cell");
    element.dataset.column = String(column);
    element.dataset.row = String(row);
    element.classList.toggle("thegrid-cell-column-header", type === CellType.ColumnHeader);
    element.classList.toggle("thegrid-cell-row-header", type === CellType.RowHeader);
    element.classList.toggle("thegrid-cell-top-left", type === CellType.TopLeft);
    return element;
}
