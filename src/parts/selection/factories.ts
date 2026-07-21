import type { TheGrid } from "@/grid";
import type { Selection } from "./types";
import type { Range } from "@/parts/range";
import { Record as ImmutableRecord } from "immutable";

const selectionRecord = ImmutableRecord<Selection>({
    range: undefined!,
    grid: undefined!,
});

export function createSelection<T extends Record<string, any>>(range: Range, grid: TheGrid<T>) {
    return new selectionRecord({ range, grid });
}
