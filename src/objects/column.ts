import type { DataItem } from "@/types";
import type { ColumnOptions } from "./columnoptions";
import { DataType } from "@/shared/enums";
import { Record } from "immutable";

/**
 * Represents a concrete column instance in the grid.
 *
 * A column instance stores its runtime state, including position, visibility,
 * and links to neighboring columns for navigation and layout purposes.
 */
export interface Column<T extends DataItem> extends Required<ColumnOptions<T>> {}

export type ImmutableColumn<T extends DataItem> = Immutable.RecordOf<Column<T>>;

const columnFactory = Record<Column<any>>({
    binding: "",
    header: "",
    dataType: DataType.String,
    width: 100,
    minWidth: 1,
    maxWidth: Number.MAX_SAFE_INTEGER,
    visible: true,
});

export function createColumn<T extends DataItem>(data: Readonly<Column<T>>): ImmutableColumn<T> {
    if (typeof data?.binding !== "string" || data.binding.trim().length === 0) {
        throw new Error('Column must have a non-empty "binding" property');
    }
    return columnFactory(data) as ImmutableColumn<T>;
}
