import type { DataItem } from "@/types";
import type { ImmutableColumn } from "@/structures/column";
import type { Range } from "@/structures/range";

export interface ImmutableGrid<T extends DataItem> {
    /**
     * Columns
     */
    readonly columns: Immutable.List<ImmutableColumn<T>>;

    /**
     * Source (data used in grid)
     */
    readonly source: Immutable.List<T>;

    /**
     * Current selection
     *
     * Use `updateSelection()` to change the selection.
     */
    readonly selection: Immutable.RecordOf<Range>;
}
