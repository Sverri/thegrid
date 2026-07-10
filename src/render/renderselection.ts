import { type Range } from "@/shared/range";

export function renderSelection(cell: HTMLElement, selection: Range, columnIndex: number, rowIndex: number) {
    const { left, right, top, bottom } = selection!;

    if (columnIndex >= left && columnIndex <= right && rowIndex >= top && rowIndex <= bottom) {
        cell.classList.add("selection");
    }

    if (rowIndex >= top && rowIndex <= bottom) {
        if (columnIndex === 0 && columnIndex === left) {
            cell.classList.add("selection-left-border");
        } else if (columnIndex === left - 1) {
            cell.classList.add("selection-right-border");
        }
        if (columnIndex === right) {
            cell.classList.add("selection-right-border");
        }
    }

    if (columnIndex >= left && columnIndex <= right) {
        if (rowIndex === 0 && rowIndex === top) {
            cell.classList.add("selection-top-border");
        } else if (rowIndex === top - 1) {
            cell.classList.add("selection-bottom-border");
        }
        if (rowIndex === bottom) {
            cell.classList.add("selection-bottom-border");
        }
    }
}
