/**
 * Creates and configures the grid's host and content elements.
 *
 * Existing host content is replaced with the cells, top-left, column-header,
 * and row-header regions used by the grid renderer.
 *
 * @param hostElement The element that will contain the grid.
 * @param cellSize The size, in pixels, used for cells and headers.
 * @returns The cells, column-header, and row-header elements.
 */
export function setupDomElements(hostElement: HTMLElement, cellSize: number) {
    hostElement.innerHTML = `
        <div class="thegrid-area-cells" tabindex="0"></div>
        <div class="thegrid-area-topleft"></div>
        <div class="thegrid-area-columnheaders"></div>
        <div class="thegrid-area-rowheaders"></div>
    `;
    hostElement.classList.add("thegrid");
    hostElement.style.setProperty("width", "100%");
    hostElement.style.setProperty("height", "100%");
    hostElement.style.setProperty("--cell-size", `${cellSize}px`);

    const cellsElement = hostElement.querySelector<HTMLDivElement>(".thegrid-area-cells")!;
    const columnHeadersElement = hostElement.querySelector<HTMLDivElement>(".thegrid-area-columnheaders")!;
    const rowHeadersElement = hostElement.querySelector<HTMLDivElement>(".thegrid-area-rowheaders")!;

    cellsElement.classList.add("thegrid-enable-zebra");

    return { cellsElement, columnHeadersElement, rowHeadersElement };
}

/**
 * Reverts {@link setupDomElements}, leaving the host element empty.
 *
 * @param hostElement The element that contained the grid.
 */
export function teardownDomElements(hostElement: HTMLElement) {
    hostElement.replaceChildren();
    hostElement.classList.remove("thegrid", "thegrid-hide-column-headers", "thegrid-hide-row-headers");
    hostElement.style.removeProperty("width");
    hostElement.style.removeProperty("height");
    hostElement.style.removeProperty("--cell-size");
}
