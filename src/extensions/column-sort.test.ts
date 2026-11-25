/** @vitest-environment happy-dom */

import { describe, expect, it } from "vitest";
import { columnSortExtension } from "./column-sort";
import { createColumn } from "@grid/column";
import { SortDirection } from "@shared/enums";

type Row = { a: string; b: string; c: string };

function createGrid() {
    const columns = (["a", "b", "c"] as const).map(binding => createColumn<Row>({ binding }));
    const columnHeadersElement = document.createElement("div");
    const headers = columns.map((_, index) => {
        const cell = document.createElement("div");
        cell.className = "thegrid-cell thegrid-cell-column-header";
        cell.dataset["column"] = String(index);
        cell.dataset["row"] = "0";
        const resizer = document.createElement("div");
        resizer.className = "thegrid-column-resizer";
        cell.append(resizer);
        columnHeadersElement.append(cell);
        return cell;
    });
    const grid = { columnHeadersElement, columns: { items: columns } };
    return { grid, columns, headers };
}

function click(element: Element, options: MouseEventInit = {}) {
    element.dispatchEvent(new MouseEvent("click", { bubbles: true, button: 0, ...options }));
}

const directions = (columns: { sortDirection: SortDirection | undefined }[]) =>
    columns.map(column => column.sortDirection);

describe("columnSortExtension", () => {
    it("cycles a column through ascending, descending and unsorted", () => {
        const { grid, columns, headers } = createGrid();
        columnSortExtension(grid as any);

        click(headers[1]!);
        expect(columns[1]!.sortDirection).toBe(SortDirection.Ascending);
        click(headers[1]!);
        expect(columns[1]!.sortDirection).toBe(SortDirection.Descending);
        click(headers[1]!);
        expect(columns[1]!.sortDirection).toBeUndefined();
    });

    it("sorts by the clicked column only, without Ctrl", () => {
        const { grid, columns, headers } = createGrid();
        columns[0]!.sortDirection = SortDirection.Ascending;
        columns[2]!.sortDirection = SortDirection.Descending;
        columnSortExtension(grid as any);

        click(headers[1]!);

        expect(directions(columns)).toEqual([undefined, SortDirection.Ascending, undefined]);
    });

    it("continues the clicked column's cycle when other columns are cleared", () => {
        const { grid, columns, headers } = createGrid();
        columns[0]!.sortDirection = SortDirection.Ascending;
        columns[1]!.sortDirection = SortDirection.Ascending;
        columnSortExtension(grid as any);

        click(headers[1]!);

        expect(directions(columns)).toEqual([undefined, SortDirection.Descending, undefined]);
    });

    it.each(["ctrlKey", "metaKey"])("keeps the other sorted columns with %s", key => {
        const { grid, columns, headers } = createGrid();
        columnSortExtension(grid as any);

        click(headers[2]!);
        click(headers[0]!, { [key]: true });
        expect(directions(columns)).toEqual([SortDirection.Ascending, undefined, SortDirection.Ascending]);

        click(headers[2]!, { [key]: true });
        click(headers[2]!, { [key]: true });
        expect(directions(columns)).toEqual([SortDirection.Ascending, undefined, undefined]);
    });

    it.each([{}, { ctrlKey: true }])("ignores clicks on columns that do not allow sorting (%o)", options => {
        const { grid, columns, headers } = createGrid();
        columns[0]!.sortDirection = SortDirection.Ascending;
        columns[1]!.allowSorting = false;
        columnSortExtension(grid as any);

        click(headers[1]!, options);

        expect(directions(columns)).toEqual([SortDirection.Ascending, undefined, undefined]);
    });

    it("clears the sorting of columns that do not allow sorting on a plain click", () => {
        const { grid, columns, headers } = createGrid();
        columns[0]!.allowSorting = false;
        columns[0]!.sortDirection = SortDirection.Ascending;
        columnSortExtension(grid as any);

        click(headers[1]!, { ctrlKey: true });
        expect(directions(columns)).toEqual([SortDirection.Ascending, SortDirection.Ascending, undefined]);

        click(headers[1]!);
        expect(directions(columns)).toEqual([undefined, SortDirection.Descending, undefined]);
    });

    it("ignores clicks on the resize handle", () => {
        const { grid, columns, headers } = createGrid();
        columnSortExtension(grid as any);

        click(headers[0]!.querySelector(".thegrid-column-resizer")!);

        expect(columns[0]!.sortDirection).toBeUndefined();
    });

    it("ignores clicks outside a column header, and on filler headers", () => {
        const { grid, columns } = createGrid();
        const filler = document.createElement("div");
        filler.className = "thegrid-cell thegrid-cell-filler";
        grid.columnHeadersElement.append(filler);
        columnSortExtension(grid as any);

        click(grid.columnHeadersElement);
        click(filler);

        expect(directions(columns)).toEqual([undefined, undefined, undefined]);
    });

    it("ignores headers of unknown columns", () => {
        const { grid, columns, headers } = createGrid();
        headers[0]!.dataset["column"] = "9";
        columnSortExtension(grid as any);

        click(headers[0]!);

        expect(directions(columns)).toEqual([undefined, undefined, undefined]);
    });

    it("ignores non-primary buttons", () => {
        const { grid, columns, headers } = createGrid();
        columnSortExtension(grid as any);

        click(headers[0]!, { button: 1 });

        expect(columns[0]!.sortDirection).toBeUndefined();
    });

    it("removes its listener when disposed", () => {
        const { grid, columns, headers } = createGrid();
        const dispose = columnSortExtension(grid as any);

        dispose();
        click(headers[0]!);

        expect(columns[0]!.sortDirection).toBeUndefined();
    });
});
