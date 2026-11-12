/**
 * A data row: a plain object whose properties are bound to columns.
 */
export type DataItem = Record<string, any>;

/**
 * How many extra columns and rows to render beyond each edge of the viewport,
 * so that scrolling does not reveal empty space before the next render.
 */
export type RenderAhead = {
    /**
     * Extra columns on each side.
     */
    columns: number;

    /**
     * Extra rows above and below.
     */
    rows: number;
};

/**
 * Undoes whatever set it up (removes listeners, observers, scheduled work).
 */
export type Disposer = () => void;
