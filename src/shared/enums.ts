/**
 * Identifies the different kinds of cells that can exist in the grid.
 */
export const CellType = Object.freeze({
    /**
     * A regular data cell.
     */
    Cell: "cell",

    /**
     * The top-left corner cell that acts as the grid origin.
     */
    TopLeft: "topleft",

    /**
     * A header cell for a column.
     */
    ColumnHeader: "columnheader",

    /**
     * A header cell for a row.
     */
    RowHeader: "rowheader",
} as const);

export type CellType = (typeof CellType)[keyof typeof CellType];

/**
 * Identifies the supported data types used to format and interpret grid values.
 */
export const DataType = Object.freeze({
    /**
     * Plain text values.
     */
    String: Symbol("string column type"),

    /**
     * Multi-line text values.
     */
    Text: Symbol("text column type"),

    /**
     * Boolean values.
     */
    Boolean: Symbol("boolean column type"),

    /**
     * Numeric values rendered with decimal precision.
     */
    Decimal: Symbol("decimal column type"),

    /**
     * Date values.
     */
    Date: Symbol("date column type"),

    /**
     * Whole-number values.
     */
    Integer: Symbol("integer column type"),

    /**
     * URL values.
     */
    URL: Symbol("url column type"),

    /**
     * Email address values.
     */
    Email: Symbol("email column type"),

    /**
     * Currency values.
     */
    Currency: Symbol("currency column type"),

    /**
     * Custom or application-defined data types.
     */
    Custom: Symbol("custom column type"),
} as const);

export type DataType = (typeof DataType)[keyof typeof DataType];
