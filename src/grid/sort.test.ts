import { describe, expect, it } from "vitest";
import { DataType, SortDirection } from "@shared/enums";
import { compareValues, createColumnSorter, nextSortDirection } from "./sort";

const collator = new Intl.Collator("en", { numeric: true });

function sortValues(values: unknown[], dataType: DataType, sortDirection: SortDirection = SortDirection.Ascending) {
    const sorter = createColumnSorter<{ value: unknown }>({ binding: "value", dataType, sortDirection }, collator);
    return values
        .map(value => ({ value }))
        .toSorted(sorter)
        .map(row => row.value);
}

describe("compareValues", () => {
    it("compares numeric types by value, including numeric strings", () => {
        expect(sortValues([10, 9, 1.5, 1.25], DataType.Number)).toEqual([1.25, 1.5, 9, 10]);
        expect(sortValues(["10", "9", "1.5", "1.25"], DataType.Decimal)).toEqual(["1.25", "1.5", "9", "10"]);
        for (const dataType of [DataType.Integer, DataType.Currency, DataType.Id]) {
            expect(sortValues([3, 1, 2], dataType)).toEqual([1, 2, 3]);
        }
    });

    it("compares dates by time, including date strings", () => {
        const a = new Date("2020-01-01");
        const b = new Date("2021-01-01");
        expect(sortValues([b, a], DataType.Date)).toEqual([a, b]);
        expect(sortValues(["2021-01-01", "2020-01-01"], DataType.Date)).toEqual(["2020-01-01", "2021-01-01"]);
    });

    it("puts false before true", () => {
        expect(sortValues([true, false, true], DataType.Boolean)).toEqual([false, true, true]);
    });

    it("compares text with the collator, treating digit runs as numbers", () => {
        expect(sortValues(["b", "item10", "A", "item2"], DataType.String)).toEqual(["A", "b", "item2", "item10"]);
        expect(sortValues(["b", "a"], DataType.Email)).toEqual(["a", "b"]);
    });

    it("falls back to text when a value cannot be converted", () => {
        expect(compareValues("abc", 1, DataType.Number, collator)).toBeGreaterThan(0);
        expect(compareValues("not a date", "2020-01-01", DataType.Date, collator)).toBeGreaterThan(0);
    });
});

describe("createColumnSorter", () => {
    it("reverses the order when descending", () => {
        expect(sortValues([1, 3, 2], DataType.Number, SortDirection.Descending)).toEqual([3, 2, 1]);
    });

    it("puts empty values last in both directions", () => {
        const values = [2, undefined, 1, null, ""];
        expect(sortValues(values, DataType.Number)).toEqual([1, 2, undefined, null, ""]);
        expect(sortValues(values, DataType.Number, SortDirection.Descending)).toEqual([2, 1, undefined, null, ""]);
    });
});

describe("nextSortDirection", () => {
    it("cycles from unsorted to ascending to descending and back", () => {
        expect(nextSortDirection(undefined)).toBe(SortDirection.Ascending);
        expect(nextSortDirection(SortDirection.Ascending)).toBe(SortDirection.Descending);
        expect(nextSortDirection(SortDirection.Descending)).toBeUndefined();
    });
});
