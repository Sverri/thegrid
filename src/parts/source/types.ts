import type { List } from "immutable";

export interface Source<T extends object> {
    items: List<Immutable.RecordOf<T>>;
}
