import type { DataItem } from "@/types";
import type { ImmutableColumn } from "./types";
import type { List } from "immutable";

export function columnFromLeft<T extends DataItem>(
    columnList: List<ImmutableColumn<T>>,
    findColumn: ImmutableColumn<T>,
): number {
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
