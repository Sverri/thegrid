import type { Callback } from "@shared/event";
import { createEvent } from "@shared/event";

/**
 * Decides whether an item is included in the view.
 *
 * @returns `true` to keep the item.
 */
type Filter<T> = (item: T) => boolean;

/**
 * Orders two items, like the comparator of `Array.prototype.sort`.
 *
 * @returns A negative number if `a` comes first, a positive number if `b` comes first, or `0` to keep their order.
 */
type Sorter<T> = (a: T, b: T) => number;

/**
 * Converts a source item into a view item.
 */
type Mapper<T, K> = (item: T) => K;

/**
 * Options accepted by {@link createCollectionView}.
 *
 * @typeParam SourceItem The type of the source items.
 * @typeParam ViewItem The type of the items in the view, after mapping.
 */
export interface CollectionViewOptions<SourceItem, ViewItem = SourceItem> {
    /**
     * Converts each source item into a view item. It runs before the filter and the sorter.
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

    /**
     * Subscribed to {@link CollectionView.onChange}.
     */
    onChange?: Callback;
}

/**
 * Maintains source items and a filtered and sorted active view of them.
 *
 * The view is rebuilt lazily: changes only mark it as dirty, and the work
 * happens the next time `items` or `size` is read.
 *
 * Create one with {@link createCollectionView}.
 *
 * @typeParam SourceItem The type of the source items.
 * @typeParam ViewItem The type of the items in the view, after mapping.
 */
class CollectionView<SourceItem, ViewItem = SourceItem> {
    // Both arrays are frozen, so they can be handed out without copying
    #source: readonly SourceItem[];
    #items: readonly ViewItem[];
    #mapper: Mapper<SourceItem, ViewItem> | undefined;
    #filter: Filter<ViewItem> | undefined;
    #sorter: Sorter<ViewItem> | undefined;
    #onChange = createEvent<() => void>();
    #isDirty = true;

    /**
     * Creates a view over a copied set of source items.
     */
    constructor(items: SourceItem[], options?: CollectionViewOptions<SourceItem, ViewItem>) {
        this.#source = Object.freeze([...items]);
        this.#items = Object.freeze([]);

        if (options?.mapper) {
            this.#mapper = options.mapper;
        }
        if (options?.filter) {
            this.#filter = options.filter;
        }
        if (options?.sorter) {
            this.#sorter = options.sorter;
        }
        if (options?.onChange) {
            this.#onChange.subscribe(options?.onChange);
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
     * Returns the filtered and sorted items.
     *
     * The array is frozen and is replaced (not mutated) when the view changes,
     * so it is safe to keep a reference as a snapshot.
     */
    get items(): readonly ViewItem[] {
        if (this.#dirty) {
            this.#updateItems();
        }
        return this.#items;
    }

    /**
     * Returns the unfiltered source items as a frozen array.
     */
    get source(): readonly SourceItem[] {
        return this.#source;
    }
    set source(values: readonly SourceItem[]) {
        this.#source = Object.freeze([...values]);
        this.#dirty = true;
    }

    /**
     * Replaces the source items with the result of a callback.
     *
     * This is an alternative to setting {@link source} directly.
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
     * @param callback Receives a mutable copy of the source items and returns the new source items.
     */
    modify(callback: (values: SourceItem[]) => SourceItem[]) {
        this.source = callback([...this.#source]);
    }

    /**
     * Re-applies the mapper, filter and sorter on next access.
     *
     * Call this after mutating source items in place, since such changes
     * cannot be detected automatically.
     */
    refresh(): void {
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
     * Exposes a live view with only `items` and `onChange`.
     */
    get observableView(): ObservableCollectionView<SourceItem, ViewItem> {
        return new ObservableCollectionView<SourceItem, ViewItem>(this);
    }

    /**
     * Event raised when the view goes from up to date to dirty.
     *
     * It fires once per change set: further changes before `items` or `size`
     * is read again do not raise it again.
     */
    get onChange() {
        return this.#onChange.unraisable;
    }

    #updateItems() {
        let items = this.#mapper
            ? this.#source.map(this.#mapper)
            : (this.#source as readonly unknown[] as readonly ViewItem[]);
        if (this.#filter) {
            items = items.filter(this.#filter);
        }
        if (this.#sorter) {
            items = items.toSorted(this.#sorter);
        }
        // Without a mapper, filter or sorter this is the (already frozen) source array itself
        this.#items = Object.freeze(items);
        this.#dirty = false;
    }
}

/**
 * Read-only live facade for observing a collection view.
 *
 * Get one from {@link CollectionView.observableView}.
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
 *
 * @typeParam SourceItem The type of the source items.
 * @typeParam ViewItem The type of the items in the view, after mapping.
 * @param items The source items. The array is copied. Defaults to an empty array.
 * @param options The mapper, filter, sorter and change handler.
 * @returns The new collection view.
 */
export function createCollectionView<SourceItem, ViewItem = SourceItem>(
    items: SourceItem[] | undefined,
    options?: CollectionViewOptions<SourceItem, ViewItem>,
): CollectionView<SourceItem, ViewItem> {
    return new CollectionView<SourceItem, ViewItem>(items ?? [], options);
}

/**
 * Checks whether a value is a collection view.
 *
 * @param value The value to check.
 * @returns `true` if the value was created by {@link createCollectionView}.
 */
export function isCollectionView<SourceItem, ViewItem = SourceItem>(
    value: unknown,
): value is CollectionView<SourceItem, ViewItem> {
    return value instanceof CollectionView;
}
