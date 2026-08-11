import type { DataItem } from "@/types";
import type { ImmutableColumnOptions } from "./columnoptions";
import type { List } from "immutable";
import { createColumn, type ImmutableColumn } from "./column";
import { DataType } from "@/shared/enums";

export function createColumnCollection<T extends DataItem>(
    options: List<ImmutableColumnOptions<T>>,
): List<ImmutableColumn<T>> {
    return options.map(columnOptions => {
        const data = createColumn<T>({
            binding: columnOptions.binding,
            header: columnOptions.header ?? String(columnOptions.binding),
            dataType: columnOptions.dataType ?? DataType.String,
            width: columnOptions.width ?? 100,
            minWidth: columnOptions.minWidth ?? 1,
            maxWidth: columnOptions.maxWidth ?? 999999,
            visible: columnOptions.visible ?? true,
        });
        return data;
    });
}
