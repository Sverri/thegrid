import type { Column } from "@/columns";
import { createRange, type Range } from "@/shared/range";

export function renderSelection(
    cell: HTMLElement,
    selection: Range,
    columns: Immutable.List<Column<object>>,
    columnIndex: number,
    rowIndex: number,
) {
    const { left, right, top, bottom, x2, y2 } = selection!;

    if (selection.contains(createRange(columnIndex, rowIndex))) {
        cell.classList.add("selection");
    }

    if (selection.intersectsRow(rowIndex)) {
        if (columnIndex === 0 && columnIndex === left) {
            cell.classList.add("selection-left-border");
        } else if (columnIndex === columns.get(left)?.previousVisibleColumn?.index) {
            cell.classList.add("selection-right-border");
        }
        if (columnIndex === right) {
            cell.classList.add("selection-right-border");
        }
    }

    if (selection.intersectsColumn(columnIndex)) {
        if (rowIndex === 0 && rowIndex === top) {
            cell.classList.add("selection-top-border");
        } else if (rowIndex === top - 1) {
            cell.classList.add("selection-bottom-border");
        }
        if (rowIndex === bottom) {
            cell.classList.add("selection-bottom-border");
        }
    }

    if (columnIndex === x2 && rowIndex === y2) {
        cell.classList.add("selection-current");
    }
}
