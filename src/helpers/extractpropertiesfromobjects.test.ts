import { describe, it, expect } from "vitest";
import { List } from "immutable";
import { extractPropertiesFromObjects } from "./extractpropertiesfromobjects";

describe("extractPropertiesFromObjects", () => {
    it("returns empty array for empty list", () => {
        const result = extractPropertiesFromObjects(List());
        expect(result).toEqual([]);
    });

    it("extracts unique property names across objects", () => {
        const objs = List([{ a: 1, b: 2 }, { b: 3, c: 4 }, { d: 5 }]);
        const result = extractPropertiesFromObjects(objs);
        expect(result).toEqual(expect.arrayContaining(["a", "b", "c", "d"]));
        expect(result).toHaveLength(4);
    });

    it("ignores inherited properties", () => {
        const proto = { x: 1 };
        const child = Object.create(proto);
        (child as any).y = 2;
        const result = extractPropertiesFromObjects(List([child]));
        expect(result).toEqual(["y"]);
    });

    it("handles numeric keys (returned as strings)", () => {
        const obj = { 0: "zero", 1: "one" };
        const result = extractPropertiesFromObjects(List([obj]));
        expect(result).toEqual(expect.arrayContaining(["0", "1"]));
        expect(result).toHaveLength(2);
    });

    it("ignores symbol properties", () => {
        const sym = Symbol("s");
        const obj: any = { a: 1 };
        obj[sym] = 2;
        const result = extractPropertiesFromObjects(List([obj]));
        expect(result).toEqual(["a"]);
    });
});
