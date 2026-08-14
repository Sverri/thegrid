import type { DataItem } from "@/types";
import type { HeaderSelection } from "@/shared/enums";
import type { Range } from "@/structures/range";
import type { Column } from "@/structures/column";

export interface GridData<T extends DataItem> {
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
     */
    readonly selection: Range;

    /**
     * Header selection
     */
    readonly showHeaderSelection: HeaderSelection;

    /**
     * Cell size
     */
    readonly cellSize: number;
}
