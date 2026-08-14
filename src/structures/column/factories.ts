import type { Column, ImmutableColumn } from "./types";
import type { DataItem } from "@/types";
import { DataType } from "@/shared/enums";
import { Record } from "immutable";

const factory = Record<Column<any>>({
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
    return factory({
        binding: data?.binding,
        header: data.header ?? String(data.binding),
        dataType: data.dataType ?? DataType.String,
        width: data.width ?? 100,
        minWidth: data.minWidth ?? 1,
        maxWidth: data.maxWidth ?? 999999,
        visible: data.visible ?? true,
    }) as ImmutableColumn<T>;
}
