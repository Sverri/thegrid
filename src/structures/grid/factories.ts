import type { DataItem } from "@/types";
import type { ImmutableGrid } from "./types";
import type { ImmutableColumn } from "@/structures/column";
import { List, Record } from "immutable";
import { createRange } from "@/structures/range";

const factory = Record<ImmutableGrid<any>>({
    columns: undefined!,
    source: undefined!,
    selection: undefined!,
});

export function createImmutableGrid<T extends DataItem>() {
    return factory({
        columns: List<ImmutableColumn<T>>() as List<ImmutableColumn<any>>,
        source: List<T>(),
        selection: createRange(-1, -1),
    }) as Immutable.RecordOf<ImmutableGrid<T>>;
}
