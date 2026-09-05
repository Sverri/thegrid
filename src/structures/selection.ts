import type { Grid } from "@grid/grid";
import { createEvent, type Callback } from "@shared/event";
import { createRange, isRange, type Range } from "./range";

/**
 * Represents the active selection within a grid.
 *
 * The selection stores a rectangular range and notifies listeners when it changes.
 */
class Selection {
    #range = createRange(0, 0);
    #onChange = createEvent<() => void>();
    #grid: Grid<any>;

    /**
     * Creates a selection bound to a specific grid instance.
     *
     * @param grid The grid this selection belongs to.
     */
    constructor(grid: Grid<any>) {
        this.#grid = grid;
    }

    /**
     * Event raised whenever the selection changes.
     */
    get onChange() {
        return this.#onChange.unraisable;
    }

    /**
     * Gets the current selected range.
     */
    get range() {
        return this.#range;
    }

    /**
     * Sets the selected range and raises a change event.
     *
     * @param value The new selected range.
     */
    set range(value: Range) {
        this.#range = value;
        this.#onChange.raise();
    }

    /**
     * Selects the provided range.
     *
     * @param range The range to become active.
     */
    select(range: Range): void;

    /**
     * Selects a range by absolute coordinates.
     *
     * @param x1 The starting x coordinate.
     * @param y1 The starting y coordinate.
     * @param x2 The ending x coordinate. Defaults to the starting x coordinate.
     * @param y2 The ending y coordinate. Defaults to the starting y coordinate.
     */
    select(x1: number, y1: number, x2?: number, y2?: number): void;

    /**
     * Applies a selection using either a range instance or coordinate values.
     *
     * @param x1 A range to apply or the starting x coordinate.
     * @param y1 The starting y coordinate when using coordinate values.
     * @param x2 The ending x coordinate when using coordinate values.
     * @param y2 The ending y coordinate when using coordinate values.
     */
    select(x1: number | Range, y1?: number, x2?: number, y2?: number): void {
        if (isRange(x1)) {
            this.#range = x1;
        } else {
            this.#range = createRange(x1, y1!, x2, y2);
        }
        this.#onChange.raise();
    }

    /**
     * Moves the selection left by a certain number of columns without crossing the left boundary.
     *
     * @param count The number of columns to move left.
     */
    moveSelectionLeft(count = 1): void {
        const visibleColumns = this.#grid.columns.items;
        if (visibleColumns.length === 0) {
            this.select(createRange(0, this.#range.y2));
            return;
        }

        const { x2, y2 } = this.#range;
        const minX2 = 0;
        let newX2 = x2;
        while (count > 0) {
            const nextX2 = newX2 - 1;
            if (nextX2 < minX2 || !visibleColumns.at(nextX2)) {
                break;
            }
            newX2 = nextX2;
            count--;
        }
        this.select(createRange(newX2, y2));
    }

    /**
     * Moves the selection right by a certain number of columns without crossing the right boundary.
     *
     * @param count The number of columns to move right.
     */
    moveSelectionRight(count = 1): void {
        const visibleColumns = this.#grid.columns.items;
        if (visibleColumns.length === 0) {
            this.select(createRange(0, this.#range.y2));
            return;
        }

        const { x2, y2 } = this.#range;
        const maxX2 = visibleColumns.length - 1;
        let newX2 = x2;
        while (count > 0) {
            const nextX2 = newX2 + 1;
            if (nextX2 > maxX2 || !visibleColumns.at(nextX2)) {
                break;
            }
            newX2 = nextX2;
            count--;
        }
        this.select(createRange(newX2, y2));
    }

    /**
     * Moves the selection upward by a given number of rows without crossing the top boundary.
     *
     * @param count The number of rows to move up.
     */
    moveSelectionUp(count = 1): void {
        const { x2, y2 } = this.#range;
        const minY2 = 0;
        this.select(createRange(x2, Math.max(minY2, y2 - count)));
    }

    /**
     * Moves the selection downward by a given number of rows without crossing the bottom boundary.
     *
     * @param count The number of rows to move down.
     */
    moveSelectionDown(count = 1): void {
        const { x2, y2 } = this.#range;
        const maxY2 = this.#grid.data.size - 1;
        this.select(createRange(x2, Math.min(maxY2, y2 + count)));
    }

    /**
     * Expands the selection left by a number of columns while keeping the anchor fixed.
     *
     * @param count The number of columns to extend left.
     */
    expandSelectionLeft(count = 1): void {
        const visibleColumns = this.#grid.columns.items;
        if (visibleColumns.length === 0) {
            this.select(createRange(0, 0, 0, this.#range.y2));
            return;
        }

        const { x1, y1, x2, y2 } = this.#range;
        const minX2 = 0;
        let newX2 = x2;
        while (count > 0) {
            const nextX2 = newX2 - 1;
            if (nextX2 < minX2 || !visibleColumns.at(nextX2)) {
                break;
            }
            newX2 = nextX2;
            count--;
        }
        this.select(createRange(x1, y1, newX2, y2));
    }

    /**
     * Expands the selection right by a number of columns while keeping the anchor fixed.
     *
     * @param count The number of columns to extend right.
     */
    expandSelectionRight(count = 1): void {
        const visibleColumns = this.#grid.columns.items;
        if (visibleColumns.length === 0) {
            this.select(createRange(0, 0, 0, this.#range.y2));
            return;
        }

        const { x1, y1, x2, y2 } = this.#range;
        const maxX2 = visibleColumns.length - 1;
        let newX2 = x2;
        while (count > 0) {
            const nextX2 = newX2 + 1;
            if (nextX2 > maxX2 || !visibleColumns.at(nextX2)) {
                break;
            }
            newX2 = nextX2;
            count--;
        }
        this.select(createRange(x1, y1, newX2, y2));
    }

    /**
     * Expands the selection upward by a number of rows while keeping the anchor fixed.
     *
     * @param count The number of rows to extend upward.
     */
    expandSelectionUp(count = 1): void {
        const { x1, y1, x2, y2 } = this.#range;
        const minY2 = 0;
        this.select(createRange(x1, y1, x2, Math.max(minY2, y2 - count)));
    }

    /**
     * Expands the selection downward by a number of rows while keeping the anchor fixed.
     *
     * @param count The number of rows to extend downward.
     */
    expandSelectionDown(count = 1): void {
        const { x1, y1, x2, y2 } = this.#range;
        const maxY2 = this.#grid.data.size - 1;
        this.select(createRange(x1, y1, x2, Math.min(maxY2, y2 + count)));
    }
}

export type { Selection };

interface Options {
    onChange?: Callback;
}

/**
 * Creates a new selection instance for the supplied grid.
 *
 * @param grid The grid the selection should be associated with.
 * @returns A new selection bound to the given grid.
 */
export function createSelection(grid: Grid<any>, options?: Options) {
    const instance = new Selection(grid);
    if (options?.onChange) {
        instance.onChange.subscribe(options.onChange);
    }
    return instance;
}
