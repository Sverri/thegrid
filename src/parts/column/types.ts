import type { DataType } from "@/shared/enums";
import type { List } from "immutable";

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
export interface ColumnCollection<T extends Record<string, any>> {
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
}
