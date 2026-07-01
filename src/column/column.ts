import { Event } from "@/shared/event/event";
import { gridReferences } from "@/shared/meta";
import { ColumnType } from "@/shared/enums";
import type { TheGrid } from "@/thegrid";
import type { UnraiseableEvent } from "@/shared/event/unraisableevent";

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

/**
 * Represents a column in a data grid.
 *
 * A Column manages configuration and state for a single column including binding, display properties,
 * sizing constraints, and visibility. Columns can be organized within a grid and provide change
 * notifications when their properties are modified.
 *
 * @class Column
 */
export class Column {
    #binding: string;
    #header: string;
    #dataType: ColumnType;
    #width: number;
    #minWidth: number | undefined;
    #maxWidth: number | undefined;
    #visible: boolean;
    #onChange = new Event<() => void>();

    /**
     * Creates a new Column instance.
     *
     * @param options - Configuration options for the column
     */
    constructor(options: ColumnOptions) {
        this.#binding = options.binding;
        this.#header = options.header ?? options.binding;
        this.#dataType = options.dataType ?? ColumnType.String;
        this.#width = options.width ?? 100;
        this.#minWidth = options.minWidth ?? undefined;
        this.#maxWidth = options.maxWidth ?? undefined;
        this.#visible = options.visible ?? true;
    }

    /**
     * Gets the binding property name for this column.
     *
     * @returns The property name to bind to in data objects
     */
    get binding(): string {
        return this.#binding;
    }

    /**
     * Sets the binding property name for this column.
     * Raises the onChange event when modified.
     *
     * @param ewValue - The new binding property name
     */
    set binding(newValue: string) {
        this.#binding = newValue;
        this.#onChange.raise();
    }

    /**
     * Gets the display header text for this column.
     *
     * @returns The header text displayed at the top of the column
     */
    get header(): string {
        return this.#header;
    }

    /**
     * Sets the display header text for this column.
     * Raises the onChange event when modified.
     *
     * @param newValue - The new header text
     */
    set header(newValue: string) {
        this.#header = newValue;
        this.#onChange.raise();
    }

    /**
     * Gets the data type of this column.
     *
     * @returns The ColumnType value for this column
     */
    get dataType(): string {
        return this.#dataType;
    }

    /**
     * Sets the data type of this column.
     * Raises the onChange event when modified.
     *
     * @param newValue - The new data type
     */
    set dataType(newValue: ColumnType) {
        this.#dataType = newValue;
        this.#onChange.raise();
    }

    /**
     * Gets the width of this column in pixels.
     *
     * @returns The column width
     */
    get width(): number {
        return this.#width;
    }

    /**
     * Sets the width of this column in pixels.
     * Raises the onChange event when modified.
     *
     * @param newValue - The new width in pixels
     */
    set width(newValue: number) {
        this.#width = newValue;
        this.#onChange.raise();
    }

    /**
     * Gets the minimum width constraint for this column in pixels.
     *
     * @returns The minimum width, or undefined if not set
     */
    get minWidth(): number | undefined {
        return this.#minWidth;
    }

    /**
     * Sets the minimum width constraint for this column in pixels.
     * Raises the onChange event when modified.
     *
     * @param newValue - The new minimum width in pixels
     */
    set minWidth(newValue: number) {
        this.#minWidth = newValue;
        this.#onChange.raise();
    }

    /**
     * Gets the maximum width constraint for this column in pixels.
     *
     * @returns The maximum width, or undefined if not set
     */
    get maxWidth(): number | undefined {
        return this.#maxWidth;
    }

    /**
     * Sets the maximum width constraint for this column in pixels.
     * Raises the onChange event when modified.
     *
     * @param newValue - The new maximum width in pixels
     */
    set maxWidth(newValue: number) {
        this.#maxWidth = newValue;
        this.#onChange.raise();
    }

    /**
     * Gets whether this column is visible.
     *
     * @returns True if the column is visible, false otherwise
     */
    get visible(): boolean {
        return this.#visible;
    }

    /**
     * Sets the visibility state of this column.
     * Raises the onChange event when modified.
     *
     * @param newValue - True to show the column, false to hide it
     */
    set visble(newValue: boolean) {
        this.#visible = newValue;
        this.#onChange.raise();
    }

    /**
     * Gets the grid that contains this column, if any.
     * Searches through registered grid references to find the grid instance that owns this column.
     *
     * @returns The grid instance, or undefined if not found or not in a grid
     */
    get grid(): TheGrid<object> | undefined {
        for (const gridRef of gridReferences) {
            const grid = gridRef.deref();
            if (!grid) {
                continue;
            }
            const index = grid.columns.items.findIndex(column => column === this);
            if (index !== -1) {
                return grid;
            }
        }
        return undefined;
    }

    /**
     * Gets the zero-based index of this column within its containing grid's column collection.
     *
     * @returns The column index, or -1 if the column is not in a grid
     */
    get index(): number {
        if (this.grid) {
            const index = this.grid.columns.items.findIndex(column => column === this);
            if (index !== -1) {
                return index;
            }
        }
        return -1;
    }

    /**
     * Gets the cumulative pixel distance from the left edge of the grid to the left edge of this column.
     * Calculated by summing the widths of all columns to the left of this one.
     *
     * @returns The pixel distance from the left, or -1 if not in a grid
     */
    get fromLeft(): number {
        const grid = this.grid;
        if (!grid) {
            return -1;
        }
        let left = 0;
        for (const column of grid.columns.items) {
            if (this === column) {
                break;
            }
            left += column.width;
        }
        return left;
    }

    /**
     * Gets the change event for this column.
     * Subscribe to this event to be notified when any property of the column changes.
     *
     * @returns An event that fires whenever a column property is modified
     */
    get onChange(): UnraiseableEvent<() => void> {
        return this.#onChange.unraisable;
    }
}
