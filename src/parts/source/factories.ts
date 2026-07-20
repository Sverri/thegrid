import type { TheGrid } from "@/grid";
import type { Source } from "./types";
import { Record, List } from "immutable";

const sourceRecord = Record<Source<any>>({
    items: List(),
});

export function createSource<T extends object>(items: List<T>, grid: TheGrid<T>) {
    const recordObject = {} as T;
    for (const column of grid.columns.items) {
        recordObject[column.binding] = undefined!;
    }
    const itemRecord = Record<T>(recordObject);
    return sourceRecord({
        items: List(items.map(x => itemRecord(x))),
    }) as Immutable.RecordOf<Source<T>>;
}
