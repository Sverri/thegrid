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

    return { cellsElement, columnHeadersElement, rowHeadersElement };
}
