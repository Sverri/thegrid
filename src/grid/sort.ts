import type { DataItem } from "@shared/types";
import { DataType, SortDirection } from "@shared/enums";
import type { Sorter } from "@core/collection";

/**
 * What a column sorter needs to know about its column. It is read once, when
 * the sorter is created, so later changes to the column do not affect it.
 */
export interface ColumnSortSpec<T extends DataItem> {
    binding: keyof T;
    dataType: DataType;
    sortDirection: SortDirection;
}

const numericTypes: ReadonlySet<DataType> = new Set([
    DataType.Number,
    DataType.Integer,
    DataType.Decimal,
    DataType.Currency,
    DataType.Id,
]);

function isEmpty(value: unknown) {
    return value === undefined || value === null || value === "";
}

function toNumber(value: unknown, dataType: DataType): number {
    if (dataType === DataType.Date) {
        return value instanceof Date ? value.getTime() : new Date(String(value)).getTime();
    }
    if (dataType === DataType.Boolean) {
        return value ? 1 : 0;
    }
    return typeof value === "number" ? value : Number(value);
}

/**
 * Compares two non-empty values in ascending order.
 *
 * Numbers, dates and booleans compare by value. Everything else (and values
 * of those types that cannot be converted) compares as text with `collator`.
 */
export function compareValues(a: unknown, b: unknown, dataType: DataType, collator: Intl.Collator): number {
    if (numericTypes.has(dataType) || dataType === DataType.Date || dataType === DataType.Boolean) {
        const x = toNumber(a, dataType);
        const y = toNumber(b, dataType);
        if (!Number.isNaN(x) && !Number.isNaN(y)) {
            return x - y;
        }
    }
    return collator.compare(String(a), String(b));
}

/**
 * Creates a sorter that orders rows by one column.
 *
 * Empty values (`undefined`, `null` and `""`) always come last, whatever the direction.
 *
 * @param spec The column's binding, data type and sort direction.
 * @param collator Compares text values.
 */
export function createColumnSorter<T extends DataItem>(spec: ColumnSortSpec<T>, collator: Intl.Collator): Sorter<T> {
    const { binding, dataType, sortDirection } = spec;
    const sign = sortDirection === SortDirection.Descending ? -1 : 1;
    return (a, b) => {
        const x = a[binding];
        const y = b[binding];
        const xEmpty = isEmpty(x);
        const yEmpty = isEmpty(y);
        if (xEmpty || yEmpty) {
            return Number(xEmpty) - Number(yEmpty);
        }
        return sign * compareValues(x, y, dataType, collator);
    };
}

/**
 * The direction a click on a column header moves to: unsorted, then
 * ascending, then descending, then unsorted again.
 */
export function nextSortDirection(current: SortDirection | undefined): SortDirection | undefined {
    switch (current) {
        case undefined:
            return SortDirection.Ascending;
        case SortDirection.Ascending:
            return SortDirection.Descending;
        default:
            return undefined;
    }
}
