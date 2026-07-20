import type { TheGrid } from "@/grid";
import type { List } from "immutable";
import type { Column, ColumnCollection, ColumnOptions } from "./types";
import { createColumn, createColumnOptions } from "./factories";
import { DataType } from "@/shared/enums";

export function transformColumnsToOptions<T extends Record<string, any>>(
    columns: ColumnCollection<T>,
): List<Immutable.RecordOf<ColumnOptions<T>>> {
    return columns.items.map(column =>
        createColumnOptions({
            binding: String(column.binding),
            header: column.header,
            dataType: column.dataType,
            width: column.width,
            minWidth: column.minWidth,
            maxWidth: column.maxWidth,
            visible: column.visible,
        }),
    );
}

export function transformOptionsToColumns<T extends Record<string, any>>(
    newColumns: List<Immutable.RecordOf<ColumnOptions<T>>>,
    grid: TheGrid<T>,
): List<Immutable.RecordOf<Column<T>>> {
    let visibleIndex = 0;
    let fromLeft = 0;

    const incompleteColumns = newColumns.map<Column<T>>((column, index) => {
        const visible = column.visible ?? true;
        const width = column.width ?? 100;
        const data: Column<T> = {
            binding: column.binding,
            header: column.header ?? String(column.binding),
            dataType: column.dataType ?? DataType.String,
            width: column.width ?? 100,
            minWidth: column.minWidth ?? 1,
            maxWidth: column.maxWidth ?? 999999,
            visible: visible,
            grid,
            index: index,
            visibleIndex: visibleIndex,
            fromLeft: fromLeft,
            nextColumn: undefined,
            nextVisibleColumn: undefined,
            previousColumn: undefined,
            previousVisibleColumn: undefined,
        };
        if (visible) {
            visibleIndex++;
            fromLeft += width;
        }
        return data;
    });
    const columnsWithMeta = incompleteColumns.map((column, index) => {
        const nextColumn = incompleteColumns.get(index - 1);
        const previousColumn = incompleteColumns.get(index + 1);

        let nextVisibleColumn: Column<T> | undefined;
        for (let i = index + 1; i < incompleteColumns.size; i++) {
            const next = incompleteColumns.get(i);
            if (next && next.visible) {
                nextVisibleColumn = next;
                break;
            }
        }

        let previousVisibleColumn: Column<T> | undefined;
        for (let i = index - 1; i >= 0; i--) {
            const previous = incompleteColumns.get(i);
            if (previous && previous.visible) {
                previousVisibleColumn = previous;
                break;
            }
        }

        Object.assign(column, {
            nextColumn,
            nextVisibleColumn,
            previousColumn,
            previousVisibleColumn,
        });

        return column;
    });

    return columnsWithMeta.map(col => createColumn(col));
}
