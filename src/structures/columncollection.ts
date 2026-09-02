import type { DataItem } from "@shared/types";
import { createColumn, type Column, type ColumnOptions } from "./column";
import { createEvent } from "@shared/event";

class ColumnCollection<T extends DataItem> {
    #columns: Column<T>[];
    #onChange = createEvent<() => void>();

    constructor(columns?: ColumnOptions<T>[]) {
        this.#columns = (columns ?? []).map(c => createColumn(c, this));
    }

    get onChange() {
        return this.#onChange.unraisable;
    }

    get items(): ReadonlyArray<Column<T>> {
        return this.#columns;
    }

    modify(callback: (columns: ColumnOptions<T>[]) => ColumnOptions<T>[]) {
        const options = this.#extractOptions();
        const result = callback(options);
        this.#columns = result.map(options => createColumn(options, this));
        this.#onChange.raise();
    }

    #extractOptions() {
        return this.#columns.map<ColumnOptions<T>>(column => ({
            binding: column.binding,
            dataType: column.dataType,
            header: column.header,
            width: column.width,
            maxWidth: column.maxWidth,
            minWidth: column.minWidth,
            visible: column.visible,
        }));
    }
}

export type { ColumnCollection };

export function createColumnCollection<T extends DataItem>(columns?: ColumnOptions<T>[]) {
    return new ColumnCollection(columns);
}
