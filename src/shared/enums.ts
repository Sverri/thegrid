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
    String: "DataType.String",

    /**
     * Multi-line text values.
     */
    Text: "DataType.Text",

    /**
     * Boolean values.
     */
    Boolean: "DataType.Boolean",

    /**
     * Number, integer or decimal (exact value).
     */
    Number: "DataType.Number",

    /**
     * Whole-number values.
     */
    Integer: "DataType.Integer",

    /**
     * Numeric values rendered with decimal precision.
     */
    Decimal: "DataType.Decimal",

    /**
     * Id
     */
    Id: "DataType.Id",

    /**
     * Date values.
     */
    Date: "DataType.Date",

    /**
     * URL values.
     */
    URL: "DataType.URL",

    /**
     * Email address values.
     */
    Email: "DataType.Email",

    /**
     * Currency values.
     */
    Currency: "DataType.Currency",

    /**
     * Custom or application-defined data types.
     */
    Custom: "DataType.Custom",
} as const);

export type DataType = (typeof DataType)[keyof typeof DataType];

/**
 * Selects which headers a setting applies to, such as which headers are shown
 * or which headers highlight the selection.
 */
export const Headers = Object.freeze({
    /**
     * Neither row nor column headers.
     */
    None: Symbol("Headers.None"),

    /**
     * Row headers only.
     */
    Rows: Symbol("Headers.Rows"),

    /**
     * Column headers only.
     */
    Columns: Symbol("Headers.Columns"),

    /**
     * Both row and column headers.
     */
    Both: Symbol("Headers.Both"),
} as const);

export type Headers = (typeof Headers)[keyof typeof Headers];
