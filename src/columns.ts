import type { TheGrid } from "@/grid";
import { DataType } from "@/shared/enums";
import { List } from "immutable";
import { createEvent, type UnraiseableEvent } from "@/shared/event";

/**
 * Configuration options for creating a Column instance.
 */
export interface ColumnOptions<T extends Record<string, any>> {
    /**
     * The property name or key to bind this column to in the data objects.
     * This is required and determines which field from the data is displayed in this column.
     */
    binding: keyof T;

    /**
     * The display header text for this column.
     * Defaults to the binding property name if not provided.
     */
    header?: string;

    /**
     * The data type of the column, used for sorting and rendering.
     * Defaults to ColumnType.String if not provided.
     */
    dataType?: DataType;

    /**
     * The width of the column in pixels.
     * Defaults to 100 pixels if not provided.
     */
    width?: number;

    /**
     * The minimum width of the column in pixels.
     * Constrains the column from being resized smaller than this value.
     */
    minWidth?: number;

    /**
     * The maximum width of the column in pixels.
     * Constrains the column from being resized larger than this value.
     */
    maxWidth?: number;

    /**
     * Whether the column is visible in the grid.
     * Defaults to true if not provided.
     */
    visible?: boolean;
}

/**
 * Column
 */
export interface Column<T extends Record<string, any>> extends Required<ColumnOptions<T>> {
    /**
     * Grid the column belongs to
     */
    grid: TheGrid<T>;

    /**
     * The index of the column
     */
    index: number;

    /**
     * The visible index of the column
     */
    visibleIndex: number;

    /**
     * Where column is positioned from the left (px)
     */
    fromLeft: number;
}

export interface Columns<T extends Record<string, any>> {
    /**
     * Gets the list of columns in the collection.
     */
    readonly items: List<Column<T>>;

    /**
     * Gets the change event for this column collection.
     *
     * Subscribe to this event to be notified when the collection changes or when any column in the
     * collection changes.
     */
    readonly onChange: UnraiseableEvent<() => void>;

    /**
     * Update multiple columns
     *
     * The callback is given an immutable list containing all the columns in the grid and must
     * returns a new immutable list.
     */
    update(callback: (columns: List<ColumnOptions<T>>) => List<ColumnOptions<T>>): void;
}

function transformColumnsToOptions<T extends Record<string, any>>(columns: List<Column<T>>) {
    return columns.map<ColumnOptions<T>>(column => ({
        binding: column.binding,
        header: column.header,
        dataType: column.dataType,
        width: column.width,
        minWidth: column.minWidth,
        maxWidth: column.maxWidth,
        visible: column.visible,
    }));
}

function transformOptionsToColumns<T extends Record<string, any>>(
    newColumns: List<ColumnOptions<T>>,
    grid: TheGrid<T>,
) {
    let visibleIndex = 0;
    let fromLeft = 0;

    return newColumns.map<Column<T>>((column, index) => {
        const visible = column.visible ?? true;
        const width = column.width ?? 100;
        const data = {
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
        };
        if (visible) {
            visibleIndex++;
            fromLeft += width;
        }
        return data;
    });
}

/**
 * Create columns for grid
 */
export function createColumns<T extends Record<string, any>>(grid: TheGrid<T>): Columns<T> {
    const { raise, unraisable } = createEvent<() => void>();
    let items = List<Column<T>>();

    return Object.freeze({
        get items() {
            return items;
        },
        get onChange() {
            return unraisable;
        },
        update(callback: (columns: List<ColumnOptions<T>>) => List<ColumnOptions<T>>) {
            const options = transformColumnsToOptions(items);
            const newColumns = callback(options);
            items = transformOptionsToColumns(newColumns, grid);
            raise();
        },
    });
}
