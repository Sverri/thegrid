import { describe, expect, it } from "vitest";
import { getElementScrollDimensions } from "./getelementscrolldimensions";

describe("getElementScrollDimensions", () => {
    it("derives scroll dimensions from a plain element-like object", () => {
        const element = {
            scrollLeft: 12,
            scrollTop: 34,
            clientWidth: 200,
            clientHeight: 100,
        };

        const result = getElementScrollDimensions(element);

        expect(result).toEqual({
            scrollLeft: 12,
            scrollRight: 212,
            scrollTop: 34,
            scrollBottom: 134,
        });
    });

    it("freezes the returned dimensions object", () => {
        const element = {
            scrollLeft: 0,
            scrollTop: 0,
            clientWidth: 50,
            clientHeight: 75,
        };

        const result = getElementScrollDimensions(element);

        expect(Object.isFrozen(result)).toBe(true);
    });
});
