/** @vitest-environment happy-dom */

import { describe, expect, it } from "vitest";
import { CellType } from "@shared/enums";
import { createCell } from "./createcell";

describe("createCell", () => {
    it("creates a standard cell with the expected dataset and inline styles", () => {
        const cell = createCell({
            type: CellType.Cell,
            width: 120,
            height: 40,
            columnIndex: 2,
            rowIndex: 7,
            left: 15,
            top: 25,
        });

        expect(cell.tagName).toBe("DIV");
        expect(cell.classList.contains("thegrid-cell")).toBe(true);
        expect(cell.dataset["column"]).toBe("2");
        expect(cell.dataset["row"]).toBe("7");
        expect(cell.style.width).toBe("120px");
        expect(cell.style.height).toBe("40px");
        expect(cell.style.transform).toBe("translate(15px, 25px)");
        expect(cell.classList.contains("thegrid-cell-column-header")).toBe(false);
        expect(cell.classList.contains("thegrid-cell-row-header")).toBe(false);
        expect(cell.classList.contains("thegrid-cell-top-left")).toBe(false);
    });

    it("marks column, row, and top-left header cells with the correct classes", () => {
        const columnHeader = createCell({
            type: CellType.ColumnHeader,
            width: 80,
            height: 20,
            columnIndex: 1,
            rowIndex: 0,
            left: 5,
            top: 0,
        });
        const rowHeader = createCell({
            type: CellType.RowHeader,
            width: 20,
            height: 20,
            columnIndex: 0,
            rowIndex: 3,
            left: 0,
            top: 55,
        });
        const topLeft = createCell({
            type: CellType.TopLeft,
            width: 20,
            height: 20,
            columnIndex: 0,
            rowIndex: 0,
            left: 0,
            top: 0,
        });

        expect(columnHeader.classList.contains("thegrid-cell-column-header")).toBe(true);
        expect(rowHeader.classList.contains("thegrid-cell-row-header")).toBe(true);
        expect(topLeft.classList.contains("thegrid-cell-top-left")).toBe(true);
    });
});
