export const ColumnType = Object.freeze({
    String: "string",
    Text: "text",
    Boolean: "boolean",
    Decimal: "decimal",
    Integer: "integer",
} as const);

export type ColumnType = (typeof ColumnType)[keyof typeof ColumnType];

export interface ColumnOptions {
    binding: string;
    header?: string;
    type?: ColumnType;
    width?: number;
    minWidth?: number;
    maxWidth?: number;
}

export class Column {
    #binding: string;
    #header: string;
    #type: ColumnType;
    #width: number;
    #minWidth: number | undefined;
    #maxWidth: number | undefined;

    constructor(options: ColumnOptions) {
        this.#binding = options.binding;
        this.#header = options.header ?? options.binding;
        this.#type = options.type ?? ColumnType.String;
        this.#width = options.width ?? 100;
        this.#minWidth = options.minWidth ?? undefined;
        this.#maxWidth = options.maxWidth ?? undefined;
    }
}
