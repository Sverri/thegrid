import { createEvent } from "@shared/event";

type Filter<T> = (item: T) => boolean;
type Sorter<T> = (a: T, b: T) => -1 | 0 | 1;
type Mapper<T, K> = (item: T) => K;

interface Options<T, K = T> {
    /**
     * Mapper
     */
    mapper?: Mapper<T, K>;

    /**
     * Keeps matching source items in the active view.
     */
    filter?: Filter<K>;

    /**
     * Orders the active view after filtering.
     */
    sorter?: Sorter<K>;
}

/**
 * Maintains source items and a filtered and sorted active view of them.
 */
class CollectionView<T, K = T> {
    #source: T[];
    #items: K[];
    #mapper?: Mapper<T, K>;
    #filter?: Filter<K>;
    #sorter?: Sorter<K>;
    #isDirty = true;
    #onChange = createEvent<() => void>();

    /**
     * Creates a view over a copied set of source items.
     */
    constructor(items: T[] | undefined, options?: Options<T, K>) {
        this.#source = [...(items ?? [])];
        this.#items = [];
        this.#mapper = options?.mapper;
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
    get filter(): Filter<K> | undefined {
        return this.#filter;
    }
    set filter(value: Filter<K> | undefined) {
        this.#filter = value;
        this.#dirty = true;
    }

    /**
     * Comparator used to order active items.
     */
    get sorter(): Sorter<K> | undefined {
        return this.#sorter;
    }
    set sorter(value: Sorter<K> | undefined) {
        this.#sorter = value;
        this.#dirty = true;
    }

    /**
     * Returns a snapshot of the filtered and sorted items.
     */
    get items(): readonly K[] {
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
    get observableView(): ObservableCollectionView<T, K> {
        return new ObservableCollectionView<T, K>(this);
    }

    #updateItems() {
        let source = [...this.#source];
        let items: K[] = this.#mapper ? source.map(this.#mapper) : ([...this.#source] as never as K[]);
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
class ObservableCollectionView<T, K = T> {
    #view: CollectionView<T, K>;

    constructor(view: CollectionView<T, K>) {
        this.#view = view;
    }

    /**
     * Returns the current active items.
     */
    get items(): readonly K[] {
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
export function createCollectionView<T, K = T>(items: T[] | undefined, options?: Options<T, K>): CollectionView<T, K> {
    return new CollectionView<T, K>(items, options);
}
