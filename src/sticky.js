import React, {Component, PropTypes} from 'react'
import ReactDOM from 'react-dom'
import { listen, unlisten } from './helpers/events'
import find from './helpers/find'

const stickyOwnProps = [
  'mode',
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
  'holderProps'
];

const isEqual = (obj1, obj2) => {
  for (let field in obj1) {
    if (obj1.hasOwnProperty(field) && obj1[field] !== obj2[field]) {
      return false;
    }
  }

  return true;
}

export default class Sticky extends Component {
  static propTypes = {
    mode: PropTypes.oneOf(['top', 'bottom']),
    stickyStyle: PropTypes.object,
    stickyClassName: PropTypes.string,
    hideOnBoundaryHit: PropTypes.bool,
    boundaryElement: PropTypes.string,
    scrollElement: PropTypes.string,
    bottomOffset: PropTypes.number,
    topOffset: PropTypes.number,
    positionRecheckInterval: PropTypes.number,
    noExceptionOnMissedScrollElement: PropTypes.bool,
    wrapperCmp: PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.func]),
    holderCmp: PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.func]),
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
    boundaryElement: null,
    scrollElement: 'window',
    topOffset: 0,
    bottomOffset: 0,
    noExceptionOnMissedScrollElement: false,
    positionRecheckInterval: 0
  };

  constructor(props) {
    super(props)
    this.state = {
      height: 0,
      fixed: false
    }
  }

  shouldComponentUpdate(nProps, nState) {
    const { state, props } = this
    return !isEqual(state, nState) || !isEqual(props, nProps);
  }

  componentDidMount() {
      const me = ReactDOM.findDOMNode(this);
      const {
        boundaryElement,
        scrollElement,
        noExceptionOnMissedScrollElement,
        positionRecheckInterval
      } = this.props;

      this.boundaryElement = find(boundaryElement, me);
      if (this.boundaryElement === window || this.boundaryElement === document) {
        // such objects can't be used as boundary
        // and in fact there is no point in such a case
        this.boundaryElement = null;
      }

      this.scrollElement = find(scrollElement, me);

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
      scrollElement
    } = this;

    const holderRect = holderEl.getBoundingClientRect(),
      wrapperRect = wrapperEl.getBoundingClientRect(),
      boundaryRect = boundaryElement ? getRect(boundaryElement) : {top: -Infinity, bottom: Infinity},
      scrollRect = getRect(scrollElement),
      isFixed = this.isFixed(holderRect, wrapperRect, boundaryRect, scrollRect);

    this.setState({
      fixed: isFixed,
      boundaryTop: boundaryRect.top,
      boundaryBottom: boundaryRect.bottom,
      top: scrollRect.top,
      bottom: scrollRect.bottom,
      width: holderRect.width,
      height: wrapperRect.height
    });
  }

  buildTopStyles() {
    const { bottomOffset, hideOnBoundaryHit } = this.props;
    const { top, height, boundaryBottom } = this.state;

    if (hideOnBoundaryHit || (top + height + bottomOffset < boundaryBottom)) {
      return { top, position: 'fixed' };
    }

    return { bottom: bottomOffset, position: 'absolute' };
  }

  buildBottomStyles() {
    const { bottomOffset, hideOnBoundaryHit } = this.props;
    const { bottom, height, boundaryTop } = this.state;

    if (hideOnBoundaryHit || (bottom - height - bottomOffset > boundaryTop)) {
      return { top: bottom - height, position: 'fixed' };
    }

    return { top: bottomOffset, position: 'absolute' };
  }

  buildStickyStyle() {
    let style;
    if (this.props.mode === 'top') {
      style = this.buildTopStyles();
    } else {
      style =  this.buildBottomStyles();
    }
    style.width = this.state.width;

    return style;
  }

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
        ...this.buildStickyStyle()
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