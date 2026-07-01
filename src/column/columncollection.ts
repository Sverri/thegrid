import type { Column } from "@/column/column";
import { Event } from "@/shared/event/event";
import type { UnraiseableEvent } from "@/shared/event/unraisableevent";
import { debounce } from "throttle-debounce";

/**
 * Represents a collection of Column instances within a grid.
 *
 * The ColumnCollection manages the addition, removal, and change tracking of columns in a grid.
 * It provides an event that fires whenever the collection or any of its columns change.
 */
export class ColumnCollection {
    #columns: Column[] = [];
    #onChange = new Event<() => void>();

    /**
     * Adds one or more columns to the collection.
     *
     * Subscribes to the onChange event of each column to propagate changes to the collection's onChange event.
     *
     * @param columns
     */
    add(...columns: Column[]): void {
        for (const column of columns) {
            this.#columns.push(column);
            column.onChange.subscribe(this.#columnOnChangeHandler);
        }
        this.#onChange.raise();
    }

    /**
     * Removes one or more columns from the collection.
     *
     * Unsubscribes from the onChange event of each column to stop propagating changes to the collection's onChange event.
     *
     * @param columns
     */
    remove(...columns: Column[]): void {
        for (const column of columns) {
            const index = this.#columns.indexOf(column);
            if (index !== -1) {
                this.#columns.splice(index, 1);
                column.onChange.unsubscribe(this.#columnOnChangeHandler);
            }
        }
        this.#onChange.raise();
    }

    /**
     * Gets the list of columns in the collection.
     *
     * @returns A readonly array of Column instances.
     */
    get items(): readonly Column[] {
        return this.#columns;
    }

    /**
     * Gets the change event for this column collection.
     * Subscribe to this event to be notified when the collection changes or when any column in the collection changes.
     */
    get onChange(): UnraiseableEvent<() => void> {
        return this.#onChange.unraisable;
    }

    /**
     * Handles changes to any column in the collection.
     */
    #columnOnChangeHandler = debounce(10, () => {
        this.#onChange.raise();
    });
}
