/**
 * Cell type
 */
export const CellType = Object.freeze({
    Cell: "cell",
    TopLeft: "topleft",
    ColumnHeader: "columnheader",
    RowHeader: "rowheader",
} as const);

export type CellType = (typeof CellType)[keyof typeof CellType];

/**
 * Column type
 */
export const ColumnType = Object.freeze({
    String: Symbol("string column type"),
    Text: Symbol("text column type"),
    Boolean: Symbol("boolean column type"),
    Decimal: Symbol("decimal column type"),
    Date: Symbol("date column type"),
    Integer: Symbol("integer column type"),
    URL: Symbol("url column type"),
    Email: Symbol("email column type"),
    Currency: Symbol("currency column type"),
} as const);

export type ColumnType = (typeof ColumnType)[keyof typeof ColumnType];
