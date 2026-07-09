import { List } from "immutable";
import { createEvent, type UnraiseableEvent } from "@/shared/event";

export interface Source<T> {
    /**
     * Gets the list of items in the collection.
     */
    readonly items: List<T>;

    /**
     * Gets the change event for this source collection.
     *
     * Subscribe to this event to be notified when the collection changes or when any items in the
     * collection changes.
     */
    readonly onChange: UnraiseableEvent<() => void>;

    /**
     * Update source
     *
     * The callback is given an immutable list containing all the items in the grid and must
     * returns a new immutable list.
     */
    update(callback: (columns: List<T>) => List<T>): void;
}

export function createSource<T extends object>(): Source<T> {
    const { raise, unraisable } = createEvent<() => void>();
    let items = List<T>();

    return Object.freeze({
        get onChange() {
            return unraisable;
        },
        get items() {
            return items;
        },
        update(callback: (columns: List<T>) => List<T>): void {
            const newColumns = callback(items);
            items = newColumns;
            raise();
        },
    });
}
