import { describe, expect, it, vi } from "vitest";
import { createCollectionView } from "./collection";

describe("createCollectionView", () => {
    it("starts empty when no source items are supplied", () => {
        const view = createCollectionView<number>(undefined);

        expect(view.source).toEqual([]);
        expect(view.items).toEqual([]);
        expect(view.size).toBe(0);
    });

    it("updates items, if dirty, when 'size' is called", () => {
        const view = createCollectionView<number>([]);
        view.source = [1, 2, 3];
        expect(view.size).toBe(3);
    });

    it("updates items, if dirty, when 'size' is called", () => {
        const view = createCollectionView<number>([]);
        view.source = [1, 2, 3];
        expect(view.size).toBe(3);
    });

    it("derives active items by filtering and sorting source items", () => {
        const view = createCollectionView([3, 1, 2], {
            filter: item => item > 1,
            sorter: (a, b) => (a - b) as -1 | 0 | 1,
        });

        expect(view.source).toEqual([3, 1, 2]);
        expect(view.items).toEqual([2, 3]);
        expect(view.size).toBe(2);
    });

    it("maps source items into the active view", () => {
        const view = createCollectionView(
            [
                { name: "Ada", score: 10 },
                { name: "Lin", score: 20 },
            ],
            { mapper: item => `${item.name}: ${item.score}` },
        );

        expect(view.source).toEqual([
            { name: "Ada", score: 10 },
            { name: "Lin", score: 20 },
        ]);
        expect(view.items).toEqual(["Ada: 10", "Lin: 20"]);
    });

    it("applies filtering and sorting to mapped items", () => {
        const view = createCollectionView([3, 1, 2], {
            mapper: item => ({ value: item, label: `Item ${item}` }),
            filter: item => item.value > 1,
            sorter: (a, b) => (b.value - a.value) as -1 | 0 | 1,
        });

        expect(view.items).toEqual([
            { value: 3, label: "Item 3" },
            { value: 2, label: "Item 2" },
        ]);
    });

    it("reapplies the mapper when source data is replaced", () => {
        const mapper = vi.fn((item: number) => item * 10);
        const view = createCollectionView([1, 2], { mapper });

        expect(view.items).toEqual([10, 20]);
        expect(mapper).toHaveBeenCalledTimes(2);

        view.source = [3];

        expect(view.items).toEqual([30]);
        expect(mapper).toHaveBeenCalledTimes(3);
    });

    it("isolates source and active item arrays from external mutation", () => {
        const source = [1, 2];
        const view = createCollectionView(source);
        const items = view.items;

        source.push(3);
        (items as number[]).push(4);

        expect(view.source).toEqual([1, 2]);
        expect(view.items).toEqual([1, 2]);
    });

    it("replaces source data and allows filters and sorters to be cleared", () => {
        const view = createCollectionView([3, 1, 2], {
            filter: item => item > 1,
            sorter: (a, b) => (a - b) as -1 | 0 | 1,
        });

        view.source = [4, 2];
        view.filter = undefined;
        view.sorter = undefined;

        expect(view.items).toEqual([4, 2]);
    });

    it("notifies once when a clean view becomes dirty", () => {
        const view = createCollectionView([1]);
        const listener = vi.fn();
        view.onChange.subscribe(listener);

        expect(view.items).toEqual([1]);
        view.source = [-2, 2];
        view.filter = item => item > 0;

        expect(listener).toHaveBeenCalledTimes(1);
        expect(view.items).toEqual([2]);
    });

    it("exposes a live facade without modification setters", () => {
        const view = createCollectionView([1]);
        const observable = view.observableView;

        expect(observable.items).toEqual([1]);
        expect("source" in observable).toBe(false);
        expect("filter" in observable).toBe(false);
        expect("sorter" in observable).toBe(false);
        expect("raise" in observable.onChange).toBe(false);

        view.source = [2];
        expect(observable.items).toEqual([2]);
    });

    it("returns the exact same filter and sorter, when getters are used", () => {
        const view = createCollectionView<number>([]);
        const sorter = (): -1 | 0 | 1 => 0;
        const filter = (_item: any) => true;
        view.sorter = sorter;
        view.filter = filter;

        expect(view.sorter).toStrictEqual(sorter);
        expect(view.filter).toStrictEqual(filter);
    });
});
