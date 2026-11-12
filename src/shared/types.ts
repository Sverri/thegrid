export type DataItem = Record<string, any>;

export type RenderAhead = { columns: number; rows: number };

/**
 * Undoes whatever set it up (removes listeners, observers, scheduled work).
 */
export type Disposer = () => void;
