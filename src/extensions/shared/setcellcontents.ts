import { DataType } from "@shared/enums";
import type { Column } from "@structure/column";

interface Data {
    cell: HTMLElement;
    cellData: unknown;
    column: Column<any>;
    locale: Intl.Locale;
}

/**
 * Populates a cell element with formatted content based on the column data type.
 *
 * @param cell The DOM element representing the grid cell.
 * @param columnType The data type that determines how the value should be displayed.
 * @param cellData The raw value to render inside the cell.
 */
export function setCellContents({ cell, cellData, column, locale }: Data): void {
    if (cellData == undefined) {
        cell.textContent = "";
        return;
    }

    switch (column.dataType) {
        case DataType.Boolean: {
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.checked = cellData === true;
            checkbox.disabled = column.readonly;
            cell.append(checkbox);
            break;
        }

        case DataType.Number: {
            cell.textContent = Number(cellData).toString();
            cell.style.textAlign = "right";
            break;
        }

        case DataType.Decimal: {
            if (typeof cellData === "number") {
                const formatter =
                    column.dataFormatter ??
                    new Intl.NumberFormat(locale, {
                        maximumFractionDigits: 2,
                        minimumFractionDigits: 2,
                    });
                cell.textContent = formatter.format(cellData);
            } else {
                cell.textContent = String(cellData);
            }
            cell.style.textAlign = "right";
            break;
        }

        case DataType.Integer: {
            if (typeof cellData === "number") {
                const formatter = column.dataFormatter ?? new Intl.NumberFormat(locale, { maximumFractionDigits: 0 });
                cell.textContent = formatter.format(cellData);
            } else {
                cell.textContent = String(cellData);
            }
            cell.style.textAlign = "right";
            break;
        }

        case DataType.Id: {
            if (typeof cellData === "number") {
                const formatter = column.dataFormatter ?? new Intl.NumberFormat(locale, { maximumFractionDigits: 0 });
                cell.textContent = formatter.format(cellData);
            } else {
                cell.textContent = String(cellData);
            }
            cell.style.textAlign = "left";
            break;
        }

        case DataType.URL: {
            cell.innerHTML = `<a href="${cellData}" target="_blank" rel="noopener noreferrer">${cellData}</a>`;
            break;
        }

        case DataType.Email: {
            cell.innerHTML = `<a href="mailto:${cellData}">${cellData}</a>`;
            break;
        }
        case DataType.String:
        case DataType.Text: {
            cell.textContent = String(cellData);
            break;
        }

        case DataType.Date: {
            const formatter =
                (column.dataFormatter as Intl.DateTimeFormat) ??
                new Intl.DateTimeFormat(locale, {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                });
            if (cellData instanceof Date) {
                cell.textContent = formatter.format(cellData);
            } else {
                cell.textContent = new Date(cellData as Date).toDateString();
            }
            break;
        }
    }
}
