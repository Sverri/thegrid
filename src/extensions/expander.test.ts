/** @vitest-environment happy-dom */

import { describe, expect, it, vi } from "vitest";
import { expanderExtension } from "./expander";

function createGrid(columns: { width: number }[], dataSize: number, cellSize: number) {
    let invalidateCallback: (() => void) | undefined;
    const hostElement = document.createElement("div");
    const subscribe = vi.fn((callback: () => void) => {
        invalidateCallback = callback;
    });

    return {
        grid: {
            hostElement,
            columns: { items: columns, size: columns.length },
            data: { size: dataSize },
            cellSize,
            onInvalidate: { subscribe },
        },
        hostElement,
        subscribe,
        invalidate: () => invalidateCallback?.(),
    };
}

describe("expanderExtension", () => {
    it("updates the expander variables when the grid is invalidated", () => {
        const { grid, hostElement, subscribe, invalidate } = createGrid([{ width: 100 }, { width: 75 }], 8, 20);

        expanderExtension(grid as any);
        invalidate();

        expect(subscribe).toHaveBeenCalledTimes(1);
        expect(hostElement.style.getPropertyValue("--internal-expander-x")).toBe("175px");
        expect(hostElement.style.getPropertyValue("--internal-expander-y")).toBe("160px");
        expect(hostElement.style.getPropertyPriority("--internal-expander-x")).toBe("important");
        expect(hostElement.style.getPropertyPriority("--internal-expander-y")).toBe("important");
    });

    it("sets both expander dimensions to zero when there are no columns", () => {
        const { grid, hostElement, invalidate } = createGrid([], 8, 20);

        expanderExtension(grid as any);
        invalidate();

        expect(hostElement.style.getPropertyValue("--internal-expander-x")).toBe("0px");
        expect(hostElement.style.getPropertyValue("--internal-expander-y")).toBe("0px");
    });
});
