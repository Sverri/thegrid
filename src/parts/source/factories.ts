import type { Source } from "./types";
import type { Column } from "@/parts/column";
import { Record, List } from "immutable";

const sourceRecord = Record<Source<any>>({
    items: List(),
});

export function createSource<T extends object>(items: List<T>, columns: List<Column<T>>) {
    const recordObject = {} as T;
    for (const column of columns) {
        recordObject[column.binding] = undefined!;
    }
    const itemRecord = Record<T>(recordObject);
    return sourceRecord({
        items: List(items.map(x => itemRecord(x))),
    }) as Immutable.RecordOf<Source<T>>;
}
