import type { TheGrid } from "@/parts/grid";
import type { Range } from "@/parts/range";

export interface Selection {
    range: Range;
    grid: TheGrid<any>;
}
