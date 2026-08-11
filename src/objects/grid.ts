import type { DataItem } from "@/types";
import type { RaiseableEvent } from "@/shared/event";
import type { HeaderSelection } from "@/shared/enums";
import type { ImmutableColumn } from "./column";
import { createColumnOptions, type ColumnOptions, type ImmutableColumnOptions } from "./columnoptions";
import { List, Record } from "immutable";
import type { Range } from "./range";

export const GRID_HTML = `
    <div class="thegrid-area-cells" tabindex="0"></div>
    <div class="thegrid-area-topleft"></div>
    <div class="thegrid-area-columnheaders"></div>
    <div class="thegrid-area-rowheaders"></div>
`;

export interface TheGrid<T extends DataItem> {
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
    get source(): List<T>;

    /**
     * Columns
     */
    get columns(): Immutable.List<ImmutableColumn<T>>;

    /**
     * Size of cells (in pixels)
     */
    get cellSize(): number;

    /**
     * Current selection
     *
     * Use `updateSelection()` to change the selection.
     */
    get selection(): Range;

    /**
     * Event for when grid is invalidated (updated)
     */
    get onInvalidate(): RaiseableEvent<() => void>;

    /**
     * How to show selection in column and row headers
     */
    get showHeaderSelection(): HeaderSelection;

    /**
     * Update columns
     */
    updateColumns(callback: (columns: List<ImmutableColumnOptions<T>>) => List<ImmutableColumnOptions<T>>): void;

    /**
     * Update source
     */
    updateSource(callback: (source: List<T>) => List<T>): void;

    /**
     * Update current selection
     */
    updateSelection(callback: (source: Immutable.RecordOf<Range>) => Immutable.RecordOf<Range>): void;

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

export interface TheGridOptions<T extends DataItem> {
    /**
     * Source
     *
     * **Default:** `[]`
     */
    source?: ArrayLike<T>;

    /**
     * Columns
     *
     * **Default:** `[]`
     */
    columns?: ArrayLike<ColumnOptions<T>>;

    /**
     * Header selection indicator
     *
     * **Default:** {@link HeaderSelection.Both}
     */
    showHeaderSelection?: HeaderSelection;
}

const gridRecord = Record<TheGrid<any>>({
    hostElement: undefined!,
    cellsElement: undefined!,
    columnHeadersElement: undefined!,
    rowHeadersElement: undefined!,
    invalidate: undefined!,
    updateColumns: undefined!,
    updateSource: undefined!,
    updateSelection: undefined!,
    scrollIntoView: undefined!,
    getCellData: undefined!,
    extend: undefined!,
    columns: undefined!,
    source: undefined!,
    selection: undefined!,
    cellSize: undefined!,
    onInvalidate: undefined!,
    showHeaderSelection: undefined!,
});

export function createGridInstance<T extends DataItem>(grid: TheGrid<T>): Immutable.RecordOf<TheGrid<T>> {
    return gridRecord(grid as TheGrid<any>) as Immutable.RecordOf<TheGrid<T>>;
}

export function getColumns<T extends DataItem>(
    columns: ArrayLike<ColumnOptions<T>> | undefined,
): List<ImmutableColumnOptions<T>> {
    if (!Array.isArray(columns)) {
        return List() as List<ImmutableColumnOptions<T>>;
    }
    const options = Array.from(columns);
    return List(options.map(option => createColumnOptions(option))) as List<ImmutableColumnOptions<T>>;
}
