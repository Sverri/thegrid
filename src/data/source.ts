import { List, Record } from "immutable";
import { Event } from "@/shared/event/event";
import type { UnraiseableEvent } from "@/shared/event/unraisableevent";

export class Source<T extends object> {
    #items: List<T>;
    #onChange = new Event<() => void>();

    constructor(data: ArrayLike<T>) {
        this.#items = List(data);
    }

    get items(): List<T> {
        return this.#items;
    }

    insertStart(...items: T[]): void {
        this.#items = this.#items.unshift(...items);
        this.#onChange.raise();
    }

    insertEnd(...items: T[]): void {
        this.#items = this.#items.push(...items);
        this.#onChange.raise();
    }

    insertAt(index: number, ...items: T[]): void {
        this.#items = this.#items.splice(index, 0, ...items);
        this.#onChange.raise();
    }

    removeStart(count: number): void {
        this.#items = this.#items.splice(0, count);
        this.#onChange.raise();
    }

    removeEnd(count: number): void {
        this.#items = this.#items.splice(-count, count);
        this.#onChange.raise();
    }

    removeAt(index: number, count: number = 1): void {
        this.#items = this.#items.splice(index, count);
        this.#onChange.raise();
    }

    update(index: number, callback: (item: T | undefined) => T | undefined): void {
        const item = this.#items.get(index);
        if (!item) {
            return;
        }
        const record = Record<T>(item);
        const mutRecord = record().withMutations(callback);

        if (mutRecord.wasAltered()) {
            this.#items = this.#items.update(index, record);
        }
        this.#onChange.raise();
    }

    /**
     * Gets the change event for this column collection.
     * Subscribe to this event to be notified when the collection changes or when any column in the collection changes.
     */
    get onChange(): UnraiseableEvent<() => void> {
        return this.#onChange.unraisable;
    }
}
