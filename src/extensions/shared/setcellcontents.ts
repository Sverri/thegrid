import { DataType } from "@shared/enums";
import type { Column } from "@structure/column";

interface Data {
    cell: HTMLElement;
    cellData: unknown;
    column: Column<any>;
    locale: Intl.Locale;
}

function createLink(text: string, href: string): HTMLAnchorElement {
    const link = document.createElement("a");
    link.href = href;
    link.textContent = text;
    return link;
}

/**
 * Returns the value as a URL string if it is an absolute http(s) URL, otherwise `undefined`.
 */
function safeHttpUrl(value: string): string | undefined {
    try {
        const url = new URL(value);
        return url.protocol === "http:" || url.protocol === "https:" ? url.href : undefined;
    } catch {
        return undefined;
    }
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

        case DataType.Decimal:
        case DataType.Currency: {
            const value = typeof cellData === "number" ? cellData : Number(cellData);
            if (cellData !== "" && Number.isFinite(value)) {
                const formatter = new Intl.NumberFormat(locale, {
                    maximumFractionDigits: 2,
                    minimumFractionDigits: 2,
                });
                cell.textContent = formatter.format(value);
            } else {
                cell.textContent = String(cellData);
            }
            cell.style.textAlign = "right";
            break;
        }

        case DataType.Integer: {
            if (typeof cellData === "number") {
                const formatter = new Intl.NumberFormat(locale, { maximumFractionDigits: 0 });
                cell.textContent = formatter.format(cellData);
            } else {
                cell.textContent = String(cellData);
            }
            cell.style.textAlign = "right";
            break;
        }

        case DataType.Id: {
            if (typeof cellData === "number") {
                const formatter = new Intl.NumberFormat(locale, { maximumFractionDigits: 0 });
                cell.textContent = formatter.format(cellData);
            } else {
                cell.textContent = String(cellData);
            }
            cell.style.textAlign = "left";
            break;
        }

        case DataType.URL: {
            const text = String(cellData);
            const href = safeHttpUrl(text);
            if (href) {
                const link = createLink(text, href);
                link.target = "_blank";
                link.rel = "noopener noreferrer";
                cell.replaceChildren(link);
            } else {
                cell.textContent = text;
            }
            break;
        }

        case DataType.Email: {
            const text = String(cellData);
            cell.replaceChildren(createLink(text, `mailto:${text}`));
            break;
        }
        case DataType.String:
        case DataType.Text: {
            cell.textContent = String(cellData);
            break;
        }

        case DataType.Date: {
            const formatter = new Intl.DateTimeFormat(locale, {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
            });
            const date =
                cellData instanceof Date
                    ? cellData
                    : typeof cellData === "string" || typeof cellData === "number"
                      ? new Date(cellData)
                      : undefined;
            if (date && !Number.isNaN(date.getTime())) {
                cell.textContent = formatter.format(date);
            } else {
                cell.textContent = String(cellData);
            }
            break;
        }

        default: {
            cell.textContent = String(cellData);
            break;
        }
    }
}
