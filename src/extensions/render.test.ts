/** @vitest-environment happy-dom */

import { beforeEach, describe, expect, it, vi } from "vitest";
import { getElementScrollDimensions, type ElementScrollDimensions } from "@helpers/getelementscrolldimensions";
import { calculateRenderArea } from "@extension/shared/calculaterenderarea";
import { createRange } from "@structure/range";
import { DataType, HeaderSelection } from "@shared/enums";
import { renderExtension } from "./render";

vi.mock("@helpers/getelementscrolldimensions", () => ({
    getElementScrollDimensions: vi.fn(),
}));

vi.mock("@extension/shared/calculaterenderarea", () => ({
    calculateRenderArea: vi.fn(),
}));

const getElementScrollDimensionsMock = vi.mocked(getElementScrollDimensions);
const calculateRenderAreaMock = vi.mocked(calculateRenderArea);

interface TestColumn {
    visible: boolean;
    width: number;
    header: string;
    dataType: DataType;
}

function createGrid(columns: TestColumn[], showHeaderSelection: HeaderSelection) {
    let invalidateCallback: (() => void) | undefined;
    const cellsElement = document.createElement("div");
    const columnHeadersElement = document.createElement("div");
    const rowHeadersElement = document.createElement("div");
    const subscribe = vi.fn((callback: () => void) => {
        invalidateCallback = callback;
    });

    return {
        grid: {
            cellsElement,
            columnHeadersElement,
            rowHeadersElement,
            cellSize: 20,
            columns: { items: columns },
            data: { size: 4 },
            selection: { range: createRange(0, 0, 0, 0) },
            showHeaderSelection,
            getCellData: vi.fn(() => "value"),
            onInvalidate: { subscribe },
        },
        cellsElement,
        columnHeadersElement,
        rowHeadersElement,
        subscribe,
        invalidate: () => invalidateCallback?.(),
    };
}

function mockRenderArea(range = createRange(0, 0, 0, 1)) {
    calculateRenderAreaMock.mockReturnValue(range);
    const dimensions: ElementScrollDimensions = {
        scrollLeft: 5,
        scrollRight: 105,
        scrollTop: 7,
        scrollBottom: 107,
    };
    getElementScrollDimensionsMock.mockReturnValue(dimensions);
}

describe("renderExtension", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders cells and column headers through the invalidate callback", () => {
        const { grid, cellsElement, columnHeadersElement, rowHeadersElement, subscribe, invalidate } = createGrid(
            [{ visible: true, width: 100, header: "Name", dataType: DataType.String }],
            HeaderSelection.Both,
        );
        mockRenderArea(createRange(0, 0, 1, 1));

        renderExtension(grid as any);
        invalidate();

        expect(cellsElement.classList.contains("thegrid-enable-zebra")).toBe(true);
        expect(subscribe).toHaveBeenCalledTimes(1);
        expect(cellsElement.children.length).toBe(2);
        expect(cellsElement.firstElementChild?.classList.contains("row-even")).toBe(true);
        expect(cellsElement.firstElementChild?.classList.contains("selection")).toBe(true);
        expect(cellsElement.firstElementChild?.classList.contains("selection-current")).toBe(true);
        expect(columnHeadersElement.children.length).toBe(1);
        expect(columnHeadersElement.firstElementChild?.classList.contains("column-selected")).toBe(true);
        expect(columnHeadersElement.firstElementChild?.textContent).toBe("Name");
        expect(rowHeadersElement.children.length).toBe(2);
    });

    it("marks selected row headers when row selection is enabled", () => {
        const { grid, rowHeadersElement, invalidate } = createGrid(
            [{ visible: true, width: 100, header: "Name", dataType: DataType.String }],
            HeaderSelection.Rows,
        );
        mockRenderArea();

        renderExtension(grid as any);
        invalidate();

        expect(rowHeadersElement.firstElementChild?.classList.contains("row-selected")).toBe(true);
        expect(rowHeadersElement.lastElementChild?.classList.contains("row-selected")).toBe(false);
    });

    it("clears row headers without rendering rows when there are no columns", () => {
        const { grid, rowHeadersElement, invalidate } = createGrid([], HeaderSelection.Both);
        rowHeadersElement.append(document.createElement("div"));
        mockRenderArea(createRange(-1, 0, -1, 1));

        renderExtension(grid as any);
        invalidate();

        expect(rowHeadersElement.children.length).toBe(0);
    });
});
