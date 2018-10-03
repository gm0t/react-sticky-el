import React, { Component } from 'react'
import PropTypes from 'prop-types'
import ReactDOM from 'react-dom'
import { listen, unlisten } from './helpers/events'
import find from './helpers/find'
import getClosestTransformedParent from './helpers/getClosestTransformedParent'

const stickyOwnProps = [
  'mode',
  'disabled',
  'onFixedToggle',
  'stickyStyle',
  'stickyClassName',
  'boundaryElement',
  'scrollElement',
  'bottomOffset',
  'topOffset',
  'positionRecheckInterval',
  'noExceptionOnMissedScrollElement',
  'wrapperCmp',
  'holderCmp',
  'hideOnBoundaryHit',
  'offsetTransforms',
  'holderProps'
];

const isEqual = (obj1, obj2) => {
  const styles1 = obj1.styles;
  const styles2 = obj2.styles;

  if (
    obj1.fixed !== obj2.fixed ||
    obj1.height !== obj2.height ||
    (!styles1 && styles2) ||
    (styles1 && !styles2)
  ) {
    return false
  }

  for (let field in styles1) {
    if (styles1.hasOwnProperty(field) && styles1[field] !== styles2[field]) {
      return false;
    }
  }

  return true;
};

const buildTopStyles = (container, props) => {
  const { bottomOffset, hideOnBoundaryHit } = props;
  const { top, height, width, boundaryBottom } = container;

  if (hideOnBoundaryHit || (top + height + bottomOffset < boundaryBottom)) {
    return { top, width, position: 'fixed' };
  }

  return { width, bottom: bottomOffset, position: 'absolute' };
};

const buildBottomStyles = (container, props) => {
  const { bottomOffset, hideOnBoundaryHit } = props;
  const { bottom, height, width, boundaryTop } = container;

  if (hideOnBoundaryHit || (bottom - height - bottomOffset > boundaryTop)) {
    return { width, top: bottom - height, position: 'fixed' };
  }

  return { width, top: bottomOffset, position: 'absolute' };
};

const buildStickyStyle = (mode, props, container) =>
  (mode === 'top' ? buildTopStyles : buildBottomStyles)(container, props);

export default class Sticky extends Component {
  static propTypes = {
    mode: PropTypes.oneOf(['top', 'bottom']),
    onFixedToggle: PropTypes.func,
    stickyStyle: PropTypes.object,
    stickyClassName: PropTypes.string,
    hideOnBoundaryHit: PropTypes.bool,
    offsetTransforms: PropTypes.bool,
    disabled: PropTypes.bool,
    boundaryElement: PropTypes.string,
    scrollElement: PropTypes.any,
    bottomOffset: PropTypes.number,
    topOffset: PropTypes.number,
    positionRecheckInterval: PropTypes.number,
    noExceptionOnMissedScrollElement: PropTypes.bool,
    wrapperCmp: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
    holderCmp: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
    holderProps: PropTypes.object
  };

  static defaultProps = {
    className: '',
    style: {},
    mode: 'top',
    holderCmp: 'div',
    holderProps: {},
    wrapperCmp: 'div',
    stickyClassName: 'sticky',
    stickyStyle: null,
    hideOnBoundaryHit: true,
    offsetTransforms: false,
    disabled: false,
    boundaryElement: null,
    scrollElement: 'window',
    topOffset: 0,
    bottomOffset: 0,
    noExceptionOnMissedScrollElement: false,
    positionRecheckInterval: 0
  };

  constructor(props) {
    super(props);
    this.disabled = props.disabled
    this.state = {
      height: 0,
      fixed: false,
      styles: null,
    }
  }

  componentDidMount() {
      const me = ReactDOM.findDOMNode(this);
      const {
        boundaryElement,
        scrollElement,
        noExceptionOnMissedScrollElement,
        positionRecheckInterval,
        disabled
      } = this.props;

      this.disabled = disabled
      this.boundaryElement = find(boundaryElement, me);
      if (this.boundaryElement === window || this.boundaryElement === document) {
        // such objects can't be used as boundary
        // and in fact there is no point in such a case
        this.boundaryElement = null;
      }
      this.scrollElement = scrollElement
      if (typeof scrollElement === 'string') {
        this.scrollElement = find(scrollElement, me);
      }

      if (this.scrollElement) {
        listen(this.scrollElement, ['scroll'], this.checkPosition)
      } else if (!noExceptionOnMissedScrollElement) {
        throw new Error('Cannot find scrollElement ' + scrollElement);
      }

      listen(window, ['scroll', 'resize', 'pageshow', 'load'], this.checkPosition);
      this.checkPosition();

      if (positionRecheckInterval) {
        this.checkPositionIntervalId = setInterval(this.checkPosition, positionRecheckInterval);
      }
  }

  componentWillReceiveProps({ disabled }) {
    if (this.disabled !== disabled) {
      this.disabled = disabled
      this.checkPosition()
    }
  }

  componentWillUnmount() {
      if (this.scrollElement) {
        unlisten(this.scrollElement, ['scroll'], this.checkPosition);
      }
      unlisten(window, ['scroll', 'resize', 'pageshow', 'load'], this.checkPosition);
      this.boundaryElement = null;
      this.scrollElement = null;
      clearTimeout(this.checkPositionIntervalId);
  }

  createWrapperRef = (wrapper) => {
    this.wrapperEl = wrapper;
  };

  createHolderRef = (holder) => {
    this.holderEl = holder;
  };

  isFixed(holderRect, wrapperRect, boundaryRect, scrollRect) {
    const {
      hideOnBoundaryHit,
      bottomOffset,
      topOffset,
      mode
    } = this.props;

    if (this.disabled) {
      return false
    }

    if (boundaryRect && !instersect(boundaryRect, scrollRect, topOffset, bottomOffset)) {
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

  checkPosition = () => {
    const {
      holderEl,
      wrapperEl,
      boundaryElement,
      scrollElement,
      disabled
    } = this;

    const {
      mode,
      onFixedToggle,
      offsetTransforms,
    } = this.props;

    if (disabled) {
      if (this.state.fixed) {
        this.setState({ fixed: false })
      }
      return
    }

    const holderRect = holderEl.getBoundingClientRect();
    const wrapperRect = wrapperEl.getBoundingClientRect();
    const boundaryRect = boundaryElement ? getRect(boundaryElement) : {top: -Infinity, bottom: Infinity};
    const scrollRect = getRect(scrollElement);
    const fixed = this.isFixed(holderRect, wrapperRect, boundaryRect, scrollRect);

    let offsets = null;
    if (offsetTransforms && fixed) {
      const closestTransformedParent = getClosestTransformedParent(scrollElement);
      if (closestTransformedParent) offsets = getRect(closestTransformedParent);
    }

    const newState = {
      fixed,
      height: wrapperRect.height,
      styles: fixed ? buildStickyStyle(mode, this.props, {
        boundaryTop: mode === 'bottom' ? boundaryRect.top : 0,
        boundaryBottom: mode === 'top' ? boundaryRect.bottom : 0,
        top: mode === 'top' ? scrollRect.top - (offsets ? offsets.top : 0) : 0,
        bottom: mode === 'bottom' ? scrollRect.bottom - (offsets ? offsets.bottom : 0) : 0,
        width: holderRect.width,
        height: wrapperRect.height
      }) : null
    };

    if (fixed !== this.state.fixed && onFixedToggle && typeof onFixedToggle === 'function') {
      onFixedToggle(this.state.fixed);
    }

    if (!isEqual(this.state, newState)) {
      this.setState(newState);
    }
  };

  render() {
    const props = this.props;
    const {fixed, height} = this.state;
    const {
      stickyClassName,
      stickyStyle,
      holderCmp,
      wrapperCmp,
      holderProps,
      children
    } = props;
    let wrapperProps = sanitizeProps(props, stickyOwnProps);
    // To ensure that this component becomes sticky immediately on mobile devices instead
    // of disappearing until the scroll event completes, we add `transform: translateZ(0)`
    // to 'kick' rendering of this element to the GPU
    // @see http://stackoverflow.com/questions/32875046
    let wrapperStyle = {transform: 'translateZ(0)', WebkitTransform: 'translateZ(0)'};
    if (wrapperProps.style) {
      wrapperStyle = {...wrapperStyle, ...wrapperProps.style};
    }

    if (fixed) {
      wrapperProps.className += ' ' + stickyClassName;
      wrapperStyle = {
        ...wrapperStyle,
        ...stickyStyle,
        ...this.state.styles
      };
    }

    holderProps.style = {...holderProps.style, minHeight: height + 'px'};
    holderProps.ref = this.createHolderRef;

    wrapperProps.style = wrapperStyle;
    wrapperProps.ref = this.createWrapperRef;
    return (
      React.createElement(
        holderCmp,
        holderProps,
        React.createElement(
          wrapperCmp,
          wrapperProps,
          children
        )
      )
    )
  }
}

// some helpers

function getRect(el) {
  if (el && typeof(el.getBoundingClientRect) === 'function') {
    return el.getBoundingClientRect();
  }

  if (el === window || el === document) {
    return {top: 0, left: 0, bottom: window.innerHeight, height: window.innerHeight, width: window.innerWidth, right: window.innerWidth};
  }

  return {top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0};
}

function instersect(r1, r2, topOffset, bottomOffset) {
  const r1Top = r1.top + topOffset,
    r1Bottom = r1.bottom + bottomOffset;

  return (r1Top >= r2.top && r1Top <= r2.bottom)
    || (r1Bottom >= r2.top && r1Bottom <= r2.bottom)
    || (r1Bottom >= r2.bottom && r1Top <= r2.top);
}

/**
 * Simply removes all unwanted props in order to avoid react 'unkown prop' warning
 * @param  {Object} props     that should be sanitized
 * @param  {Object} toRemove  array of prop names to remove
 * @return {Object}           cloned and sanitized props
 */
function sanitizeProps(props, toRemove) {
  props = {...props};
  for (let i = 0, l = toRemove.length; i < l; i += 1) {
    delete props[toRemove[i]]
  }
  return props;
}
