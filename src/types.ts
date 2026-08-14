import type { GridData } from "@/structures/grid";
import type { UnraiseableEvent } from "./shared/event";
import type { HeaderSelection } from "./shared/enums";

export type DataItem = Record<string, any>;

export interface ExtendObject<T extends DataItem> {
    get grid(): GridData<T>;
    modify(callback: (grid: Immutable.RecordOf<GridData<T>>) => Immutable.RecordOf<GridData<T>>): void;
    hostElement: HTMLElement;
    cellsElement: HTMLElement;
    columnHeadersElement: HTMLElement;
    rowHeadersElement: HTMLElement;
    invalidate(immediately?: boolean): void;
    scrollIntoView(columnIndex: number, rowIndex: number): void;
    getCellData<T>(columnIndex: number, rowIndex: number): T | undefined;
    extend(callback: (meta: ExtendObject<T>) => void): void;
    cellSize: number;
    onInvalidate: UnraiseableEvent<() => void>;
    showHeaderSelection: HeaderSelection;
}
