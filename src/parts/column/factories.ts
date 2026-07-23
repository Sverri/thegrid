import type { Column, ColumnOptions, ColumnCollection } from "./types";
import { transformOptionsToColumns } from "./helpers";
import { Record as ImmutableRecord, List as ImmutableList, List } from "immutable";
import { DataType } from "@/shared/enums";

const columnsRecord = ImmutableRecord<ColumnCollection<any>>({
    items: ImmutableList(),
    firstIndex: -1,
    lastIndex: -1,
    visibleItems: ImmutableList(),
    firstVisibleIndex: -1,
    lastVisibleIndex: -1,
    totalWidth: -1,
});

export function createColumns<T extends Record<string, any>>(options: List<Immutable.RecordOf<ColumnOptions<T>>>) {
    const items = transformOptionsToColumns(options);
    return columnsRecord({
        items,
        firstIndex: items.size === 0 ? -1 : 0,
        lastIndex: items.size - 1,
        visibleItems: items.filter(column => column.visible),
        firstVisibleIndex: items.findIndex(column => column.visible),
        lastVisibleIndex: items.findLastIndex(column => column.visible),
        totalWidth: items
            .filter(item => item.visible)
            .map(item => item.width)
            .reduce((total, value) => total + value),
    }) as Immutable.RecordOf<ColumnCollection<T>>;
}

const columnOptionsRecord = ImmutableRecord<ColumnOptions<any>>({
    binding: "",
    header: "",
    dataType: DataType.String,
    width: 100,
    minWidth: 1,
    maxWidth: 999999,
    visible: true,
});

export function createColumnOptions<T extends Record<string, any>>(options: ColumnOptions<T>) {
    return columnOptionsRecord(options) as Immutable.RecordOf<ColumnOptions<T>>;
}

const columnRecord = ImmutableRecord<Column<any>>({
    binding: "",
    header: "",
    dataType: DataType.String,
    width: 100,
    minWidth: 1,
    maxWidth: 999999,
    visible: true,
    index: -1,
    visibleIndex: -1,
    fromLeft: -1,
    nextColumn: undefined,
    nextVisibleColumn: undefined,
    previousColumn: undefined,
    previousVisibleColumn: undefined,
});

export function createColumn<T extends Record<string, any>>(data: Column<T>) {
    return columnRecord(data) as Immutable.RecordOf<Column<T>>;
}
