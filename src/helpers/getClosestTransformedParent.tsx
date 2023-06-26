// @flow strict

export default function getClosestTransformedParent(el: Element): Element | null {
    do {
        const style = window.getComputedStyle(el);
        if (style.transform !== 'none' || style.webkitTransform !== 'none') return el;
        // @ts-expect-error - this is fine we don't need a new variable
        el = el.parentElement || el.parentNode;
    } while (el !== null && el.nodeType === 1);
    return null;
}
