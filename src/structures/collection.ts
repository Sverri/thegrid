import { createEvent } from "@shared/event";

type Filter<T> = (item: T) => boolean;
type Sorter<T> = (a: T, b: T) => number;
type Mapper<T, K> = (item: T) => K;

export interface CollectionViewOptions<SourceItem, ViewItem = SourceItem> {
    /**
     * Mapper
     */
    mapper?: Mapper<SourceItem, ViewItem>;

    /**
     * Keeps matching source items in the active view.
     */
    filter?: Filter<ViewItem>;

    /**
     * Orders the active view after filtering.
     */
    sorter?: Sorter<ViewItem>;
}

/**
 * Maintains source items and a filtered and sorted active view of them.
 */
class CollectionView<SourceItem, ViewItem = SourceItem> {
    readonly onChange = createEvent<() => void>();
    #source: SourceItem[];
    #items: ViewItem[];
    #mapper: Mapper<SourceItem, ViewItem> | undefined;
    #filter: Filter<ViewItem> | undefined;
    #sorter: Sorter<ViewItem> | undefined;
    #isDirty = true;

    /**
     * Creates a view over a copied set of source items.
     */
    constructor(items: SourceItem[], options?: CollectionViewOptions<SourceItem, ViewItem>) {
        this.#source = [...items];
        this.#items = [];

        if (options?.mapper) {
            this.#mapper = options.mapper;
        }
        if (options?.filter) {
            this.#filter = options.filter;
        }
        if (options?.sorter) {
            this.#sorter = options.sorter;
        }
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
    get filter(): Filter<ViewItem> | undefined {
        return this.#filter;
    }
    set filter(value: Filter<ViewItem> | undefined) {
        this.#filter = value;
        this.#dirty = true;
    }

    /**
     * Comparator used to order active items.
     */
    get sorter(): Sorter<ViewItem> | undefined {
        return this.#sorter;
    }
    set sorter(value: Sorter<ViewItem> | undefined) {
        this.#sorter = value;
        this.#dirty = true;
    }

    /**
     * Returns a snapshot of the filtered and sorted items.
     */
    get items(): readonly ViewItem[] {
        if (this.#dirty) {
            this.#updateItems();
        }
        return [...this.#items];
    }

    /**
     * Returns a snapshot of the unfiltered source items.
     */
    get source(): readonly SourceItem[] {
        return [...this.#source];
    }
    set source(values: readonly SourceItem[]) {
        this.#source = [...values];
        this.#dirty = true;
    }

    /**
     * Modify source items (alternative to setting {@link source} property directly)
     *
     * @example
     * ```ts
     * foods.modify(items => {
     *    return items.map(item => {
     *        if (item.type === "banana") {
     *            item.crispy = false;
     *        }
     *        return item;
     *    });
     * });
     * ```
     * @param callback
     */
    modify(callback: (values: SourceItem[]) => SourceItem[]) {
        this.source = callback(this.#source);
    }

    get #dirty() {
        return this.#isDirty;
    }
    set #dirty(value: boolean) {
        const triggerOnChange = value === true && this.#isDirty === false;
        this.#isDirty = value;
        if (triggerOnChange) {
            this.onChange.raise();
        }
    }

    /**
     * Exposes a live view with only `items` and `onChange`.
     */
    get observableView(): ObservableCollectionView<SourceItem, ViewItem> {
        return new ObservableCollectionView<SourceItem, ViewItem>(this);
    }

    #updateItems() {
        let source = [...this.#source];
        let items: ViewItem[] = this.#mapper ? source.map(this.#mapper) : ([...this.#source] as never as ViewItem[]);
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
class ObservableCollectionView<SourceItem, ViewItem = SourceItem> {
    #view: CollectionView<SourceItem, ViewItem>;

    constructor(view: CollectionView<SourceItem, ViewItem>) {
        this.#view = view;
    }

    /**
     * Returns the current active items.
     */
    get items(): readonly ViewItem[] {
        return this.#view.items;
    }

    /**
     * Notifies subscribers when the source view changes.
     */
    get onChange() {
        return this.#view.onChange;
    }
}

export type { CollectionView, ObservableCollectionView };

/**
 * Creates a collection view from optional source items and view options.
 */
export function createCollectionView<SourceItem, ViewItem = SourceItem>(
    items: SourceItem[] | undefined,
    options?: CollectionViewOptions<SourceItem, ViewItem>,
): CollectionView<SourceItem, ViewItem> {
    return new CollectionView<SourceItem, ViewItem>(items ?? [], options);
}

/**
 * Find out if a value is a Column instance
 *
 * @param value
 */
export function isCollectionView(value: unknown) {
    return value instanceof CollectionView;
}
