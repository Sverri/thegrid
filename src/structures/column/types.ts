import type { DataType } from "@/shared/enums";
import type { DataItem } from "@/types";

/**
 * Represents a concrete column instance in the grid.
 *
 * A column instance stores its runtime state, including position, visibility,
 * and links to neighboring columns for navigation and layout purposes.
 */
export interface Column<T extends DataItem> {
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

export type ImmutableColumn<T extends DataItem> = Immutable.RecordOf<Required<Column<T>>>;
