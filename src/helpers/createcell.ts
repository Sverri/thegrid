import { CellType } from "@/shared/enums";

export function createCell(type: CellType, row: number, column: number) {
    const div = document.createElement("div");
    div.classList.add("thegrid-cell");
    div.dataset.column = String(column);
    div.dataset.row = String(row);
    div.classList.toggle("thegrid-cell-column-header", type === CellType.ColumnHeader);
    div.classList.toggle("thegrid-cell-row-header", type === CellType.RowHeader);
    div.classList.toggle("thegrid-cell-top-left", type === CellType.TopLeft);
    return div;
}
