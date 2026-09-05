/** @vitest-environment happy-dom */

import { describe, expect, it } from "vitest";
import { setupDomElements } from "./setup";

describe("setupDomElements", () => {
    it("creates the grid regions and configures the host element", () => {
        const hostElement = document.createElement("div");
        hostElement.textContent = "old content";

        const result = setupDomElements(hostElement, 24);

        expect(hostElement.classList.contains("thegrid")).toBe(true);
        expect(hostElement.style.getPropertyValue("width")).toBe("100%");
        expect(hostElement.style.getPropertyValue("height")).toBe("100%");
        expect(hostElement.style.getPropertyValue("--cell-size")).toBe("24px");
        expect(hostElement.children.length).toBe(4);
        expect(hostElement.textContent).not.toContain("old content");

        expect(result.cellsElement).toBe(hostElement.querySelector(".thegrid-area-cells"));
        expect(result.cellsElement.getAttribute("tabindex")).toBe("0");
        expect(result.columnHeadersElement).toBe(hostElement.querySelector(".thegrid-area-columnheaders"));
        expect(result.rowHeadersElement).toBe(hostElement.querySelector(".thegrid-area-rowheaders"));
        expect(hostElement.querySelector(".thegrid-area-topleft")).not.toBeNull();
    });
});
