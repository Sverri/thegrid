import type { DataItem } from "@/types";
import type { GridData } from "./types";
import type { Column } from "@/structures/column";
import { List, Record } from "immutable";
import { createRange } from "@/structures/range";
import { HeaderSelection } from "@/shared/enums";

const factory = Record<GridData<any>>({
    columns: undefined!,
    source: undefined!,
    selection: undefined!,
    showHeaderSelection: undefined!,
    cellSize: undefined!,
});

export function createGridData<T extends DataItem>() {
    return factory({
        columns: List<Column<T>>() as List<Column<any>>,
        source: List<T>(),
        selection: createRange(-1, -1),
        showHeaderSelection: HeaderSelection.None,
        cellSize: 30,
    }) as Immutable.RecordOf<GridData<T>>;
}
