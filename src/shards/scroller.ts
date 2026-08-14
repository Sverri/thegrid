import type { GridData } from "@/structures/grid";
import type { DataItem } from "@/types";
import { getElementScrollDimensions } from "@/helpers/getelementscrolldimensions";
import { columnFromLeft } from "@/helpers/column";
import { debounce } from "throttle-debounce";

interface Data<T extends DataItem> {
    grid: Immutable.RecordOf<GridData<T>>;
    cellsElement: HTMLElement;
}

export function useScroller<T extends DataItem>(data: Data<T>) {
    return Object.freeze({
        scrollIntoView: debounce(64, (columnIndex: number, rowIndex: number) => {
            const { scrollLeft, scrollRight, scrollTop, scrollBottom } = getElementScrollDimensions(data.cellsElement);
            const column = data.grid.columns.get(columnIndex)!;

            let left = scrollLeft;
            const columnStart = columnFromLeft(data.grid.columns, column);
            const columnEnd = columnStart + column.width;
            if (columnStart < scrollLeft) {
                left = columnStart;
            } else if (columnEnd > scrollRight) {
                left = scrollLeft + (columnEnd - scrollRight);
            }

            let top = scrollTop;
            const rowStart = rowIndex * data.grid.cellSize;
            const rowEnd = rowStart + data.grid.cellSize;
            if (rowStart < scrollTop) {
                top = rowStart;
            } else if (rowEnd > scrollBottom) {
                top = scrollTop + (rowEnd - scrollBottom);
            }

            data.cellsElement.scrollTo({ left, top, behavior: "instant" });
        }),
    });
}
