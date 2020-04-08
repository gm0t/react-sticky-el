// @flow strict

export type Rect = {
  top: number,
  left: number,
  bottom: number,
  height: number,
  width: number,
  right: number,
}

export const infiniteRect: Rect = { top: -Infinity, bottom: Infinity, height: Infinity, left: -Infinity, right: Infinity, width: Infinity };

export function getRect(el: Element): Rect {
  if (el && typeof (el.getBoundingClientRect) === 'function') {
    return el.getBoundingClientRect();
  }

  if (el === window || el === document) {
    return {
      top: 0,
      left: 0,
      bottom: window.innerHeight,
      height: window.innerHeight,
      width: window.innerWidth,
      right: window.innerWidth
    };
  }

  return { top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0 };
}

export function isIntersecting(r1: Rect, r2: Rect, topOffset: number, bottomOffset: number) {
  const r1Top = r1.top + topOffset,
    r1Bottom = r1.bottom + bottomOffset;

  return (r1Top >= r2.top && r1Top <= r2.bottom)
    || (r1Bottom >= r2.top && r1Bottom <= r2.bottom)
    || (r1Bottom >= r2.bottom && r1Top <= r2.top);
}
