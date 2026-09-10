/** @vitest-environment happy-dom */

import { describe, expect, it } from "vitest";
import { DataType } from "@shared/enums";
import { createColumn } from "@structure/column";
import { setCellContents } from "./setcellcontents";

const locale = new Intl.Locale("en-US");

function createTestColumn(dataType: DataType, readonly = false) {
    return createColumn({ binding: "value", dataType, readonly });
}

describe("setCellContents", () => {
    it("clears the cell when the value is undefined", () => {
        const cell = document.createElement("div");

        setCellContents({
            cell,
            cellData: undefined,
            column: createTestColumn(DataType.String),
            locale,
        });

        expect(cell.textContent).toBe("");
    });

    it("renders boolean values as checkboxes", () => {
        const cell = document.createElement("div");

        setCellContents({
            cell,
            cellData: true,
            column: createTestColumn(DataType.Boolean),
            locale,
        });
        expect((cell.firstElementChild as HTMLInputElement).checked).toBe(true);

        cell.replaceChildren();
        setCellContents({
            cell,
            cellData: false,
            column: createTestColumn(DataType.Boolean),
            locale,
        });
        expect((cell.firstElementChild as HTMLInputElement).checked).toBe(false);
    });

    it("disables readonly boolean cells", () => {
        const cell = document.createElement("div");

        setCellContents({
            cell,
            cellData: true,
            column: createTestColumn(DataType.Boolean, true),
            locale,
        });

        expect((cell.firstElementChild as HTMLInputElement).disabled).toBe(true);
    });

    it("formats numeric data types", () => {
        const numberCell = document.createElement("div");
        const decimalCell = document.createElement("div");
        const integerCell = document.createElement("div");
        const idCell = document.createElement("div");

        setCellContents({
            cell: numberCell,
            cellData: "12.5",
            column: createTestColumn(DataType.Number),
            locale,
        });
        expect(numberCell.textContent).toBe("12.5");
        expect(numberCell.style.textAlign).toBe("right");

        setCellContents({
            cell: decimalCell,
            cellData: 12.345,
            column: createTestColumn(DataType.Decimal),
            locale,
        });
        expect(decimalCell.textContent).toBe("12.35");

        setCellContents({
            cell: integerCell,
            cellData: 12.9,
            column: createTestColumn(DataType.Integer),
            locale,
        });
        expect(integerCell.textContent).toBe("13");

        setCellContents({
            cell: decimalCell,
            cellData: "12.345",
            column: createTestColumn(DataType.Decimal),
            locale,
        });
        expect(decimalCell.textContent).toBe("12.345");

        setCellContents({
            cell: integerCell,
            cellData: "12.9",
            column: createTestColumn(DataType.Integer),
            locale,
        });
        expect(integerCell.textContent).toBe("12.9");

        setCellContents({
            cell: idCell,
            cellData: 1234,
            column: createTestColumn(DataType.Id),
            locale,
        });
        expect(idCell.textContent).toBe("1,234");
        expect(idCell.style.textAlign).toBe("left");

        setCellContents({
            cell: idCell,
            cellData: "abc",
            column: createTestColumn(DataType.Id),
            locale,
        });
        expect(idCell.textContent).toBe("abc");
    });

    it("renders string-like data types as plain text", () => {
        const textCell = document.createElement("div");
        const urlCell = document.createElement("div");
        const emailCell = document.createElement("div");

        setCellContents({
            cell: textCell,
            cellData: "hello world",
            column: createTestColumn(DataType.String),
            locale,
        });
        expect(textCell.textContent).toBe("hello world");

        setCellContents({
            cell: textCell,
            cellData: "hello world",
            column: createTestColumn(DataType.Text),
            locale,
        });
        expect(textCell.textContent).toBe("hello world");

        setCellContents({
            cell: urlCell,
            cellData: "https://example.com",
            column: createTestColumn(DataType.URL),
            locale,
        });
        expect(urlCell.textContent).toBe("https://example.com");

        setCellContents({
            cell: emailCell,
            cellData: "user@example.com",
            column: createTestColumn(DataType.Email),
            locale,
        });
        expect(emailCell.textContent).toBe("user@example.com");
    });

    it("formats dates as date strings", () => {
        const cell = document.createElement("div");
        const date = new Date("2025-02-03T00:00:00Z");

        setCellContents({
            cell,
            cellData: date,
            column: createTestColumn(DataType.Date),
            locale,
        });

        expect(cell.textContent).toBe(
            new Intl.DateTimeFormat(locale, {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
            }).format(date),
        );

        setCellContents({
            cell,
            cellData: "2025-02-03T00:00:00Z",
            column: createTestColumn(DataType.Date),
            locale,
        });
        expect(cell.textContent).toBe(new Date("2025-02-03T00:00:00Z").toDateString());
    });

    it("uses custom number and date formatters", () => {
        const numberCell = document.createElement("div");
        const dateCell = document.createElement("div");

        setCellContents({
            cell: numberCell,
            cellData: 12.345,
            column: createColumn({
                binding: "value",
                dataType: DataType.Decimal,
                dataFormatter: new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }),
            }),
            locale,
        });
        expect(numberCell.textContent).toBe("12.3");

        setCellContents({
            cell: dateCell,
            cellData: new Date("2025-02-03T00:00:00Z"),
            column: createColumn({
                binding: "value",
                dataType: DataType.Date,
                dataFormatter: new Intl.DateTimeFormat(locale, { year: "numeric" }),
            }),
            locale,
        });
        expect(dateCell.textContent).toBe("2025");
    });
});
