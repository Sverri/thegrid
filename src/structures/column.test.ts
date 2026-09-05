import { describe, expect, it } from "vitest";
import { DataType } from "@shared/enums";
import { columnFromLeft, createColumn, isColumn } from "./column";

type Row = {
    name: string;
    amount: number;
};

describe("createColumn", () => {
    it("uses defaults for optional settings", () => {
        const column = createColumn<Row>({ binding: "name" });

        expect(column.binding).toBe("name");
        expect(column.header).toBe("name");
        expect(column.dataType).toBe(DataType.String);
        expect(column.width).toBe(100);
        expect(column.minWidth).toBe(1);
        expect(column.maxWidth).toBe(999999);
        expect(column.visible).toBe(true);
    });

    it("preserves custom settings and clamps the initial width", () => {
        const column = createColumn<Row>({
            binding: "amount",
            header: "Amount",
            dataType: DataType.Currency,
            width: 500,
            minWidth: 100,
            maxWidth: 300,
            visible: false,
        });

        expect(column.header).toBe("Amount");
        expect(column.dataType).toBe(DataType.Currency);
        expect(column.width).toBe(300);
        expect(column.minWidth).toBe(100);
        expect(column.maxWidth).toBe(300);
        expect(column.visible).toBe(false);
    });

    it("clamps width assignments between the current bounds", () => {
        const column = createColumn<Row>({ binding: "name", width: 50, minWidth: 25, maxWidth: 200 });

        column.width = 125;
        expect(column.width).toBe(125);

        column.width = 10;
        expect(column.width).toBe(25);

        column.width = 250;
        expect(column.width).toBe(200);
    });

    it("updates binding, header, data type, and visibility through their setters", () => {
        const column = createColumn<Row>({ binding: "name" });

        column.binding = "amount";
        column.header = "Amount";
        column.dataType = DataType.Currency;
        column.visible = false;

        expect(column.binding).toBe("amount");
        expect(column.header).toBe("Amount");
        expect(column.dataType).toBe(DataType.Currency);
        expect(column.visible).toBe(false);
    });

    it("keeps width valid when minimum or maximum changes", () => {
        const column = createColumn<Row>({ binding: "name", width: 180, minWidth: 25, maxWidth: 200 });

        column.minWidth = 125;
        expect(column.width).toBe(180);

        column.maxWidth = 150;
        expect(column.width).toBe(150);
        expect(column.minWidth).toBe(125);
    });

    it("rejects invalid bindings and incompatible width bounds", () => {
        expect(() => createColumn<Row>({ binding: "" as "name" })).toThrow("The binding must be a non-empty string");
        expect(() => createColumn<Row>({ binding: "name", minWidth: 20, maxWidth: 10 })).toThrow(
            "The minWidth and maxWidth options",
        );

        const column = createColumn<Row>({ binding: "name" });
        expect(() => {
            column.binding = "" as "name";
        }).toThrow("Invalid binding");
        expect(() => {
            column.minWidth = 1000000;
        }).toThrow("minWidth cannot be greater than maxWidth");
        expect(() => {
            column.maxWidth = 0;
        }).toThrow("maxWidth cannot be less than minWidth");
    });
});

describe("columnFromLeft", () => {
    it("sums only visible columns before the target", () => {
        const columns = [
            createColumn<Row>({ binding: "name", width: 100 }),
            createColumn<Row>({ binding: "amount", width: 50, visible: false }),
            createColumn<Row>({ binding: "name", width: 75 }),
        ];

        expect(columnFromLeft(columns, 0)).toBe(0);
        expect(columnFromLeft(columns, 1)).toBe(100);
        expect(columnFromLeft(columns, 2)).toBe(100);
    });

    it("rejects indexes outside the collection", () => {
        const columns = [createColumn<Row>({ binding: "name" })];

        expect(() => columnFromLeft(columns, -1)).toThrow("Invalid column index");
        expect(() => columnFromLeft(columns, 1)).toThrow("Invalid column index");
        expect(() => columnFromLeft([], 0)).toThrow("Invalid column index");
    });
});

describe("isColumn", () => {
    it("recognizes column instances and rejects other objects", () => {
        const column = createColumn<Row>({ binding: "name" });

        expect(isColumn(column)).toBe(true);
        expect(isColumn({ binding: "name" })).toBe(false);
        expect(isColumn(null)).toBe(false);
        expect(isColumn(123)).toBe(false);
    });
});
