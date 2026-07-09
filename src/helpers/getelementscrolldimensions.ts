export interface ElementScrollDimensions {
    scrollLeft: number;
    scrollRight: number;
    scrollTop: number;
    scrollBottom: number;
}

export function getElementScrollDimensions(element: HTMLElement): ElementScrollDimensions {
    const { scrollLeft, scrollTop, clientWidth, clientHeight } = element;
    console.log("->", scrollLeft, scrollTop, clientWidth, clientHeight);
    return Object.freeze({
        scrollLeft,
        scrollRight: scrollLeft + clientWidth,
        scrollTop,
        scrollBottom: scrollTop + clientHeight,
    });
}
