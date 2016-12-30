import React, {PureComponent, PropTypes} from 'react'
import ReactDOM from 'react-dom'
import {listen, unlisten} from './helpers/events'
import find from './helpers/find'

const stickyOwnProps = [
  'mode',
  'inlineStyle',
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
  'holderProps'
];

export default class Sticky extends PureComponent {
  static propTypes = {
    mode: PropTypes.oneOf(['top', 'bottom']),
    inlineStyle: PropTypes.bool,
    stickyStyle: PropTypes.object,
    stickyClassName: PropTypes.string,
    boundaryElement: PropTypes.string,
    scrollElement: PropTypes.string,
    bottomOffset: PropTypes.number,
    topOffset: PropTypes.number,
    positionRecheckInterval: PropTypes.number,
    noExceptionOnMissedScrollElement: PropTypes.bool,
    wrapperCmp: PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.func]),
    holderCmp: PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.func]),
    holderProps: PropTypes.object
  }

  static defaultProps = {
    className: '',
    style: {},
    mode: 'top',
    holderCmp: 'div',
    holderProps: {},
    wrapperCmp: 'div',
    stickyClassName: 'sticky',
    stickyStyle: null,
    inlineStyle: true,
    boundaryElement: null,
    scrollElement: 'window',
    topOffset: 0,
    bottomOffset: 0,
    noExceptionOnMissedScrollElement: false,
    positionRecheckInterval: 0
  }


  isFixed(holderRect, wrapperRect, boundaryRect, scrollRect) {
    const {
      bottomOffset,
      topOffset,
      mode
    } = this.props;

    if (boundaryRect && !instersect(boundaryRect, scrollRect, topOffset, bottomOffset)) {
      return false
    }

    if (mode === 'top') {
      return (holderRect.top + topOffset < scrollRect.top)
        && (scrollRect.top + wrapperRect.height + bottomOffset < boundaryRect.bottom);
    }

    return (holderRect.bottom - topOffset > scrollRect.bottom)
      && (scrollRect.bottom - wrapperRect.height - bottomOffset > boundaryRect.top);
  }

  checkPosition = () => {
    const {
      boundaryElement,
      scrollElement
    } = this;

    const holderRect = this.refs.holder.getBoundingClientRect(),
      wrapperRect = this.refs.wrapper.getBoundingClientRect(),
      boundaryRect = boundaryElement ? getRect(boundaryElement) : {top: -Infinity, bottom: Infinity},
      scrollRect = getRect(scrollElement),
      isFixed = this.isFixed(holderRect, wrapperRect, boundaryRect, scrollRect);

    this.setState({
      fixed: isFixed,
      top: scrollRect.top,
      bottom: scrollRect.bottom,
      width: holderRect.width,
      height: wrapperRect.height
    });
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
        unlisten(this.scrollElement, this.checkPosition);
      }
      unlisten(window, ['resize', 'pageshow', 'load'], this.checkPosition);
      this.boundaryElement = null;
      this.scrollElement = null;
      clearTimeout(this.checkPositionIntervalId);
  }

  constructor(props) {
    super(props)
    this.state = {
      height: 0,
      fixed: false
    }
  }

  buildStickyStyle() {
    const mode = this.props.mode;
    const state = this.state;
    let style = {
      position: 'fixed',
      width: state.width
    };

    if (mode === 'top') {
      style.top = state.top;
    } else {
      style.top = state.bottom - this.state.height;
    }

    return style;
  }

  render() {
    const props = this.props;
    const {fixed, height} = this.state;
    const {
      stickyClassName,
      stickyStyle,
      inlineStyle,
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
      wrapperStyle = {wrapperStyle, ...wrapperProps.style};
    }

    if (fixed) {
      wrapperProps.className += ' ' + stickyClassName;
      if (inlineStyle) {
        wrapperStyle = {...wrapperStyle, ...this.buildStickyStyle()};
      }
      if (stickyStyle) {
        wrapperStyle = {...wrapperStyle, ...stickyStyle};
      }
    }

    holderProps.style = {...holderProps.style, minHeight: height + 'px'};
    holderProps.ref = 'holder';

    wrapperProps.style = wrapperStyle;
    wrapperProps.ref = 'wrapper';

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