import type { Column } from "./objects/column";
import type { Range } from "./objects/range";

export type DataItem = Record<string, any>;

export interface ImmutableGrid<T extends DataItem> {
    /**
     * Columns
     */
    readonly columns: Immutable.List<Column<T>>;

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
