import { List } from "immutable";
import { createEvent, type UnraiseableEvent } from "@/shared/event";

/**
 * Represents an immutable collection of data items that can be updated and observed.
 *
 * The source is the data-backed store for the grid and exposes its current items,
 * a change event, and an update method for replacing the collection immutably.
 */
export interface Source<T> {
    /**
     * Gets the immutable list of items currently stored in the source.
     */
    readonly items: List<T>;

    /**
     * Gets the event emitted whenever the source changes.
     *
     * Subscribers can listen for changes to the collection itself or to any item
     * contained within it.
     */
    readonly onChange: UnraiseableEvent<() => void>;

    /**
     * Updates the source by applying a callback to the current immutable list.
     *
     * The callback receives the current list and must return a new immutable list.
     *
     * @param callback A function that receives the current items and returns the updated items.
     */
    update(callback: (columns: List<T>) => List<T>): void;
}

/**
 * Creates a source-backed collection for grid data.
 *
 * The returned object exposes the current immutable items, emits change notifications,
 * and allows updates through a callback-based API.
 *
 * @template T The type of items stored in the source.
 * @returns Source implementation that can be observed and updated.
 */
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
            items = callback(items);
            raise();
        },
    });
}
