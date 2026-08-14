import type { DataItem } from "@/types";
import type { Column } from "@/structures/column";
import type { List } from "immutable";

export function columnFromLeft<T extends DataItem>(columnList: List<Column<T>>, findColumn: Column<T>): number {
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
