export interface ElementScrollDimensions {
    scrollLeft: number;
    scrollRight: number;
    scrollTop: number;
    scrollBottom: number;
}

export interface ElementScrollLike {
    scrollLeft: number;
    scrollTop: number;
    clientWidth: number;
    clientHeight: number;
}

export function getElementScrollDimensions(element: ElementScrollLike): ElementScrollDimensions {
    const { scrollLeft, scrollTop, clientWidth, clientHeight } = element;

    return Object.freeze({
        scrollLeft,
        scrollRight: scrollLeft + clientWidth,
        scrollTop,
        scrollBottom: scrollTop + clientHeight,
    });
}
