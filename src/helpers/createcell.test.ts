// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { createCell } from "./createcell";
import { CellType } from "../shared/enums";

describe("createCell", () => {
    it("creates a basic cell with correct dataset and class", () => {
        const el = createCell(CellType.Cell, 3, 2);
        expect(el.tagName.toLowerCase()).toBe("div");
        expect(el.classList.contains("thegrid-cell")).toBe(true);
        expect(el.dataset.row).toBe("2");
        expect(el.dataset.column).toBe("3");
        expect(el.classList.contains("thegrid-cell-column-header")).toBe(false);
        expect(el.classList.contains("thegrid-cell-row-header")).toBe(false);
        expect(el.classList.contains("thegrid-cell-top-left")).toBe(false);
    });

    it("adds column header class for ColumnHeader type", () => {
        const el = createCell(CellType.ColumnHeader, 0, 0);
        expect(el.classList.contains("thegrid-cell-column-header")).toBe(true);
        expect(el.classList.contains("thegrid-cell-row-header")).toBe(false);
        expect(el.classList.contains("thegrid-cell-top-left")).toBe(false);
    });

    it("adds row header class for RowHeader type", () => {
        const el = createCell(CellType.RowHeader, 1, 1);
        expect(el.classList.contains("thegrid-cell-row-header")).toBe(true);
        expect(el.classList.contains("thegrid-cell-column-header")).toBe(false);
        expect(el.classList.contains("thegrid-cell-top-left")).toBe(false);
    });

    it("adds top-left class for TopLeft type", () => {
        const el = createCell(CellType.TopLeft, 0, 0);
        expect(el.classList.contains("thegrid-cell-top-left")).toBe(true);
        expect(el.classList.contains("thegrid-cell-column-header")).toBe(false);
        expect(el.classList.contains("thegrid-cell-row-header")).toBe(false);
    });
});
