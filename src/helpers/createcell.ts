import { CellType } from "@/shared/enums";

export function createCell(type: CellType, row: number, column: number, style?: Partial<CSSStyleDeclaration>) {
    const div = document.createElement("div");
    div.classList.add("thegrid-cell");
    div.dataset.column = column.toString();
    div.dataset.row = row.toString();
    div.classList.toggle("thegrid-cell-column-header", type === CellType.ColumnHeader);
    div.classList.toggle("thegrid-cell-row-header", type === CellType.RowHeader);
    div.classList.toggle("thegrid-cell-top-left", type === CellType.TopLeft);
    if (style) {
        for (const [key, value] of Object.entries(style)) {
            div.style.setProperty(key, value as string);
        }
    }
    return div;
}
