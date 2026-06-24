import { Column, type ColumnOptions } from "./column";

interface Options {
    data: object[];
    columns: ColumnOptions[];
}

export class TheGrid {
    #hostElement: HTMLElement;
    #columns: Column[];

    constructor(hostElement: HTMLElement, options?: Options) {
        this.#hostElement = hostElement;

        if (Array.isArray(options?.columns) && options?.columns.length >= 1) {
            this.#columns = options.columns.map(columnOptions => new Column(columnOptions));
        } else {
            this.#columns = this.#extractColumnsFromData(options?.data || []);
        }
    }

    get columns(): readonly Column[] {
        return Object.freeze(this.#columns);
    }

    #extractColumnsFromData(data: object[]): Column[] {
        const bindings = new Set<string>();
        for (const item of data) {
            Object.keys(item).forEach(key => bindings.add(key));
        }
        return [...bindings].map(b => new Column({ binding: b }));
    }
}
