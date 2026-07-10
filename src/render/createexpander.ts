import type { TheGrid } from "@/grid";

export interface Expander {
    update(): void;
}

export function createExpander({ columns, source, hostElement, cellSize }: TheGrid<any>): Expander {
    return Object.freeze({
        update() {
            const lastVisibleColumn = columns.items.findLast(c => c.visible);
            const x = (lastVisibleColumn?.fromLeft ?? 0) + (lastVisibleColumn?.width ?? 0);
            const y = source.items.size * cellSize;
            hostElement.style.setProperty("--internal-expander-translate-x", `${x}px`, "important");
            hostElement.style.setProperty("--internal-expander-translate-y", `${y}px`, "important");
        },
    });
}
