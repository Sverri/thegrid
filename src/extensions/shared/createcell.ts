import { CellType } from "@shared/enums";

interface CellSpecs {
    type: CellType;
    width: number;
    height: number;
    columnIndex: number;
    rowIndex: number;
    top: number;
    left: number;
}

export function createCell({ type, width, height, columnIndex, rowIndex, left, top }: CellSpecs) {
    const cell = document.createElement("div");
    cell.className = "thegrid-cell";
    cell.dataset["column"] = String(columnIndex);
    cell.dataset["row"] = String(rowIndex);
    cell.style.transform = `translate(${left}px, ${top}px)`;
    cell.style.width = `${width}px`;
    cell.style.height = `${height}px`;
    cell.classList.add("thegrid-cell");
    cell.classList.toggle("thegrid-cell-column-header", type === CellType.ColumnHeader);
    cell.classList.toggle("thegrid-cell-row-header", type === CellType.RowHeader);
    cell.classList.toggle("thegrid-cell-top-left", type === CellType.TopLeft);
    return cell;
}
