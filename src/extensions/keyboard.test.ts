/** @vitest-environment happy-dom */

import { describe, expect, it, vi, beforeEach } from "vitest";
import { handleKeyDown, keyboardExtension } from "./keyboard";

function createGrid() {
    const selection = {
        range: { x1: 1, y1: 1, x2: 1, y2: 1, left: 1, right: 1, top: 1, bottom: 1 },
        select: vi.fn((x1: number, y1: number, x2?: number, y2?: number) => {
            const endX = x2 ?? x1;
            const endY = y2 ?? y1;
            selection.range = {
                x1,
                y1,
                x2: endX,
                y2: endY,
                left: Math.min(x1, endX),
                right: Math.max(x1, endX),
                top: Math.min(y1, endY),
                bottom: Math.max(y1, endY),
            };
        }),
        moveSelectionLeft: vi.fn((count = 1) => {
            const next = Math.max(0, selection.range.x2 - count);
            selection.range = { ...selection.range, x1: next, x2: next, left: next, right: next };
        }),
        moveSelectionRight: vi.fn((count = 1) => {
            const next = selection.range.x2 + count;
            selection.range = { ...selection.range, x1: next, x2: next, left: next, right: next };
        }),
        moveSelectionUp: vi.fn((count = 1) => {
            const next = Math.max(0, selection.range.y2 - count);
            selection.range = { ...selection.range, y1: next, y2: next, top: next, bottom: next };
        }),
        moveSelectionDown: vi.fn((count = 1) => {
            const next = selection.range.y2 + count;
            selection.range = { ...selection.range, y1: next, y2: next, top: next, bottom: next };
        }),
        expandSelectionLeft: vi.fn((count = 1) => {
            const next = Math.max(0, selection.range.x2 - count);
            selection.range = {
                ...selection.range,
                x1: next,
                x2: selection.range.x2,
                left: next,
                right: selection.range.x2,
            };
        }),
        expandSelectionRight: vi.fn((count = 1) => {
            const next = selection.range.x2 + count;
            selection.range = {
                ...selection.range,
                x1: selection.range.x1,
                x2: next,
                left: selection.range.x1,
                right: next,
            };
        }),
        expandSelectionUp: vi.fn((count = 1) => {
            const next = Math.max(0, selection.range.y2 - count);
            selection.range = {
                ...selection.range,
                y1: selection.range.y1,
                y2: next,
                top: next,
                bottom: selection.range.y2,
            };
        }),
        expandSelectionDown: vi.fn((count = 1) => {
            const next = selection.range.y2 + count;
            selection.range = {
                ...selection.range,
                y1: selection.range.y1,
                y2: next,
                top: selection.range.y1,
                bottom: next,
            };
        }),
    };

    const grid = {
        selection,
        columns: { items: [{ visible: true }, { visible: true }, { visible: true }] },
        data: { size: 10 },
        scrollIntoView: vi.fn(),
        cellsElement: document.createElement("div"),
    };

    return grid;
}

describe("handleKeyDown", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("moves left when ArrowLeft is pressed without modifiers", () => {
        const grid = createGrid();
        const event = {
            key: "ArrowLeft",
            shiftKey: false,
            ctrlKey: false,
            altKey: false,
            metaKey: false,
            preventDefault: vi.fn(),
        };

        handleKeyDown(grid as any, event);

        expect(event.preventDefault).toHaveBeenCalledTimes(1);
        expect(grid.selection.moveSelectionLeft).toHaveBeenCalledTimes(1);
        expect(grid.scrollIntoView).toHaveBeenCalledWith(grid.selection.range.x2, grid.selection.range.y2);
    });

    it("expands left when Shift + ArrowLeft is pressed", () => {
        const grid = createGrid();
        const event = {
            key: "ArrowLeft",
            shiftKey: true,
            ctrlKey: false,
            altKey: false,
            metaKey: false,
            preventDefault: vi.fn(),
        };

        handleKeyDown(grid as any, event);

        expect(grid.selection.expandSelectionLeft).toHaveBeenCalledTimes(1);
    });

    it("does nothing for Alt + ArrowLeft", () => {
        const grid = createGrid();
        const event = {
            key: "ArrowLeft",
            shiftKey: false,
            ctrlKey: false,
            altKey: true,
            metaKey: false,
            preventDefault: vi.fn(),
        };

        handleKeyDown(grid as any, event);

        expect(event.preventDefault).not.toHaveBeenCalled();
        expect(grid.selection.moveSelectionLeft).not.toHaveBeenCalled();
    });

    it("jumps to the first column when Ctrl + ArrowLeft is pressed", () => {
        const grid = createGrid();
        const event = {
            key: "ArrowLeft",
            shiftKey: false,
            ctrlKey: true,
            altKey: false,
            metaKey: false,
            preventDefault: vi.fn(),
        };

        handleKeyDown(grid as any, event);

        expect(grid.selection.select).toHaveBeenCalledWith(0, 1, 0, 1);
        expect(grid.scrollIntoView).toHaveBeenCalledWith(0, 1);
    });

    it("moves right when ArrowRight is pressed", () => {
        const grid = createGrid();

        handleKeyDown(grid as any, {
            key: "ArrowRight",
            shiftKey: false,
            ctrlKey: false,
            altKey: false,
            metaKey: false,
            preventDefault: vi.fn(),
        });

        expect(grid.selection.moveSelectionRight).toHaveBeenCalledTimes(1);
    });

    it("expands right when Shift + ArrowRight is pressed", () => {
        const grid = createGrid();

        handleKeyDown(grid as any, {
            key: "ArrowRight",
            shiftKey: true,
            ctrlKey: false,
            altKey: false,
            metaKey: false,
            preventDefault: vi.fn(),
        });

        expect(grid.selection.expandSelectionRight).toHaveBeenCalledTimes(1);
    });

    it("does nothing for Alt + ArrowRight", () => {
        const grid = createGrid();
        const event = {
            key: "ArrowRight",
            shiftKey: false,
            ctrlKey: false,
            altKey: true,
            metaKey: false,
            preventDefault: vi.fn(),
        };

        handleKeyDown(grid as any, event);

        expect(event.preventDefault).not.toHaveBeenCalled();
        expect(grid.selection.moveSelectionRight).not.toHaveBeenCalled();
    });

    it("jumps to the last column when Ctrl + ArrowRight is pressed", () => {
        const grid = createGrid();

        handleKeyDown(grid as any, {
            key: "ArrowRight",
            shiftKey: false,
            ctrlKey: true,
            altKey: false,
            metaKey: false,
            preventDefault: vi.fn(),
        });

        expect(grid.selection.select).toHaveBeenCalledWith(2, 1, 2, 1);
        expect(grid.scrollIntoView).toHaveBeenCalledWith(2, 1);
    });

    it("moves up when ArrowUp is pressed", () => {
        const grid = createGrid();

        handleKeyDown(grid as any, {
            key: "ArrowUp",
            shiftKey: false,
            ctrlKey: false,
            altKey: false,
            metaKey: false,
            preventDefault: vi.fn(),
        });

        expect(grid.selection.moveSelectionUp).toHaveBeenCalledTimes(1);
    });

    it("expands up when Shift + ArrowUp is pressed", () => {
        const grid = createGrid();

        handleKeyDown(grid as any, {
            key: "ArrowUp",
            shiftKey: true,
            ctrlKey: false,
            altKey: false,
            metaKey: false,
            preventDefault: vi.fn(),
        });

        expect(grid.selection.expandSelectionUp).toHaveBeenCalledTimes(1);
    });

    it("does nothing for Alt + ArrowUp", () => {
        const grid = createGrid();
        const event = {
            key: "ArrowUp",
            shiftKey: false,
            ctrlKey: false,
            altKey: true,
            metaKey: false,
            preventDefault: vi.fn(),
        };

        handleKeyDown(grid as any, event);

        expect(event.preventDefault).not.toHaveBeenCalled();
        expect(grid.selection.moveSelectionUp).not.toHaveBeenCalled();
    });

    it("jumps to the first row when Ctrl + ArrowUp is pressed", () => {
        const grid = createGrid();

        handleKeyDown(grid as any, {
            key: "ArrowUp",
            shiftKey: false,
            ctrlKey: true,
            altKey: false,
            metaKey: false,
            preventDefault: vi.fn(),
        });

        expect(grid.selection.select).toHaveBeenCalledWith(1, 0, 1, 0);
    });

    it("moves down when ArrowDown is pressed", () => {
        const grid = createGrid();

        handleKeyDown(grid as any, {
            key: "ArrowDown",
            shiftKey: false,
            ctrlKey: false,
            altKey: false,
            metaKey: false,
            preventDefault: vi.fn(),
        });

        expect(grid.selection.moveSelectionDown).toHaveBeenCalledTimes(1);
    });

    it("expands down when Shift + ArrowDown is pressed", () => {
        const grid = createGrid();

        handleKeyDown(grid as any, {
            key: "ArrowDown",
            shiftKey: true,
            ctrlKey: false,
            altKey: false,
            metaKey: false,
            preventDefault: vi.fn(),
        });

        expect(grid.selection.expandSelectionDown).toHaveBeenCalledTimes(1);
    });

    it("jumps to the last row when Ctrl + ArrowDown is pressed", () => {
        const grid = createGrid();

        handleKeyDown(grid as any, {
            key: "ArrowDown",
            shiftKey: false,
            ctrlKey: true,
            altKey: false,
            metaKey: false,
            preventDefault: vi.fn(),
        });

        expect(grid.selection.select).toHaveBeenCalledWith(1, 9, 1, 9);
        expect(grid.scrollIntoView).toHaveBeenCalledWith(1, 9);
    });

    it("moves to the first column with Home", () => {
        const grid = createGrid();

        handleKeyDown(grid as any, {
            key: "Home",
            shiftKey: false,
            ctrlKey: false,
            altKey: false,
            metaKey: false,
            preventDefault: vi.fn(),
        });

        expect(grid.selection.select).toHaveBeenCalledWith(0, 1, 0, 1);
    });

    it("moves to the first row with Ctrl + Home", () => {
        const grid = createGrid();

        handleKeyDown(grid as any, {
            key: "Home",
            shiftKey: false,
            ctrlKey: true,
            altKey: false,
            metaKey: false,
            preventDefault: vi.fn(),
        });

        expect(grid.selection.select).toHaveBeenCalledWith(1, 0, 1, 0);
    });

    it("preserves the current anchor when Shift + Ctrl + Home is used", () => {
        const grid = createGrid();

        handleKeyDown(grid as any, {
            key: "Home",
            shiftKey: true,
            ctrlKey: true,
            altKey: false,
            metaKey: false,
            preventDefault: vi.fn(),
        });

        expect(grid.selection.select).toHaveBeenCalledWith(1, 1, 1, 0);
    });

    it("preserves the current anchor when Shift + Ctrl + End is used", () => {
        const grid = createGrid();

        handleKeyDown(grid as any, {
            key: "End",
            shiftKey: true,
            ctrlKey: true,
            altKey: false,
            metaKey: false,
            preventDefault: vi.fn(),
        });

        expect(grid.selection.select).toHaveBeenCalledWith(1, 1, 1, 9);
    });

    it("moves to the last column with End", () => {
        const grid = createGrid();

        handleKeyDown(grid as any, {
            key: "End",
            shiftKey: false,
            ctrlKey: false,
            altKey: false,
            metaKey: false,
            preventDefault: vi.fn(),
        });

        expect(grid.selection.select).toHaveBeenCalledWith(2, 1, 2, 1);
    });

    it("moves to the last row with Ctrl + End", () => {
        const grid = createGrid();

        handleKeyDown(grid as any, {
            key: "End",
            shiftKey: false,
            ctrlKey: true,
            altKey: false,
            metaKey: false,
            preventDefault: vi.fn(),
        });

        expect(grid.selection.select).toHaveBeenCalledWith(1, 9, 1, 9);
    });

    it("preserves the anchor while expanding to the first column with Ctrl + Shift + ArrowLeft", () => {
        const grid = createGrid();

        handleKeyDown(grid as any, {
            key: "ArrowLeft",
            shiftKey: true,
            ctrlKey: true,
            altKey: false,
            metaKey: false,
            preventDefault: vi.fn(),
        });

        expect(grid.selection.select).toHaveBeenCalledWith(1, 1, 0, 1);
    });

    it("preserves the anchor while expanding to the last column with Ctrl + Shift + ArrowRight", () => {
        const grid = createGrid();

        handleKeyDown(grid as any, {
            key: "ArrowRight",
            shiftKey: true,
            ctrlKey: true,
            altKey: false,
            metaKey: false,
            preventDefault: vi.fn(),
        });

        expect(grid.selection.select).toHaveBeenCalledWith(1, 1, 2, 1);
    });

    it("preserves the anchor while expanding to the first row with Ctrl + Shift + ArrowUp", () => {
        const grid = createGrid();

        handleKeyDown(grid as any, {
            key: "ArrowUp",
            shiftKey: true,
            ctrlKey: true,
            altKey: false,
            metaKey: false,
            preventDefault: vi.fn(),
        });

        expect(grid.selection.select).toHaveBeenCalledWith(1, 1, 1, 0);
    });

    it("preserves the anchor while expanding to the last row with Ctrl + Shift + ArrowDown", () => {
        const grid = createGrid();

        handleKeyDown(grid as any, {
            key: "ArrowDown",
            shiftKey: true,
            ctrlKey: true,
            altKey: false,
            metaKey: false,
            preventDefault: vi.fn(),
        });

        expect(grid.selection.select).toHaveBeenCalledWith(1, 1, 1, 9);
    });

    it("pages down by the rendered row count", () => {
        const grid = createGrid();
        const event = {
            key: "PageDown",
            shiftKey: false,
            ctrlKey: false,
            altKey: false,
            metaKey: false,
            preventDefault: vi.fn(),
        };

        handleKeyDown(grid as any, event);

        expect(event.preventDefault).toHaveBeenCalledTimes(1);
        expect(grid.selection.moveSelectionDown).toHaveBeenCalledTimes(1);
    });

    it("pages up by the rendered row count", () => {
        const grid = createGrid();

        handleKeyDown(grid as any, {
            key: "PageUp",
            shiftKey: false,
            ctrlKey: false,
            altKey: false,
            metaKey: false,
            preventDefault: vi.fn(),
        });

        expect(grid.selection.moveSelectionUp).toHaveBeenCalledTimes(1);
    });

    it("expands while paging down when Shift is held", () => {
        const grid = createGrid();

        handleKeyDown(grid as any, {
            key: "PageDown",
            shiftKey: true,
            ctrlKey: false,
            altKey: false,
            metaKey: false,
            preventDefault: vi.fn(),
        });

        expect(grid.selection.expandSelectionDown).toHaveBeenCalledTimes(1);
    });

    it("expands while paging up when Shift is held", () => {
        const grid = createGrid();

        handleKeyDown(grid as any, {
            key: "PageUp",
            shiftKey: true,
            ctrlKey: false,
            altKey: false,
            metaKey: false,
            preventDefault: vi.fn(),
        });

        expect(grid.selection.expandSelectionUp).toHaveBeenCalledTimes(1);
    });

    it("does nothing for Ctrl + PageUp", () => {
        const grid = createGrid();
        const event = {
            key: "PageUp",
            shiftKey: false,
            ctrlKey: true,
            altKey: false,
            metaKey: false,
            preventDefault: vi.fn(),
        };

        handleKeyDown(grid as any, event);

        expect(event.preventDefault).not.toHaveBeenCalled();
        expect(grid.selection.moveSelectionUp).not.toHaveBeenCalled();
    });

    it("ignores Ctrl + PageDown to avoid page-jumping while controlling the grid", () => {
        const grid = createGrid();
        const event = {
            key: "PageDown",
            shiftKey: false,
            ctrlKey: true,
            altKey: false,
            metaKey: false,
            preventDefault: vi.fn(),
        };

        handleKeyDown(grid as any, event);

        expect(event.preventDefault).not.toHaveBeenCalled();
        expect(grid.selection.moveSelectionDown).not.toHaveBeenCalled();
    });

    it("ignores Alt and Meta modifier combinations for navigation keys", () => {
        const grid = createGrid();

        handleKeyDown(grid as any, {
            key: "ArrowDown",
            shiftKey: false,
            ctrlKey: false,
            altKey: true,
            metaKey: false,
            preventDefault: vi.fn(),
        });
        handleKeyDown(grid as any, {
            key: "ArrowDown",
            shiftKey: false,
            ctrlKey: false,
            altKey: false,
            metaKey: true,
            preventDefault: vi.fn(),
        });

        expect(grid.selection.moveSelectionDown).not.toHaveBeenCalled();
    });

    it("selects all cells when Ctrl + A is pressed without extra modifiers", () => {
        const grid = createGrid();

        handleKeyDown(grid as any, {
            key: "a",
            shiftKey: false,
            ctrlKey: true,
            altKey: false,
            metaKey: false,
            preventDefault: vi.fn(),
        });

        expect(grid.selection.select).toHaveBeenCalledWith(0, 0, 2, 9);
        expect(grid.scrollIntoView).toHaveBeenCalledWith(2, 9);
    });

    it("does nothing for Ctrl + A when other modifiers are active", () => {
        const grid = createGrid();
        const event = {
            key: "a",
            shiftKey: true,
            ctrlKey: true,
            altKey: false,
            metaKey: false,
            preventDefault: vi.fn(),
        };

        handleKeyDown(grid as any, event);

        expect(event.preventDefault).not.toHaveBeenCalled();
        expect(grid.selection.select).not.toHaveBeenCalled();
    });

    it("adds a keydown listener to the grid cells element", () => {
        const grid = createGrid();
        const addEventListenerSpy = vi.spyOn(grid.cellsElement, "addEventListener");

        keyboardExtension(grid as any);

        expect(addEventListenerSpy).toHaveBeenCalledWith("keydown", expect.any(Function));
    });

    it("dispatches key events to handleKeyDown through the listener", () => {
        const grid = createGrid();
        const event = new KeyboardEvent("keydown", { key: "ArrowLeft" });

        keyboardExtension(grid as any);
        grid.cellsElement.dispatchEvent(event);

        expect(grid.selection.moveSelectionLeft).toHaveBeenCalledTimes(1);
    });
});
