import type { DataItem } from "@shared/types";
import { DataType } from "@shared/enums";
import { clampNumber } from "@helpers/numbers";

export interface ColumnOptions<T extends DataItem> {
    /**
     * The property name or key to bind this column to in the data objects.
     *
     * This is required and determines which field from the data is displayed in this column.
     */
    binding: keyof T;

    /**
     * The display header text for this column.
     *
     * Defaults to the binding property name if not provided.
     */
    header?: string;

    /**
     * The data type of the column, used for sorting and rendering.
     *
     * Defaults to ColumnType.String if not provided.
     */
    dataType?: DataType;

    /**
     * The width of the column in pixels.
     *
     * Defaults to 100 pixels if not provided.
     */
    width?: number;

    /**
     * The minimum width of the column in pixels.
     *
     * Constrains the column from being resized smaller than this value.
     */
    minWidth?: number;

    /**
     * The maximum width of the column in pixels.
     *
     * Constrains the column from being resized larger than this value.
     */
    maxWidth?: number;

    /**
     * Whether the column is visible in the grid.
     *
     * Defaults to true if not provided.
     */
    visible?: boolean;
}

class Column<T extends DataItem> {
    #binding: keyof T;
    #header: string;
    #dataType: DataType;
    #width: number;
    #minWidth: number;
    #maxWidth: number;
    #visible: boolean;

    constructor(options: ColumnOptions<T>) {
        this.#binding = options.binding;
        this.#header = options.header ?? String(this.#binding);
        this.#dataType = options.dataType ?? DataType.String;
        this.#minWidth = options.minWidth ?? 1;
        this.#maxWidth = options.maxWidth ?? 999999;
        this.#width = clampNumber(this.#minWidth, options.width ?? 100, this.#maxWidth);
        this.#visible = options.visible ?? true;

        if (typeof this.#binding !== "string" || this.#binding.length === 0) {
            throw new Error("The binding must be a non-empty string");
        }
        if (this.#minWidth > this.#maxWidth) {
            throw new Error("The minWidth and maxWidth options");
        }
    }

    /**
     * The property name or key to bind this column to in the data objects.
     *
     * This is required and determines which field from the data is displayed in this column.
     */
    get binding() {
        return this.#binding;
    }
    set binding(value: keyof T) {
        if (typeof value !== "string" || value.length === 0) {
            throw new Error("Invalid binding");
        }
        this.#binding = value;
    }

    /**
     * The display header text for this column.
     *
     * Defaults to the binding property name if not provided.
     */
    get header() {
        return this.#header;
    }
    set header(value: string) {
        this.#header = value;
    }

    /**
     * The data type of the column, used for sorting and rendering.
     *
     * Defaults to ColumnType.String if not provided.
     */
    get dataType() {
        return this.#dataType;
    }
    set dataType(value: DataType) {
        this.#dataType = value;
    }

    /**
     * The width of the column in pixels.
     *
     * Defaults to 100 pixels if not provided.
     */
    get width() {
        return this.#width;
    }
    set width(value: number) {
        this.#width = clampNumber(this.#minWidth, value, this.#maxWidth);
    }

    /**
     * The minimum width of the column in pixels.
     *
     * Constrains the column from being resized smaller than this value.
     */
    get minWidth() {
        return this.#minWidth;
    }
    set minWidth(value: number) {
        if (value > this.#maxWidth) {
            throw new Error("minWidth cannot be greater than maxWidth");
        }
        this.#minWidth = value;
        this.#width = clampNumber(this.#minWidth, this.#width, this.#maxWidth);
    }

    /**
     * The maximum width of the column in pixels.
     *
     * Constrains the column from being resized larger than this value.
     */
    get maxWidth() {
        return this.#maxWidth;
    }
    set maxWidth(value: number) {
        if (value < this.#minWidth) {
            throw new Error("maxWidth cannot be less than minWidth");
        }
        this.#maxWidth = value;
        this.#width = clampNumber(this.#minWidth, this.#width, this.#maxWidth);
    }

    /**
     * Whether the column is visible in the grid.
     *
     * Defaults to true if not provided.
     */
    get visible() {
        return this.#visible;
    }
    set visible(value: boolean) {
        this.#visible = value;
    }
}

export type { Column };

/**
 * Creates a column from its configuration.
 *
 * @param options The column configuration.
 * @returns A mutable column instance.
 */
export function createColumn<T extends DataItem>(options: ColumnOptions<T>) {
    return new Column<T>(options);
}

/**
 * Calculates the horizontal offset of a column from the left edge.
 *
 * Hidden columns take up no horizontal space. The index refers to the
 * column's position in the supplied collection, including hidden columns.
 *
 * @param columns The columns in collection order.
 * @param index The zero-based index of the target column.
 * @returns The sum of the widths of visible columns before the target.
 * @throws {Error} If index is outside the collection.
 */
export function columnFromLeft<T extends DataItem>(columns: readonly Column<T>[], index: number): number {
    if (index < 0 || index > columns.length - 1) {
        throw new Error("Invalid column index");
    }
    let left = 0;
    for (let i = 0; i < index; i++) {
        const column = columns[i];
        if (column.visible) {
            left += column.width;
        }
    }
    return left;
}
