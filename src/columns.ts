import type { TheGrid } from "@/grid";
import { DataType } from "@/shared/enums";
import { List } from "immutable";
import { createEvent, type UnraiseableEvent } from "@/shared/event";

/**
 * Configuration options for creating a column definition.
 *
 * These options describe how a grid column is bound to data, rendered, and sized.
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
 * Represents a concrete column instance in the grid.
 *
 * A column instance stores its runtime state, including position, visibility,
 * and links to neighboring columns for navigation and layout purposes.
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

    /**
     * The next column in the overall column order, if one exists.
     */
    nextColumn: Column<T> | undefined;

    /**
     * The next visible column in the overall column order, if one exists.
     */
    nextVisibleColumn: Column<T> | undefined;

    /**
     * The previous column in the overall column order, if one exists.
     */
    previousColumn: Column<T> | undefined;

    /**
     * The previous visible column in the overall column order, if one exists.
     */
    previousVisibleColumn: Column<T> | undefined;
}

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
    const columns = incompleteColumns.map((column, index) => {
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

        return Object.freeze(column);
    });

    return columns;
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
    let items = List<Column<T>>();

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
