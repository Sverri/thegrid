import { DataType } from "@shared/enums";
import type { Column } from "@structure/column";

/**
 * Populates a cell element with formatted content based on the column data type.
 *
 * @param cell The DOM element representing the grid cell.
 * @param columnType The data type that determines how the value should be displayed.
 * @param cellData The raw value to render inside the cell.
 */
export function setCellContents(cell: HTMLElement, column: Column<any>, cellData: unknown): void {
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
            cell.textContent = Number(cellData).toFixed(2);
            cell.style.textAlign = "right";
            break;
        }

        case DataType.Integer: {
            cell.textContent = Number(cellData).toFixed(0);
            cell.style.textAlign = "right";
            break;
        }

        case DataType.Id: {
            cell.textContent = Number(cellData).toFixed(0);
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
            cell.textContent = new Date(cellData as Date).toDateString();
            break;
        }
    }
}
