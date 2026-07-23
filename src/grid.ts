import { createGridInstance, getColumns, GRID_HTML, type TheGrid, type TheGridOptions } from "@/parts/grid";
import { transformColumnsToOptions, createColumns, type ColumnOptions } from "@/parts/column";
import { createSource } from "@/parts/source";
import { debounce } from "throttle-debounce";
import { List as ImmutableList } from "immutable";
import { getElementScrollDimensions } from "@/helpers/getelementscrolldimensions";
import { keyboardExtension } from "@/extensions/keyboard";
import { mouseExtension } from "@/extensions/mouse";
import { resizeObserverExtension } from "@/extensions/resizeobserver";
import { renderExtension } from "@/extensions/render";
import { expanderExtension } from "@/extensions/expander";
import { createEvent } from "@/shared/event";
import { createRange } from "@/parts/range";
import { createSelection, type Selection } from "@/parts/selection";

export function createGrid<T extends Record<string, any>>(
    hostElement: HTMLElement,
    options?: TheGridOptions<T>,
): Immutable.RecordOf<TheGrid<T>> {
    hostElement.innerHTML = GRID_HTML;
    hostElement.classList.add("thegrid");
    hostElement.style.setProperty("width", "100%");
    hostElement.style.setProperty("height", "100%");

    const instance = {} as TheGrid<T>;
    const cellsElement = hostElement.querySelector<HTMLDivElement>(".thegrid-area-cells");
    if (!cellsElement) {
        throw new Error("Could not find cells element");
    }
    const columnHeadersElement = hostElement.querySelector<HTMLDivElement>(".thegrid-area-columnheaders");
    if (!columnHeadersElement) {
        throw new Error("Could not find column headers element");
    }
    const rowHeadersElement = hostElement.querySelector<HTMLDivElement>(".thegrid-area-rowheaders");
    if (!rowHeadersElement) {
        throw new Error("Could not find row headers element");
    }
    let columns = createColumns(getColumns(options?.columns));
    let source = createSource<T>(ImmutableList(options?.data ?? []), columns.items);
    let selection = createSelection(createRange(-1, -1), instance);
    const cellSize = Number.parseInt(window.getComputedStyle(hostElement).getPropertyValue("--cell-size"), 10);
    const onInvalidate = createEvent<() => void>();

    const debouncedInvalidate = debounce(100, () => {
        onInvalidate.raise();
    });

    const invalidate = (immediately = false) => {
        if (immediately) {
            onInvalidate.raise();
        } else {
            debouncedInvalidate();
        }
    };

    /**
     * Update the columns
     *
     * The callback receives the current immutable columns and must return
     * a new immutable columns.
     *
     * @param callback A function that receives the current columns and returns new columns.
     */
    const updateColumns = (
        callback: (
            columns: ImmutableList<Immutable.RecordOf<ColumnOptions<T>>>,
        ) => ImmutableList<Immutable.RecordOf<ColumnOptions<T>>>,
    ): void => {
        const options = transformColumnsToOptions(columns);
        const newOptions = callback(options);
        columns = createColumns(newOptions);
        Object.assign(instance, { columns });
        invalidate();
    };

    /**
     * Update the source
     *
     * The callback receives the current immutable source and must return
     * a new immutable source.
     *
     * @param callback A function that receives the current source and returns a new source.
     */
    const updateSource = (
        callback: (source: ImmutableList<Immutable.RecordOf<T>>) => ImmutableList<Immutable.RecordOf<T>>,
    ) => {
        const newSource = callback(source.items);
        source = createSource(newSource, columns.items);
        Object.assign(instance, { source });
        invalidate();
    };

    /**
     * Update the selection
     *
     * The callback receives the current immutable selection and must return
     * a new immutable selection.
     *
     * @param callback A function that receives the current selection and returns a new selection.
     */
    const updateSelection = (callback: (source: Immutable.RecordOf<Selection>) => Immutable.RecordOf<Selection>) => {
        const newSelection = callback(selection);
        selection = createSelection(newSelection.range, instance);
        Object.assign(instance, { selection });
        invalidate(true);
    };

    const scrollIntoView = debounce(64, (columnIndex: number, rowIndex: number) => {
        const { scrollLeft, scrollRight, scrollTop, scrollBottom } = getElementScrollDimensions(cellsElement);
        const column = columns.items.get(columnIndex)!;

        let left = scrollLeft;
        const columnStart = column.fromLeft;
        const columnEnd = columnStart + column.width;
        if (columnStart < scrollLeft) {
            left = columnStart;
        } else if (columnEnd > scrollRight) {
            left = scrollLeft + (columnEnd - scrollRight);
        }

        let top = scrollTop;
        const rowStart = rowIndex * cellSize;
        const rowEnd = rowStart + cellSize;
        if (rowStart < scrollTop) {
            top = rowStart;
        } else if (rowEnd > scrollBottom) {
            top = scrollTop + (rowEnd - scrollBottom);
        }

        cellsElement.scrollTo({ left, top, behavior: "instant" });
    });

    const getCellData = <DT>(columnIndex: number, rowIndex: number): DT | undefined => {
        const row = source.items.get(rowIndex);
        if (!row) {
            return undefined;
        }
        const column = columns.items.get(columnIndex);
        if (!column) {
            return undefined;
        }
        return row[column.binding];
    };

    const extend = (callback: (grid: TheGrid<T>) => void): void => {
        callback(instance);
    };

    Object.assign(instance, {
        hostElement,
        cellsElement,
        columnHeadersElement,
        rowHeadersElement,
        invalidate,
        updateColumns,
        updateSource,
        updateSelection,
        scrollIntoView,
        getCellData,
        extend,
        columns,
        source,
        selection,
        cellSize,
        onInvalidate,
    } satisfies TheGrid<T>);

    // Official extensions
    extend(expanderExtension);
    extend(renderExtension);
    extend(mouseExtension);
    extend(keyboardExtension);
    extend(resizeObserverExtension);

    // Kick off rendering
    invalidate(true);

    return createGridInstance(instance);
}
