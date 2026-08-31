import type { DataItem } from "@shared/types";
import { DataType } from "@shared/enums";
import { createEvent } from "@shared/event";

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
    #onChange = createEvent<() => void>();

    constructor({ binding, header, dataType, width, minWidth, maxWidth, visible }: ColumnOptions<T>) {
        this.#binding = binding;
        this.#header = header ?? String(this.#binding);
        this.#dataType = dataType ?? DataType.String;
        this.#minWidth = minWidth ?? 1;
        this.#maxWidth = maxWidth ?? 999999;
        this.#width = Math.max(this.#minWidth, Math.min(this.#maxWidth, width ?? 100));
        this.#visible = visible ?? true;

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
        this.#onChange.raise();
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
        this.#onChange.raise();
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
        this.#onChange.raise();
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
        this.#onChange.raise();
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
        this.#onChange.raise();
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
        this.#onChange.raise();
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
        this.#onChange.raise();
    }

    /**
     * The `onChange` event
     */
    get onChange() {
        return this.#onChange.unraisable;
    }
}

export type { Column };

/**
 * Create a column
 *
 * @param options
 * @returns `Column` instance
 */
export function createColumn<T extends DataItem>(options: ColumnOptions<T>) {
    return new Column<T>(options);
}
