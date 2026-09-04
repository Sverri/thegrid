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

    const cellsElement = hostElement.querySelector<HTMLDivElement>(".thegrid-area-cells");
    if (!cellsElement) {
        throw new Error("Could not find cells element");
    }

    const columnHeadersElement = hostElement.querySelector<HTMLDivElement>(".thegrid-area-columnheaders");
    if (!columnHeadersElement) {
        throw new Error("Could not find column headers element");
    }

    const rowHeadersElement = hostElement.querySelector<HTMLDivElement>(".thegrid-area-rowheaders");
    if (!rowHeadersElement) {
        throw new Error("Could not find row headers element");
    }

    hostElement.style.setProperty("--cell-size", `${cellSize}px`);

    return { cellsElement, columnHeadersElement, rowHeadersElement };
}
