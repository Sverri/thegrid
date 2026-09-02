import { createEvent } from "@shared/event";

type Filter<T> = (item: T) => boolean;
type Sorter<T> = (a: T, b: T) => -1 | 0 | 1;

interface Options<T> {
    /**
     * Keeps matching source items in the active view.
     */
    filter?: (item: T) => boolean;

    /**
     * Orders the active view after filtering.
     */
    sorter?: (a: T, b: T) => -1 | 0 | 1;
}

/**
 * Maintains source items and a filtered and sorted active view of them.
 */
class CollectionView<T> {
    #source: T[];
    #items: T[];
    #filter?: Filter<T>;
    #sorter?: Sorter<T>;
    #isDirty = true;
    #onChange = createEvent<() => void>();

    /**
     * Creates a view over a copied set of source items.
     */
    constructor(items: T[] | undefined, options?: Options<T>) {
        this.#source = [...(items ?? [])];
        this.#items = [...this.#source];
        this.#filter = options?.filter;
        this.#sorter = options?.sorter;
    }

    /**
     * Number of items currently in the active view.
     */
    get size(): number {
        if (this.#dirty) {
            this.#updateItems();
        }
        return this.#items.length;
    }

    /**
     * Predicate used to derive active items.
     */
    get filter(): Filter<T> | undefined {
        return this.#filter;
    }
    set filter(value: Filter<T> | undefined) {
        this.#filter = value;
        this.#dirty = true;
    }

    /**
     * Comparator used to order active items.
     */
    get sorter(): Sorter<T> | undefined {
        return this.#sorter;
    }
    set sorter(value: Sorter<T> | undefined) {
        this.#sorter = value;
        this.#dirty = true;
    }

    /**
     * Returns a snapshot of the filtered and sorted items.
     */
    get items(): readonly T[] {
        if (this.#dirty) {
            this.#updateItems();
        }
        return [...this.#items];
    }

    /**
     * Returns a snapshot of the unfiltered source items.
     */
    get source(): readonly T[] {
        return [...this.#source];
    }
    set source(values: readonly T[]) {
        this.#source = [...values];
        this.#dirty = true;
    }

    get #dirty() {
        return this.#isDirty;
    }
    set #dirty(value: boolean) {
        const triggerOnChange = value === true && this.#isDirty === false;
        this.#isDirty = value;
        if (triggerOnChange) {
            this.#onChange.raise();
        }
    }

    /**
     * Notifies subscribers when a change invalidates the active view.
     */
    get onChange() {
        return this.#onChange.unraisable;
    }

    /**
     * Exposes a live view with only `items` and `onChange`.
     */
    get observableView(): ObservableCollectionView<T> {
        return new ObservableCollectionView<T>(this);
    }

    #updateItems() {
        let items = [...this.#source];
        if (this.#filter) {
            items = items.filter(this.#filter);
        }
        if (this.#sorter) {
            items = items.toSorted(this.#sorter);
        }
        this.#items = items;
        this.#dirty = false;
    }
}

/**
 * Read-only live facade for observing a collection view.
 */
class ObservableCollectionView<T> {
    #view: CollectionView<T>;

    constructor(view: CollectionView<T>) {
        this.#view = view;
    }
    /**
     * Returns the current active items.
     */
    get items(): readonly T[] {
        return this.#view.items;
    }
    /**
     * Notifies subscribers when the source view changes.
     */
    get onChange() {
        return this.#view.onChange;
    }
}

export type { CollectionView, ObservableCollectionView as ReadonlyCollectionView };

/**
 * Creates a collection view from optional source items and view options.
 */
export function createCollectionView<T>(items: T[] | undefined, options?: Options<T>): CollectionView<T> {
    return new CollectionView<T>(items, options);
}
