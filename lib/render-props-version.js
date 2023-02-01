"use strict";

exports.__esModule = true;
exports.default = void 0;

var _react = require("react");

var _events = require("./helpers/events");

var _find = _interopRequireDefault(require("./helpers/find"));

var _getClosestTransformedParent = _interopRequireDefault(require("./helpers/getClosestTransformedParent"));

var _rect = require("./helpers/rect");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var buildTopStyles = function buildTopStyles(container, props) {
  var bottomOffset = props.bottomOffset,
      hideOnBoundaryHit = props.hideOnBoundaryHit;
  var top = container.top,
      height = container.height,
      width = container.width,
      boundaryBottom = container.boundaryBottom; // above boundary

  if (hideOnBoundaryHit || top + height + bottomOffset < boundaryBottom) {
    return {
      top: top + "px",
      width: width + "px",
      position: "fixed"
    };
  } // reaching boundary


  if (!hideOnBoundaryHit && boundaryBottom > 0) {
    return {
      top: boundaryBottom - height - bottomOffset + "px",
      width: width + "px",
      position: "fixed"
    };
  } // below boundary


  return {
    width: width + "px",
    bottom: bottomOffset + "px",
    position: "absolute"
  };
};

var buildBottomStyles = function buildBottomStyles(container, props) {
  var bottomOffset = props.bottomOffset,
      hideOnBoundaryHit = props.hideOnBoundaryHit;
  var bottom = container.bottom,
      height = container.height,
      width = container.width,
      boundaryTop = container.boundaryTop;

  if (hideOnBoundaryHit || bottom - height - bottomOffset > boundaryTop) {
    return {
      width: width + "px",
      top: bottom - height + "px",
      position: "fixed"
    };
  }

  return {
    width: width + "px",
    top: bottomOffset + "px",
    position: "absolute"
  };
};

var buildStickyStyle = function buildStickyStyle(mode, props, container) {
  return (mode === "top" ? buildTopStyles : buildBottomStyles)(container, props);
};

var isEqual = function isEqual(obj1, obj2) {
  var styles1 = obj1.wrapperStyles;
  var styles2 = obj2.wrapperStyles;

  if (obj1.isFixed !== obj2.isFixed || obj1.height !== obj2.height || !styles1 && styles2 || styles1 && !styles2) {
    return false;
  }

  if (!styles2) {
    // we need this condition to make Flow happy
    return true;
  }

  for (var field in styles1) {
    if (styles1.hasOwnProperty(field) && styles1[field] !== styles2[field]) {
      return false;
    }
  }

  return true;
};

var Sticky = /*#__PURE__*/function (_Component) {
  _inheritsLoose(Sticky, _Component);

  function Sticky() {
    var _this;

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _Component.call.apply(_Component, [this].concat(args)) || this;
    _this.holderEl = null;
    _this.wrapperEl = null;
    _this.el = null;
    _this.scrollEl = null;
    _this.boundaryEl = null;
    _this.disabled = false;
    _this.checkPositionIntervalId = void 0;
    _this.lastMinHeight = void 0;
    _this.state = {
      isFixed: false,
      wrapperStyles: null,
      holderStyles: null,
      height: 0
    };

    _this.holderRef = function (holderEl) {
      if (holderEl === _this.holderEl) {
        return;
      }

      _this.holderEl = holderEl;
    };

    _this.wrapperRef = function (wrapperEl) {
      if (wrapperEl === _this.wrapperEl) {
        return;
      }

      _this.wrapperEl = wrapperEl;

      _this.updateScrollEl();

      _this.updateBoundaryEl();
    };

    _this.checkPosition = function () {
      var _assertThisInitialize = _assertThisInitialized(_this),
          holderEl = _assertThisInitialize.holderEl,
          wrapperEl = _assertThisInitialize.wrapperEl,
          boundaryEl = _assertThisInitialize.boundaryEl,
          scrollEl = _assertThisInitialize.scrollEl,
          disabled = _assertThisInitialize.disabled;

      if (!scrollEl || !holderEl || !wrapperEl) {
        console.error("Missing required elements:", {
          scrollEl: scrollEl,
          holderEl: holderEl,
          wrapperEl: wrapperEl
        });
        return;
      }

      var _this$props = _this.props,
          mode = _this$props.mode,
          onFixedToggle = _this$props.onFixedToggle,
          offsetTransforms = _this$props.offsetTransforms,
          isIOSFixEnabled = _this$props.isIOSFixEnabled,
          dontUpdateHolderHeightWhenSticky = _this$props.dontUpdateHolderHeightWhenSticky,
          windowTopOffset = _this$props.windowTopOffset;

      if (disabled) {
        if (_this.state.isFixed) {
          _this.setState({
            isFixed: false,
            wrapperStyles: {}
          });
        }

        return;
      }

      if (!holderEl.getBoundingClientRect || !wrapperEl.getBoundingClientRect) {
        return;
      }

      var holderRect = holderEl.getBoundingClientRect();
      var wrapperRect = wrapperEl.getBoundingClientRect();
      var boundaryRect = boundaryEl ? (0, _rect.getRect)(boundaryEl) : _rect.infiniteRect;
      var scrollRect = (0, _rect.getRect)(scrollEl);

      var isFixed = _this.isFixed(holderRect, wrapperRect, boundaryRect, scrollRect);

      var offsets = null;

      if (offsetTransforms && isFixed) {
        var closestTransformedParent = (0, _getClosestTransformedParent.default)(scrollEl);

        if (closestTransformedParent) {
          offsets = (0, _rect.getRect)(closestTransformedParent);
        }
      }

      var minHeight = _this.state.isFixed && dontUpdateHolderHeightWhenSticky && _this.lastMinHeight ? _this.lastMinHeight : wrapperRect.height;
      _this.lastMinHeight = minHeight; // To ensure that this component becomes sticky immediately on mobile devices instead
      // of disappearing until the scroll event completes, we add `transform: translateZ(0)`
      // to 'kick' rendering of this element to the GPU
      // @see http://stackoverflow.com/questions/32875046

      var iosRenderingFixStyles = isIOSFixEnabled ? {
        transform: "translateZ(0)",
        WebkitTransform: "translateZ(0)"
      } : null;
      var newState = {
        isFixed: isFixed,
        height: wrapperRect.height,
        holderStyles: {
          minHeight: minHeight + "px"
        },
        wrapperStyles: isFixed ? _extends({}, iosRenderingFixStyles, buildStickyStyle(mode, _this.props, {
          boundaryTop: mode === "bottom" ? boundaryRect.top : 0,
          boundaryBottom: mode === "top" ? boundaryRect.bottom : 0,
          top: mode === "top" ? scrollRect.top + windowTopOffset - (offsets ? offsets.top : 0) : 0,
          bottom: mode === "bottom" ? scrollRect.bottom - (offsets ? offsets.bottom : 0) : 0,
          width: holderRect.width,
          height: wrapperRect.height
        })) : iosRenderingFixStyles
      };

      if (isFixed !== _this.state.isFixed && onFixedToggle && typeof onFixedToggle === "function") {
        onFixedToggle(isFixed);
      }

      if (!isEqual(_this.state, newState)) {
        _this.setState(newState);
      }
    };

    return _this;
  }

  var _proto = Sticky.prototype;

  _proto.isFixed = function isFixed(holderRect, wrapperRect, boundaryRect, scrollRect) {
    var _this$props2 = this.props,
        hideOnBoundaryHit = _this$props2.hideOnBoundaryHit,
        bottomOffset = _this$props2.bottomOffset,
        topOffset = _this$props2.topOffset,
        mode = _this$props2.mode;

    if (this.disabled) {
      return false;
    }

    if (hideOnBoundaryHit && boundaryRect && !(0, _rect.isIntersecting)(boundaryRect, scrollRect, topOffset, bottomOffset)) {
      return false;
    }

    var hideOffset = hideOnBoundaryHit ? wrapperRect.height + bottomOffset : 0;

    if (mode === "top") {
      return holderRect.top + topOffset < scrollRect.top && scrollRect.top + hideOffset <= boundaryRect.bottom;
    }

    return holderRect.bottom - topOffset > scrollRect.bottom && scrollRect.bottom - hideOffset >= boundaryRect.top;
  };

  _proto.updateScrollEl = function updateScrollEl() {
    if (!this.wrapperEl) {
      return;
    }

    if (this.scrollEl) {
      (0, _events.unlisten)(this.scrollEl, ["scroll"], this.checkPosition);
      this.scrollEl = null;
    }

    var scrollElement = this.props.scrollElement;

    if (typeof scrollElement === "string") {
      this.scrollEl = (0, _find.default)(scrollElement, this.wrapperEl);
    } else {
      this.scrollEl = scrollElement;
    }

    if (this.scrollEl) {
      (0, _events.listen)(this.scrollEl, ["scroll"], this.checkPosition);
    } else {
      console.error("Cannot find scrollElement " + (typeof scrollElement === "string" ? scrollElement : "unknown"));
    }
  };

  _proto.updateBoundaryEl = function updateBoundaryEl() {
    if (!this.wrapperEl) {
      return;
    }

    var boundaryElement = this.props.boundaryElement;
    this.boundaryEl = (0, _find.default)(boundaryElement, this.wrapperEl);

    if (this.boundaryEl === window || this.boundaryEl === document) {
      // such objects can't be used as boundary
      // and in fact there is no point in such a case
      this.boundaryEl = null;
    }
  };

  _proto.initialize = function initialize() {
    var _this$props3 = this.props,
        positionRecheckInterval = _this$props3.positionRecheckInterval,
        disabled = _this$props3.disabled;
    this.disabled = disabled; // we should always listen to window events because they will affect the layout of the whole page

    (0, _events.listen)(window, ["scroll", "resize", "pageshow", "load"], this.checkPosition);
    this.checkPosition();

    if (positionRecheckInterval) {
      this.checkPositionIntervalId = setInterval(this.checkPosition, positionRecheckInterval);
    }
  };

  _proto.componentDidUpdate = function componentDidUpdate(_ref) {
    var scrollElement = _ref.scrollElement,
        boundaryElement = _ref.boundaryElement,
        disabled = _ref.disabled;

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
  };

  _proto.componentDidMount = function componentDidMount() {
    this.initialize();

    if (this.wrapperEl === null) {
      console.error("Wrapper element is missing, please make sure that you have assigned refs correctly");
    }
  };

  _proto.componentWillUnmount = function componentWillUnmount() {
    if (this.scrollEl) {
      (0, _events.unlisten)(this.scrollEl, ["scroll"], this.checkPosition);
    }

    (0, _events.unlisten)(window, ["scroll", "resize", "pageshow", "load"], this.checkPosition);
    this.boundaryEl = null;
    this.scrollEl = null;
    clearInterval(this.checkPositionIntervalId);
  };

  _proto.render = function render() {
    var holderRef = this.holderRef,
        wrapperRef = this.wrapperRef;
    var _this$state = this.state,
        isFixed = _this$state.isFixed,
        wrapperStyles = _this$state.wrapperStyles,
        holderStyles = _this$state.holderStyles;
    return this.props.children({
      holderRef: holderRef,
      wrapperRef: wrapperRef,
      isFixed: isFixed,
      wrapperStyles: wrapperStyles,
      holderStyles: holderStyles
    });
  };

  return Sticky;
}(_react.Component);

Sticky.defaultProps = {
  mode: "top",
  topOffset: 0,
  bottomOffset: 0,
  isIOSFixEnabled: true,
  disabled: false,
  onFixedToggle: null,
  boundaryElement: null,
  scrollElement: "window",
  dontUpdateHolderHeightWhenSticky: false
};
var _default = Sticky;
exports.default = _default;
module.exports = exports.default;