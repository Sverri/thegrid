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

/**
 * One of the {@link CellType} values.
 */
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
     * Boolean values, rendered as checkboxes.
     */
    Boolean: "DataType.Boolean",

    /**
     * Any number, rendered exactly as `Number(value).toString()` would, right-aligned.
     */
    Number: "DataType.Number",

    /**
     * Whole-number values, rounded and formatted with the grid locale, right-aligned.
     */
    Integer: "DataType.Integer",

    /**
     * Numbers, including numeric strings, formatted with two decimals in the grid locale, right-aligned.
     */
    Decimal: "DataType.Decimal",

    /**
     * Identifiers. Numbers are formatted like {@link DataType.Integer} but left-aligned.
     */
    Id: "DataType.Id",

    /**
     * `Date` objects, date strings or timestamps, formatted as a date in the grid locale.
     */
    Date: "DataType.Date",

    /**
     * URLs. Absolute http(s) URLs are rendered as links that open in a new tab.
     */
    URL: "DataType.URL",

    /**
     * Email addresses, rendered as `mailto:` links.
     */
    Email: "DataType.Email",

    /**
     * Currency amounts, currently formatted like {@link DataType.Decimal}, without a currency symbol.
     */
    Currency: "DataType.Currency",

    /**
     * Custom or application-defined data types, currently rendered as plain text.
     */
    Custom: "DataType.Custom",
} as const);

/**
 * One of the {@link DataType} values.
 */
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

/**
 * One of the {@link Headers} values.
 */
export type Headers = (typeof Headers)[keyof typeof Headers];
