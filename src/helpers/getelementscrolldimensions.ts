/**
 * Describes the horizontal and vertical scroll bounds of an element.
 */
export interface ElementScrollDimensions {
    /**
     * The current horizontal scroll position from the left edge.
     */
    scrollLeft: number;

    /**
     * The horizontal position of the right edge of the visible viewport.
     */
    scrollRight: number;

    /**
     * The current vertical scroll position from the top edge.
     */
    scrollTop: number;

    /**
     * The vertical position of the bottom edge of the visible viewport.
     */
    scrollBottom: number;
}

/**
 * Minimal element shape required to derive scroll dimensions.
 */
export interface ElementScrollLike {
    /**
     * The current horizontal scroll position.
     */
    scrollLeft: number;

    /**
     * The current vertical scroll position.
     */
    scrollTop: number;

    /**
     * The visible viewport width.
     */
    clientWidth: number;

    /**
     * The visible viewport height.
     */
    clientHeight: number;
}

/**
 * Computes the visible scroll bounds of an element.
 *
 * @param element The element-like object exposing scroll and viewport measurements.
 * @returns An immutable snapshot of the element's current scroll dimensions.
 */
export function getElementScrollDimensions(element: ElementScrollLike): ElementScrollDimensions {
    const { scrollLeft, scrollTop, clientWidth, clientHeight } = element;
    return Object.freeze({
        scrollLeft,
        scrollRight: scrollLeft + clientWidth,
        scrollTop,
        scrollBottom: scrollTop + clientHeight,
    });
}
