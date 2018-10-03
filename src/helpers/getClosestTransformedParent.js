export default function getClosestTransformedParent(el) {
    do {
        const style = window.getComputedStyle(el);
        if (style.transform !== 'none' || style.webkitTransform !== 'none') return el;
        el = el.parentElement || el.parentNode;
    } while (el !== null && el.nodeType === 1);
    return null;
}
