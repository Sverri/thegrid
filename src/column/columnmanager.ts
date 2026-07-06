import type { UnraiseableEvent } from "@/shared/event/unraisableevent";
import type { Column, ColumnOptions } from "@/column/column";
import type { TheGrid } from "@/thegrid";
import { Event } from "@/shared/event/event";
import { List } from "immutable";
import { ColumnType } from "@/shared/enums";

/**
 * Represents a collection of Column instances within a grid.
 *
 * The ColumnCollection manages the addition, removal, and change tracking of columns in a grid.
 * It provides an event that fires whenever the collection or any of its columns change.
 */
export class ColumnManager {
    #grid: TheGrid<any>;
    #items = List<Column>([]);
    #onChange = new Event<() => void>();

    constructor(grid: TheGrid<any>, columns: ColumnOptions[]) {
        this.#grid = grid;
        this.update(() => List(columns));
    }

    /**
     * Update multiple columns
     *
     * The callback is given an immutable list containing all the columns in the grid and must
     * returns a new immutable list.
     *
     * @param callback
     *
     * @example
     * ```typescript
     * // Remove a column
     * grid.columns.update(columns => {
     *     return columns.filter(column => column.binding !== "name");
     * });
     * ```
     *
     * @example
     * ```typescript
     * // Replace a column
     * grid.columns.update(columns => {
     *     const index = columns.findIndex(column => column.binding === "oldsalary");
     *     return columns
     *         .remove(index)
     *         .insert(index, new Column({ binding: "salary" }));
     * });
     *
     * ```
     * @example
     * ```typescript
     * // Sort columns
     * grid.columns.update(columns => {
     *     return columns.sortBy(column => column.header)
     * });
     * ```
     */
    update(callback: (columns: List<ColumnOptions>) => List<ColumnOptions>): void {
        const options = this.#extractOptions(this.#items);
        const newColumns = callback(options);

        let visibleIndex = 0;
        let fromLeft = 0;

        this.#items = newColumns.map<Column>((column, index) => {
            const visible = column.visible ?? true;
            const width = column.width ?? 100;
            const data = {
                binding: column.binding,
                header: column.header ?? column.binding,
                dataType: column.dataType ?? ColumnType.String,
                width: column.width ?? 100,
                minWidth: column.minWidth ?? 1,
                maxWidth: column.maxWidth ?? 999999,
                visible: visible,
                grid: this.#grid,
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
        this.#onChange.raise();
    }

    #extractOptions(columns: List<Column>) {
        return columns.map<ColumnOptions>(column => ({
            binding: column.binding,
            header: column.header,
            dataType: column.dataType,
            width: column.width,
            minWidth: column.minWidth,
            maxWidth: column.maxWidth,
            visible: column.visible,
        }));
    }

    /**
     * Gets the list of columns in the collection.
     *
     * @returns A readonly array of Column instances.
     */
    get items(): List<Column> {
        return this.#items;
    }

    /**
     * Gets the change event for this column collection.
     * Subscribe to this event to be notified when the collection changes or when any column in the
     * collection changes.
     */
    get onChange(): UnraiseableEvent<() => void> {
        return this.#onChange.unraisable;
    }
}
