// @flow strict

export default function getClosestTransformedParent(el: Element) {
    do {
        const style = window.getComputedStyle(el);
        if (style.transform !== 'none' || style.webkitTransform !== 'none') return el;
        // $FlowFixMe - it's fine
        el = el.parentElement || el.parentNode;
    } while (el !== null && el.nodeType === 1);
    return null;
}
