import { List } from "immutable";
import { createColumnOptions, type ColumnOptions } from "@/parts/column";

export function getColumns<T extends Record<string, any>>(
    columns: ArrayLike<ColumnOptions<T>> | undefined,
): List<Immutable.RecordOf<ColumnOptions<T>>> {
    if (!Array.isArray(columns)) {
        throw new Error("No columns provided");
    }
    const options = Array.from(columns);
    return List(options.map(option => createColumnOptions(option)));
}
