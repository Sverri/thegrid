import { Record } from "immutable";
import { DataType } from "@/shared/enums";
import type { Column, ColumnOptions } from "@/types/column";

export const columnOptionsFactory = Record<ColumnOptions<any>>({
    binding: "",
    header: "",
    dataType: DataType.String,
    width: 100,
    minWidth: 1,
    maxWidth: 999999,
    visible: true,
});

export const createColumnObject = Record<Column<any>>({
    binding: "",
    header: "",
    dataType: DataType.String,
    width: 100,
    minWidth: 1,
    maxWidth: 999999,
    visible: true,
    grid: undefined!,
    index: -1,
    visibleIndex: -1,
    fromLeft: -1,
    nextColumn: undefined,
    nextVisibleColumn: undefined,
    previousColumn: undefined,
    previousVisibleColumn: undefined,
});
