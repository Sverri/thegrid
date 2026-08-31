import type { DataItem } from "@shared/types";
import type { Column } from "@structure/column";

export function columnFromLeft<T extends DataItem>(columnList: Column<T>[], findColumn: Column<T>): number {
    let left = 0;
    for (const { binding, visible, width } of columnList) {
        if (binding === findColumn.binding) {
            break;
        }
        if (visible) {
            left += width;
        }
    }
    return left;
}
