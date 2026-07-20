import type { Column } from "@/parts/column";
import { createRange, rangeContains, rangeIntersectsColumn, rangeIntersectsRow, type Range } from "@/parts/range";

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
export function renderCellSelection(
    cell: HTMLElement,
    selection: Range,
    columns: Immutable.List<Column<object>>,
    columnIndex: number,
    rowIndex: number,
) {
    const { left, right, top, bottom, x2, y2 } = selection!;

    if (rangeContains(selection, createRange(columnIndex, rowIndex))) {
        cell.classList.add("selection");
    }

    if (rangeIntersectsRow(selection, rowIndex)) {
        if (columnIndex === 0 && columnIndex === left) {
            cell.classList.add("selection-left-border");
        } else if (columnIndex === columns.get(left)?.previousVisibleColumn?.index) {
            cell.classList.add("selection-right-border");
        }
        if (columnIndex === right) {
            cell.classList.add("selection-right-border");
        }
    }

    if (rangeIntersectsColumn(selection, columnIndex)) {
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
