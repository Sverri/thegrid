import type { DataItem } from "@/types";
import { createGridInstance, getColumns, GRID_HTML, type TheGrid, type TheGridOptions } from "@/objects/grid";
import { debounce } from "throttle-debounce";
import { List } from "immutable";
import { getElementScrollDimensions } from "@/helpers/getelementscrolldimensions";
import { keyboardExtension } from "@/extensions/keyboard";
import { mouseExtension } from "@/extensions/mouse";
import { resizeObserverExtension } from "@/extensions/resizeobserver";
import { renderExtension } from "@/extensions/render";
import { expanderExtension } from "@/extensions/expander";
import { createEvent } from "@/shared/event";
import { createRange, rangeIdenticalTo, type Range } from "@/structures/range";
import { HeaderSelection } from "@/shared/enums";
import { createColumn, columnFromLeft, type ImmutableColumn } from "@/structures/column";
import { createImmutableGrid, type ImmutableGrid } from "@/structures/grid";

function setupDomElements(hostElement: HTMLElement) {
    hostElement.innerHTML = GRID_HTML;
    hostElement.classList.add("thegrid");
    hostElement.style.setProperty("width", "100%");
    hostElement.style.setProperty("height", "100%");

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

    return { cellsElement, columnHeadersElement, rowHeadersElement };
}

export function createGrid<T extends DataItem>(
    hostElement: HTMLElement,
    options?: TheGridOptions<T>,
): Immutable.RecordOf<TheGrid<T>> {
    const instance = {} as TheGrid<T>;

    let grid = createImmutableGrid<T>().withMutations(data => {
        if (options?.columns) {
            data.set(
                "columns",
                getColumns(options?.columns).map(column => createColumn(column)),
            );
        }
        if (options?.source) {
            data.set("source", List(options?.source));
        }
    });

    const { cellsElement, columnHeadersElement, rowHeadersElement } = setupDomElements(hostElement);
    const cellSize = Number.parseInt(window.getComputedStyle(hostElement).getPropertyValue("--cell-size"), 10);
    const onInvalidate = createEvent<() => void>();
    const showHeaderSelection = options?.showHeaderSelection ?? HeaderSelection.Both;

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

    const modify = (callback: (grid: Immutable.RecordOf<ImmutableGrid<T>>) => Immutable.RecordOf<ImmutableGrid<T>>) => {
        grid = callback(grid);
        invalidate(true);
    };

    /**
     * Update the columns
     *
     * The callback receives the current immutable columns and must return
     * a new immutable columns.
     *
     * @param callback A function that receives the current columns and returns new columns.
     */
    const updateColumns = (callback: (columns: List<ImmutableColumn<T>>) => List<ImmutableColumn<T>>) => {
        const newOptions = callback(grid.columns);
        const columns = newOptions.map(data => createColumn(data));
        Object.assign(instance, { columns });

        modify(data => {
            return data.withMutations(x => {
                x.set("columns", columns);
            });
        });
    };

    /**
     * Update the source
     *
     * The callback receives the current immutable source and must return
     * a new immutable source.
     *
     * @param callback A function that receives the current source and returns a new source.
     */
    const updateSource = (callback: (source: List<T>) => List<T>) => {
        const source = callback(grid.source);
        Object.assign(instance, { source });
        modify(data => {
            return data.withMutations(x => {
                x.set("source", source);
            });
        });
    };

    /**
     * Update the selection
     *
     * The callback receives the current immutable selection and must return
     * a new immutable selection.
     *
     * @param callback A function that receives the current selection and returns a new selection.
     */
    const updateSelection = (callback: (source: Immutable.RecordOf<Range>) => Immutable.RecordOf<Range>) => {
        const range = callback(grid.selection);
        if (rangeIdenticalTo(grid.selection, range)) {
            // Range is identical, no need to update selection. This can happen
            // when the user is extending the selection by dragging the mouse,
            // as well as other reasons.
            return;
        }
        const selection = createRange(range.x1, range.y1, range.x2, range.y2);
        Object.assign(instance, { selection });
        modify(data => {
            return data.withMutations(x => {
                x.set("selection", selection);
            });
        });
    };

    const scrollIntoView = debounce(64, (columnIndex: number, rowIndex: number) => {
        const { scrollLeft, scrollRight, scrollTop, scrollBottom } = getElementScrollDimensions(cellsElement);
        const column = grid.columns.get(columnIndex)!;

        let left = scrollLeft;
        const columnStart = columnFromLeft(grid.columns, column);
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
        const row = grid.source.get(rowIndex);
        if (!row) {
            return undefined;
        }
        const column = grid.columns.get(columnIndex);
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
        columns: grid.columns,
        source: grid.source,
        selection: grid.selection,
        cellSize,
        onInvalidate,
        showHeaderSelection,
        modify,
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
