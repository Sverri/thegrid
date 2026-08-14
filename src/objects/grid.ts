import type { DataItem } from "@/types";
import type { RaiseableEvent } from "@/shared/event";
import type { HeaderSelection } from "@/shared/enums";
import type { Range } from "@/structures/range";
import type { ImmutableGrid } from "@/structures/grid";
import { createColumn, type Column, type ImmutableColumn } from "@/structures/column";
import { List, Record } from "immutable";

export const GRID_HTML = `
    <div class="thegrid-area-cells" tabindex="0"></div>
    <div class="thegrid-area-topleft"></div>
    <div class="thegrid-area-columnheaders"></div>
    <div class="thegrid-area-rowheaders"></div>
`;

export interface TheGrid<T extends DataItem> {
    modify(callback: (grid: Immutable.RecordOf<ImmutableGrid<T>>) => Immutable.RecordOf<ImmutableGrid<T>>): void;

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
    updateColumns(callback: (columns: List<ImmutableColumn<T>>) => List<ImmutableColumn<T>>): void;

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
    columns?: ArrayLike<Column<T>>;

    /**
     * Header selection indicator
     *
     * **Default:** {@link HeaderSelection.Both}
     */
    showHeaderSelection?: HeaderSelection;
}

const gridRecord = Record<TheGrid<any>>({
    modify: undefined!,
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

export function getColumns<T extends DataItem>(columns: ArrayLike<Column<T>> | undefined): List<ImmutableColumn<T>> {
    if (!Array.isArray(columns)) {
        return List<ImmutableColumn<T>>();
    }
    return List<ImmutableColumn<T>>(columns.map(data => createColumn(data)));
}
