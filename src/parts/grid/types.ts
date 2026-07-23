import type { List } from "immutable";
import type { RaiseableEvent } from "@/shared/event";
import type { ColumnCollection, ColumnOptions } from "@/parts/column";
import type { Source } from "@/parts/source";
import type { Selection } from "@/parts/selection";

export interface TheGrid<T extends Record<string, any>> {
    /**
     * Grid host element
     */
    get hostElement(): HTMLElement;

    /**
     * Grid cells element
     */
    get cellsElement(): HTMLElement;

    /**
     * Grid column headers element
     */
    get columnHeadersElement(): HTMLElement;

    /**
     * Grid row headers element
     */
    get rowHeadersElement(): HTMLElement;

    /**
     * Source (data used in grid)
     */
    get source(): Source<T>;

    /**
     * Columns
     */
    get columns(): ColumnCollection<T>;

    /**
     * Size of cells (in pixels)
     */
    get cellSize(): number;

    /**
     * Current selection
     *
     * Use `updateSelection()` to change the selection.
     */
    get selection(): Selection;

    /**
     * Event for when grid is invalidated (updated)
     */
    get onInvalidate(): RaiseableEvent<() => void>;

    /**
     * Update columns
     */
    updateColumns(
        callback: (columns: List<Immutable.RecordOf<ColumnOptions<T>>>) => List<Immutable.RecordOf<ColumnOptions<T>>>,
    ): void;

    /**
     * Update source
     */
    updateSource(callback: (source: List<Immutable.RecordOf<T>>) => List<Immutable.RecordOf<T>>): void;

    /**
     * Update current selection
     */
    updateSelection(callback: (source: Immutable.RecordOf<Selection>) => Immutable.RecordOf<Selection>): void;

    /**
     * Extend the grid (gives you access to the internal mutable state of the grid)
     */
    extend(callback: (grid: TheGrid<T>) => void): void;

    /**
     * Invalidate (update) the grid, triggering a render
     */
    invalidate(immediately?: boolean): void;

    /**
     * Scroll a cell into view
     */
    scrollIntoView(columnIndex: number, rowIndex: number): void;

    /**
     * Get data inside a cell
     */
    getCellData<T>(columnIndex: number, rowIndex: number): T | undefined;
}

export interface TheGridOptions<T extends Record<string, any>> {
    /**
     * Data
     */
    data?: ArrayLike<T>;

    /**
     * Columns
     */
    columns?: ArrayLike<ColumnOptions<T>>;
}
