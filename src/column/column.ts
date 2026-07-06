import type { TheGrid } from "@/thegrid";
import { ColumnType } from "@/shared/enums";

/**
 * Configuration options for creating a Column instance.
 *
 * @interface ColumnOptions
 */
export interface ColumnOptions {
    /**
     * The property name or key to bind this column to in the data objects.
     * This is required and determines which field from the data is displayed in this column.
     */
    binding: string;

    /**
     * The display header text for this column.
     * Defaults to the binding property name if not provided.
     */
    header?: string;

    /**
     * The data type of the column, used for sorting and rendering.
     * Defaults to ColumnType.String if not provided.
     */
    dataType?: ColumnType;

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

export interface Column extends Required<ColumnOptions> {
    /**
     * Grid the column belongs to
     */
    grid: TheGrid<any>;

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
