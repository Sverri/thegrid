/** @vitest-environment happy-dom */

import { describe, expect, it } from "vitest";
import { DataType } from "@shared/enums";
import { setCellContents } from "./setcellcontents";

describe("setCellContents", () => {
    it("clears the cell when the value is undefined", () => {
        const cell = document.createElement("div");

        setCellContents(cell, DataType.String, undefined);

        expect(cell.textContent).toBe("");
    });

    it("formats boolean values as strings", () => {
        const cell = document.createElement("div");

        setCellContents(cell, DataType.Boolean, true);
        expect(cell.textContent).toBe("true");

        setCellContents(cell, DataType.Boolean, false);
        expect(cell.textContent).toBe("false");
    });

    it("formats decimal and integer values with fixed precision", () => {
        const decimalCell = document.createElement("div");
        const integerCell = document.createElement("div");

        setCellContents(decimalCell, DataType.Decimal, 12.345);
        expect(decimalCell.textContent).toBe("12.35");

        setCellContents(integerCell, DataType.Integer, 12.9);
        expect(integerCell.textContent).toBe("13");
    });

    it("renders string-like data types as plain text", () => {
        const textCell = document.createElement("div");
        const urlCell = document.createElement("div");
        const emailCell = document.createElement("div");

        setCellContents(textCell, DataType.String, "hello world");
        expect(textCell.textContent).toBe("hello world");

        setCellContents(textCell, DataType.Text, "hello world");
        expect(textCell.textContent).toBe("hello world");

        setCellContents(urlCell, DataType.URL, "https://example.com");
        expect(urlCell.textContent).toBe("https://example.com");

        setCellContents(emailCell, DataType.Email, "user@example.com");
        expect(emailCell.textContent).toBe("user@example.com");
    });

    it("formats dates as date strings", () => {
        const cell = document.createElement("div");
        const date = new Date("2025-02-03T00:00:00Z");

        setCellContents(cell, DataType.Date, date);

        expect(cell.textContent).toBe(date.toDateString());
    });
});
