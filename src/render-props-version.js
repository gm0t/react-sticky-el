// @flow strict

import type { MaybeStyles, RenderProps } from "./types";
import { Component } from "react";
import { listen, unlisten } from "./helpers/events";
import find from "./helpers/find";
import getClosestTransformedParent from "./helpers/getClosestTransformedParent";
import { getRect, infiniteRect, isIntersecting } from "./helpers/rect";
import type { Rect } from "./helpers/rect";

type State = {
  +isFixed: boolean,
  +height: number,
  +wrapperStyles: MaybeStyles,
  +holderStyles: MaybeStyles
}

type StickyStyles = $Exact<{
  top?: string,
  bottom?: string,
  width: string,
  position: string,
}>;

const buildTopStyles = (container, props): StickyStyles => {
  const { bottomOffset, hideOnBoundaryHit } = props;
  const { top, height, width, boundaryBottom } = container;

  // above boundary
  if (hideOnBoundaryHit || (top + height + bottomOffset < boundaryBottom)) {
    return { top: `${top}px`, width: `${width}px`, position: 'fixed' };
  }

  // reaching boundary
  if (!hideOnBoundaryHit && boundaryBottom > 0) {
    return { top: `${boundaryBottom - height - bottomOffset}px`, width: `${width}px`, position: 'fixed' };
  }

  // below boundary
  return { width: `${width}px`, bottom: `${bottomOffset}px`, position: 'absolute' };
};

const buildBottomStyles = (container, props): StickyStyles => {
  const { bottomOffset, hideOnBoundaryHit } = props;
  const { bottom, height, width, boundaryTop } = container;

  if (hideOnBoundaryHit || (bottom - height - bottomOffset > boundaryTop)) {
    return { width: `${width}px`, top: `${bottom - height}px`, position: 'fixed' };
  }

  return { width: `${width}px`, top: `${bottomOffset}px`, position: 'absolute' };
};

const buildStickyStyle = (mode, props, container) =>
  (mode === 'top' ? buildTopStyles : buildBottomStyles)(container, props);


const isEqual = (obj1: State, obj2: State) => {
  const styles1 = obj1.wrapperStyles;
  const styles2 = obj2.wrapperStyles;

  if (
    obj1.isFixed !== obj2.isFixed ||
    obj1.height !== obj2.height ||
    (!styles1 && styles2) ||
    (styles1 && !styles2)
  ) {
    return false
  }

  if (!styles2) {
    // we need this condition to make Flow happy
    return true;
  }

  for (let field in styles1) {
    if (styles1.hasOwnProperty(field) && styles1[field] !== styles2[field]) {
      return false;
    }
  }

  return true;
};

class Sticky extends Component<RenderProps, State> {
  static defaultProps = {
    mode: 'top',
    topOffset: 0,
    bottomOffset: 0,
    isIOSFixEnabled: true,
    disabled: false,
    onFixedToggle: null,
    boundaryElement: null,
    scrollElement: 'window',
    dontUpdateHolderHeightWhenSticky: false,
  };

  holderEl: HTMLElement | null = null;
  wrapperEl: HTMLElement | null = null;
  el: HTMLElement | null = null;

  scrollEl: Element | null = null;
  boundaryEl: Element | null = null;

  disabled: boolean = false;
  checkPositionIntervalId: IntervalID;
  lastMinHeight: number;

  state: State = {
    isFixed: false,
    wrapperStyles: null,
    holderStyles: null,
    height: 0
  };

  holderRef = (holderEl: HTMLElement | null) => {
    if (holderEl === this.holderEl) {
      return;
    }
    this.holderEl = holderEl;
  };
  wrapperRef = (wrapperEl: HTMLElement | null) => {
    if (wrapperEl === this.wrapperEl) {
      return;
    }
    this.wrapperEl = wrapperEl;
    this.updateScrollEl();
    this.updateBoundaryEl();
  };

  checkPosition = () => {
    const {
      holderEl,
      wrapperEl,
      boundaryEl,
      scrollEl,
      disabled
    } = this;

    if (!scrollEl || !holderEl || !wrapperEl) {
      console.error("Missing required elements:", {
        scrollEl,
        holderEl,
        wrapperEl
      });
      return;
    }

    const {
      mode,
      onFixedToggle,
      offsetTransforms,
      isIOSFixEnabled,
      dontUpdateHolderHeightWhenSticky
    } = this.props;

    if (disabled) {
      if (this.state.isFixed) {
        this.setState({ isFixed: false })
      }
      return
    }

    if (!holderEl.getBoundingClientRect || !wrapperEl.getBoundingClientRect) {
      return
    }

    const holderRect: Rect = holderEl.getBoundingClientRect();
    const wrapperRect: Rect = wrapperEl.getBoundingClientRect();
    const boundaryRect: Rect = boundaryEl ? getRect(boundaryEl) : infiniteRect;
    const scrollRect = getRect(scrollEl);

    const isFixed = this.isFixed(holderRect, wrapperRect, boundaryRect, scrollRect);

    let offsets = null;
    if (offsetTransforms && isFixed) {
      const closestTransformedParent = getClosestTransformedParent(scrollEl);
      if (closestTransformedParent) {
        offsets = getRect(closestTransformedParent);
      }
    }

    const minHeight = this.state.isFixed && dontUpdateHolderHeightWhenSticky && this.lastMinHeight ? this.lastMinHeight : wrapperRect.height;
    this.lastMinHeight = minHeight;

    // To ensure that this component becomes sticky immediately on mobile devices instead
    // of disappearing until the scroll event completes, we add `transform: translateZ(0)`
    // to 'kick' rendering of this element to the GPU
    // @see http://stackoverflow.com/questions/32875046
    const iosRenderingFixStyles = isIOSFixEnabled ? {
      transform: 'translateZ(0)',
      WebkitTransform: 'translateZ(0)'
    } : null;

    const newState: State = {
      isFixed,
      height: wrapperRect.height,
      holderStyles: { minHeight: `${minHeight}px` },
      wrapperStyles: isFixed ? {
        ...iosRenderingFixStyles,
        ...buildStickyStyle(mode, this.props, {
          boundaryTop: mode === 'bottom' ? boundaryRect.top : 0,
          boundaryBottom: mode === 'top' ? boundaryRect.bottom : 0,
          top: mode === 'top' ? scrollRect.top - (offsets ? offsets.top : 0) : 0,
          bottom: mode === 'bottom' ? scrollRect.bottom - (offsets ? offsets.bottom : 0) : 0,
          width: holderRect.width,
          height: wrapperRect.height
        })
      } : iosRenderingFixStyles
    };

    if (isFixed !== this.state.isFixed && onFixedToggle && typeof onFixedToggle === 'function') {
      onFixedToggle(isFixed);
    }

    if (!isEqual(this.state, newState)) {
      this.setState(newState);
    }
  };

  isFixed(holderRect: Rect, wrapperRect: Rect, boundaryRect: Rect, scrollRect: Rect) {
    const {
      hideOnBoundaryHit,
      bottomOffset,
      topOffset,
      mode
    } = this.props;

    if (this.disabled) {
      return false
    }

    if (hideOnBoundaryHit && boundaryRect && !isIntersecting(boundaryRect, scrollRect, topOffset, bottomOffset)) {
      return false
    }

    const hideOffset = hideOnBoundaryHit ? wrapperRect.height + bottomOffset : 0;

    if (mode === 'top') {
      return (holderRect.top + topOffset < scrollRect.top)
        && (scrollRect.top + hideOffset <= boundaryRect.bottom);
    }

    return (holderRect.bottom - topOffset > scrollRect.bottom)
      && (scrollRect.bottom - hideOffset >= boundaryRect.top);
  }

  updateScrollEl() {
    if (!this.wrapperEl) {
      return;
    }

    if (this.scrollEl) {
      unlisten(this.scrollEl, [ 'scroll' ], this.checkPosition);
      this.scrollEl = null;
    }

    const { scrollElement } = this.props;

    if (typeof scrollElement === 'string') {
      this.scrollEl = find(scrollElement, this.wrapperEl);
    } else {
      this.scrollEl = scrollElement;
    }

    if (this.scrollEl) {
      listen(this.scrollEl, [ 'scroll' ], this.checkPosition)
    } else {
      console.error('Cannot find scrollElement ' + (typeof scrollElement === 'string' ? scrollElement : 'unknown'));
    }
  }

  updateBoundaryEl() {
    if (!this.wrapperEl) {
      return;
    }

    const { boundaryElement } = this.props;

    this.boundaryEl = find(boundaryElement, this.wrapperEl);
    if (this.boundaryEl === window || this.boundaryEl === document) {
      // such objects can't be used as boundary
      // and in fact there is no point in such a case
      this.boundaryEl = null;
    }
  }

  initialize() {
    const {
      positionRecheckInterval,
      disabled
    } = this.props;

    this.disabled = disabled;

    // we should always listen to window events because they will affect the layout of the whole page
    listen(window, [ 'scroll', 'resize', 'pageshow', 'load' ], this.checkPosition);

    this.checkPosition();

    if (positionRecheckInterval) {
      this.checkPositionIntervalId = setInterval(this.checkPosition, positionRecheckInterval);
    }
  }

  componentDidUpdate({ scrollElement, boundaryElement, disabled }: RenderProps) {
    if (scrollElement !== this.props.scrollElement) {
      this.updateScrollEl();
    }

    if (boundaryElement !== this.props.boundaryElement) {
      this.updateBoundaryEl();
    }

    if (disabled !== this.props.disabled) {
      this.disabled = this.props.disabled;
      this.checkPosition();
    }
  }

  componentDidMount() {
    this.initialize();
    if (this.wrapperEl === null) {
      console.error("Wrapper element is missing, please make sure that you have assigned refs correctly");
    }
  }


  componentWillUnmount() {
    if (this.scrollEl) {
      unlisten(this.scrollEl, [ 'scroll' ], this.checkPosition);
    }
    unlisten(window, [ 'scroll', 'resize', 'pageshow', 'load' ], this.checkPosition);
    this.boundaryEl = null;
    this.scrollEl = null;
    clearInterval(this.checkPositionIntervalId);
  }


  render() {
    const { holderRef, wrapperRef } = this;
    const { isFixed, wrapperStyles, holderStyles } = this.state;

    return this.props.children({
      holderRef,
      wrapperRef,
      isFixed,
      wrapperStyles,
      holderStyles
    })
  }
}

export default Sticky;