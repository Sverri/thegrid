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
