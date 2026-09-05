/** @vitest-environment happy-dom */

import { describe, expect, it } from "vitest";
import { createColumn } from "@structure/column";
import { createRange } from "@structure/range";
import { renderCellSelection } from "./renderselection";

type Row = { id: number };

describe("renderCellSelection", () => {
    const columns = [
        createColumn<Row>({ binding: "id" }),
        createColumn<Row>({ binding: "id" }),
        createColumn<Row>({ binding: "id" }),
    ];

    it("adds the selection class to cells inside the current range", () => {
        const cell = document.createElement("div");
        const selection = createRange(1, 1, 2, 2);

        renderCellSelection(cell, selection, columns, 1, 1);

        expect(cell.classList.contains("selection")).toBe(true);
        expect(cell.classList.contains("selection-current")).toBe(false);
    });

    it("adds the right-edge border class for cells on the selection boundary", () => {
        const previousCell = document.createElement("div");
        const endCell = document.createElement("div");
        const selection = createRange(1, 1, 2, 2);

        renderCellSelection(previousCell, selection, columns, 0, 1);
        renderCellSelection(endCell, selection, columns, 2, 1);

        expect(previousCell.classList.contains("selection-right-border")).toBe(true);
        expect(endCell.classList.contains("selection-right-border")).toBe(true);
    });

    it("adds the bottom-edge border and current-cell marker at the selection end", () => {
        const bottomBorderCell = document.createElement("div");
        const currentCell = document.createElement("div");
        const selection = createRange(1, 1, 2, 2);

        renderCellSelection(bottomBorderCell, selection, columns, 1, 0);
        renderCellSelection(currentCell, selection, columns, 2, 2);

        expect(bottomBorderCell.classList.contains("selection-bottom-border")).toBe(true);
        expect(currentCell.classList.contains("selection-current")).toBe(true);
        expect(currentCell.classList.contains("selection-bottom-border")).toBe(true);
    });
});
