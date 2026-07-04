import type { TheGrid } from "@/thegrid";

interface Coordinate {
    x: number;
    y: number;
}

export class Expander {
    #grid: TheGrid<Record<string, any>>;

    constructor(grid: TheGrid<Record<string, any>>) {
        this.#grid = grid;
        this.updateExpanders();
    }

    updateExpanders() {
        const x = this.#grid.columns.items.reduce((prev, cur) => prev + cur.width, 0);
        const y = this.#grid.source.items.size * this.#grid.cellSize;

        this.#grid.hostElement.style.setProperty(
            "--internal-expander-translate-x",
            `${x}px`,
            "important",
        );
        this.#grid.hostElement.style.setProperty(
            "--internal-expander-translate-y",
            `${y}px`,
            "important",
        );
    }
}
