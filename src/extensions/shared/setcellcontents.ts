import { DataType } from "@/shared/enums";

/**
 * Populates a cell element with formatted content based on the column data type.
 *
 * @param cell The DOM element representing the grid cell.
 * @param columnType The data type that determines how the value should be displayed.
 * @param cellData The raw value to render inside the cell.
 */
export function setCellContents(cell: HTMLElement, columnType: DataType, cellData: unknown): void {
    if (cellData == undefined) {
        cell.textContent = "";
        return;
    }

    switch (columnType) {
        case DataType.Boolean: {
            cell.textContent = String(cellData === true);
            break;
        }

        case DataType.Decimal: {
            cell.textContent = Number(cellData).toFixed(2);
            break;
        }

        case DataType.Integer: {
            cell.textContent = Number(cellData).toFixed(0);
            break;
        }

        case DataType.String:
        case DataType.Text:
        case DataType.URL:
        case DataType.Email: {
            cell.textContent = String(cellData);
            break;
        }

        case DataType.Date: {
            cell.textContent = new Date(cellData as Date).toDateString();
            break;
        }
    }
}
