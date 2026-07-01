/**
 * Cell type
 */
export type CellType = (typeof CellType)[keyof typeof CellType];

export const CellType = Object.freeze({
    Cell: "cell",
    TopLeft: "topleft",
    ColumnHeader: "columnheader",
    RowHeader: "rowheader",
} as const);

/**
 * Column type
 */
export type ColumnType = (typeof ColumnType)[keyof typeof ColumnType];

export const ColumnType = Object.freeze({
    String: "string",
    Text: "text",
    Boolean: "boolean",
    Decimal: "decimal",
    Integer: "integer",
    URL: "url",
    Email: "email",
} as const);
