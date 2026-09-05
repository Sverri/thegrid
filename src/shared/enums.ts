/**
 * Identifies the different kinds of cells that can exist in the grid.
 */
export const CellType = Object.freeze({
    /**
     * A regular data cell.
     */
    Cell: Symbol("CellType.Cell"),

    /**
     * The top-left corner cell that acts as the grid origin.
     */
    TopLeft: Symbol("CellType.TopLeft"),

    /**
     * A header cell for a column.
     */
    ColumnHeader: Symbol("CellType.ColumnHeader"),

    /**
     * A header cell for a row.
     */
    RowHeader: Symbol("CellType.RowHeader"),
} as const);

export type CellType = (typeof CellType)[keyof typeof CellType];

/**
 * Identifies the supported data types used to format and interpret grid values.
 */
export const DataType = Object.freeze({
    /**
     * Plain text values.
     */
    String: Symbol("DataType.String"),

    /**
     * Multi-line text values.
     */
    Text: Symbol("DataType.Text"),

    /**
     * Boolean values.
     */
    Boolean: Symbol("DataType.Boolean"),

    /**
     * Numeric values rendered with decimal precision.
     */
    Decimal: Symbol("DataType.Decimal"),

    /**
     * Date values.
     */
    Date: Symbol("DataType.Date"),

    /**
     * Whole-number values.
     */
    Integer: Symbol("DataType.Integer"),

    /**
     * URL values.
     */
    URL: Symbol("DataType.URL"),

    /**
     * Email address values.
     */
    Email: Symbol("DataType.Email"),

    /**
     * Currency values.
     */
    Currency: Symbol("DataType.Currency"),

    /**
     * Custom or application-defined data types.
     */
    Custom: Symbol("DataType.Custom"),
} as const);

export type DataType = (typeof DataType)[keyof typeof DataType];

/**
 * Identifies the different kinds of cells that can exist in the grid.
 */
export const Headers = Object.freeze({
    /**
     * A regular data cell.
     */
    None: Symbol("HeaderSelection.None"),

    /**
     * The top-left corner cell that acts as the grid origin.
     */
    Rows: Symbol("HeaderSelection.RowHeaders"),

    /**
     * A header cell for a column.
     */
    Columns: Symbol("HeaderSelection.ColumnHeaders"),

    /**
     * A header cell for a row.
     */
    Both: Symbol("HeaderSelection.Both"),
} as const);

export type Headers = (typeof Headers)[keyof typeof Headers];
