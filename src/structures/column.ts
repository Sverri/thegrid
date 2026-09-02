import type { DataItem } from "@shared/types";
import { DataType } from "@shared/enums";
import type { ColumnCollection } from "./columncollection";

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
    #collection: ColumnCollection<T>;

    constructor(options: ColumnOptions<T>, collection: ColumnCollection<T>) {
        this.#binding = options.binding;
        this.#header = options.header ?? String(this.#binding);
        this.#dataType = options.dataType ?? DataType.String;
        this.#minWidth = options.minWidth ?? 1;
        this.#maxWidth = options.maxWidth ?? 999999;
        this.#width = Math.max(this.#minWidth, Math.min(this.#maxWidth, options.width ?? 100));
        this.#visible = options.visible ?? true;
        this.#collection = collection;

        if (typeof this.#binding !== "string" || this.#binding.length === 0) {
            throw new Error("The binding must be a non-empty string");
        }
        if (this.#minWidth > this.#maxWidth) {
            throw new Error("The minWidth option cannot be greater than maxWidth");
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
        this.#width = value;
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
        this.#minWidth = value;
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
        this.#maxWidth = value;
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

    /**
     * Index of column in the column collection
     */
    get index() {
        return this.#collection.items.findIndex(item => item === this);
    }

    /**
     * Visual from left (in pixels)
     */
    get fromLeft() {
        let left = 0;
        for (const column of this.#collection.items) {
            if (column === this) {
                break;
            }
            if (column.visible) {
                left += column.width;
            }
        }
        return left;
    }
}

export type { Column };

/**
 * Create a column
 *
 * @param options
 * @returns `Column` instance
 */
export function createColumn<T extends DataItem>(options: ColumnOptions<T>, collection: ColumnCollection<T>) {
    return new Column<T>(options, collection);
}
