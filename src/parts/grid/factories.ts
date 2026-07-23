import { Record as ImmutableRecord } from "immutable";
import type { TheGrid } from "./types";

const gridRecord = ImmutableRecord<TheGrid<any>>({
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
});

export function createGridInstance<T extends Record<string, any>>(grid: TheGrid<T>): Immutable.RecordOf<TheGrid<T>> {
    return gridRecord(grid as TheGrid<any>) as Immutable.RecordOf<TheGrid<T>>;
}
