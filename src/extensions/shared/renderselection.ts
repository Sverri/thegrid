import type { DataItem } from "@shared/types";
import type { Column } from "@structure/column";
import { createRange, type Range } from "@structure/range";

/**
 * Applies the current selection styling to a single cell element.
 *
 * The renderer inspects the selection range and adds CSS classes that reflect
 * whether the cell is selected, lies on a selection border, or is the active
 * current cell.
 *
 * @param cell The DOM cell element to style.
 * @param selection The current selection range.
 * @param columns The ordered column definitions used to resolve visible borders.
 * @param columnIndex The column index of the cell being rendered.
 * @param rowIndex The row index of the cell being rendered.
 */
export function renderCellSelection<T extends DataItem>(
    cell: HTMLElement,
    selection: Range,
    columns: Column<T>[],
    columnIndex: number,
    rowIndex: number,
): void {
    const { left, right, top, bottom, x2, y2 } = selection!;

    if (selection.contains(createRange(columnIndex, rowIndex))) {
        cell.classList.add("selection");
    }

    if (selection.intersectsRow(rowIndex)) {
        const previousVisibleColumnIndex = columns.findLastIndex(
            column => columns.indexOf(column) < left && column.visible,
        );
        if (columnIndex === previousVisibleColumnIndex) {
            cell.classList.add("selection-right-border");
        }
        if (columnIndex === right) {
            cell.classList.add("selection-right-border");
        }
    }

    if (selection.intersectsColumn(columnIndex)) {
        if (rowIndex === top - 1) {
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
