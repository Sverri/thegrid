import type { TheGrid } from "@/grid";
import { DataType } from "@/shared/enums";
import { List } from "immutable";
import { createEvent, type UnraiseableEvent } from "@/shared/event";
import type { Column, ColumnOptions } from "./types/column";
import { createColumnObject, columnOptionsFactory } from "./factory/column";

/**
 * Represents the collection of columns managed by the grid.
 *
 * The collection exposes the current columns, visible-column metadata, and methods
 * for updating the column definitions immutably.
 */
export interface Columns<T extends Record<string, any>> {
    /**
     * Gets the immutable list of all columns in the collection.
     */
    readonly items: List<Column<T>>;

    /**
     * Gets the first valid index in the column collection.
     */
    readonly firstIndex: number;

    /**
     * Gets the last valid index in the column collection.
     */
    readonly lastIndex: number;

    /**
     * Gets the immutable list of visible columns in the collection.
     */
    readonly visibleItems: List<Column<T>>;

    /**
     * Gets the first visible column index.
     */
    readonly firstVisibleIndex: number;

    /**
     * Gets the last visible column index.
     */
    readonly lastVisibleIndex: number;

    /**
     * Total width of all visible columns
     */
    readonly totalWidth: number;

    /**
     * Gets the event emitted whenever the column collection changes.
     */
    readonly onChange: UnraiseableEvent<() => void>;

    /**
     * Updates the column collection by applying a callback to the current column options.
     *
     * The callback receives the current immutable list of column options and must return
     * a new immutable list of updated options.
     *
     * @param callback A function that receives the current column options and returns updated options.
     */
    update(callback: (columns: List<ColumnOptions<T>>) => List<ColumnOptions<T>>): void;
}

function transformColumnsToOptions<T extends Record<string, any>>(columns: List<Column<T>>) {
    return columns.map(
        column =>
            columnOptionsFactory({
                binding: String(column.binding),
                header: column.header,
                dataType: column.dataType,
                width: column.width,
                minWidth: column.minWidth,
                maxWidth: column.maxWidth,
                visible: column.visible,
            }) as Immutable.RecordOf<ColumnOptions<T>>,
    );
}

function transformOptionsToColumns<T extends Record<string, any>>(
    newColumns: List<Immutable.RecordOf<ColumnOptions<T>>>,
    grid: TheGrid<T>,
): List<Readonly<Column<T>>> {
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

    return columnsWithMeta.map(col => createColumnObject(col));
}

/**
 * Creates a column collection for the grid.
 *
 * The returned object manages the grid's columns, tracks visibility and layout state,
 * and emits change notifications whenever the column definitions are updated.
 *
 * @template T The record type represented by the grid data.
 * @param grid The grid instance that owns the columns.
 * @returns A frozen column collection implementation.
 */
export function createColumns<T extends Record<string, any>>(grid: TheGrid<T>): Columns<T> {
    const { raise, unraisable } = createEvent<() => void>();
    let items = List<Readonly<Column<T>>>();

    return Object.freeze({
        get items() {
            return items;
        },
        get firstIndex() {
            return items.size === 0 ? -1 : 0;
        },
        get lastIndex() {
            return items.size - 1;
        },
        get visibleItems() {
            return items.filter(column => column.visible);
        },
        get firstVisibleIndex() {
            return items.findIndex(column => column.visible);
        },
        get lastVisibleIndex() {
            return items.findLastIndex(column => column.visible);
        },
        get totalWidth() {
            let total = 0;
            for (const { width } of items.filter(item => item.visible)) {
                total += width;
            }
            return total;
        },
        get onChange() {
            return unraisable;
        },
        update(
            callback: (
                columns: List<Immutable.RecordOf<ColumnOptions<T>>>,
            ) => List<Immutable.RecordOf<ColumnOptions<T>>>,
        ) {
            const options = transformColumnsToOptions(items);
            const newColumns = callback(options);
            items = transformOptionsToColumns(newColumns, grid);
            raise();
        },
    });
}
