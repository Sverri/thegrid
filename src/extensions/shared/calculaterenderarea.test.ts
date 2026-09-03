import type { Grid } from "@grid/grid";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getElementScrollDimensions, type ElementScrollDimensions } from "@helpers/getelementscrolldimensions";
import { calculateRenderArea } from "./calculaterenderarea";

vi.mock("@helpers/getelementscrolldimensions", () => ({
    getElementScrollDimensions: vi.fn(),
}));

const getElementScrollDimensionsMock = vi.mocked(getElementScrollDimensions);

type TestColumn = {
    visible: boolean;
    fromLeft: number;
    width: number;
};

function createGrid(columns: TestColumn[], rowCount: number, cellSize = 25) {
    return {
        columns: { items: columns },
        source: Array.from({ length: rowCount }, () => ({})),
        cellSize,
        cellsElement: {},
    } as unknown as Grid<Record<string, never>>;
}

function mockScrollDimensions(value: ElementScrollDimensions) {
    getElementScrollDimensionsMock.mockReturnValue(value);
}

describe("calculateRenderArea", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("calculates the visible rows and columns", () => {
        const grid = createGrid(
            [
                { visible: true, fromLeft: 0, width: 100 },
                { visible: true, fromLeft: 100, width: 120 },
                { visible: true, fromLeft: 220, width: 120 },
                { visible: true, fromLeft: 340, width: 100 },
            ],
            20,
        );
        mockScrollDimensions({ scrollLeft: 120, scrollRight: 279, scrollTop: 50, scrollBottom: 99 });

        const result = calculateRenderArea(grid, { columns: 0, rows: 0 });

        expect(result).toEqual(expect.objectContaining({ x1: 1, y1: 2, x2: 2, y2: 3 }));
    });

    it("includes render-ahead rows and columns and clamps them to the grid", () => {
        const grid = createGrid(
            [
                { visible: true, fromLeft: 0, width: 100 },
                { visible: true, fromLeft: 100, width: 100 },
                { visible: true, fromLeft: 200, width: 100 },
            ],
            5,
        );
        mockScrollDimensions({ scrollLeft: 0, scrollRight: 100, scrollTop: 0, scrollBottom: 25 });

        const result = calculateRenderArea(grid, { columns: 2, rows: 3 });

        expect(result).toEqual(expect.objectContaining({ x1: 0, y1: 0, x2: 2, y2: 4 }));
    });

    it("skips hidden columns while preserving their collection indexes", () => {
        const grid = createGrid(
            [
                { visible: true, fromLeft: 0, width: 100 },
                { visible: false, fromLeft: 100, width: 100 },
                { visible: true, fromLeft: 200, width: 100 },
            ],
            3,
        );
        mockScrollDimensions({ scrollLeft: 150, scrollRight: 250, scrollTop: 0, scrollBottom: 25 });

        const result = calculateRenderArea(grid, { columns: 0, rows: 0 });

        expect(result).toEqual(expect.objectContaining({ x1: 2, x2: 2, y1: 0, y2: 1 }));
    });

    it("uses floor-based row indexes for partially visible rows", () => {
        const grid = createGrid([{ visible: true, fromLeft: 0, width: 100 }], 10, 30);
        mockScrollDimensions({ scrollLeft: 0, scrollRight: 100, scrollTop: 45, scrollBottom: 74 });

        const result = calculateRenderArea(grid, { columns: 0, rows: 0 });

        expect(result).toEqual(expect.objectContaining({ y1: 1, y2: 2 }));
    });

    it("returns an empty row range when the source is empty", () => {
        const grid = createGrid([{ visible: true, fromLeft: 0, width: 100 }], 0);
        mockScrollDimensions({ scrollLeft: 0, scrollRight: 100, scrollTop: 0, scrollBottom: 100 });

        const result = calculateRenderArea(grid, { columns: 0, rows: 0 });

        expect(result).toEqual(expect.objectContaining({ x1: 0, x2: 0, y1: -1, y2: -1 }));
    });
});
