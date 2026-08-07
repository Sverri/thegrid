import type { DataItem } from "@/types";
import { DataType } from "@/shared/enums";
import { Record } from "immutable";

/**
 * Configuration options for creating a column definition.
 *
 * These options describe how a grid column is bound to data, rendered, and sized.
 */
export interface ColumnOptions<T extends DataItem> {
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

export type ImmutableColumnOptions<T extends DataItem> = Immutable.RecordOf<ColumnOptions<T>>;

const columnOptionsFactory = Record<ColumnOptions<any>>({
    binding: "",
    header: "",
    dataType: DataType.String,
    width: 100,
    minWidth: 1,
    maxWidth: Number.MAX_SAFE_INTEGER,
    visible: true,
});

export function createColumnOptions<T extends DataItem>(options: ColumnOptions<T>): ImmutableColumnOptions<T> {
    return columnOptionsFactory(options) as ImmutableColumnOptions<T>;
}
