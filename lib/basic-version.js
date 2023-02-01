"use strict";

exports.__esModule = true;
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _renderPropsVersion = _interopRequireDefault(require("./render-props-version"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function Sticky(props) {
  var mode = props.mode,
      onFixedToggle = props.onFixedToggle,
      hideOnBoundaryHit = props.hideOnBoundaryHit,
      offsetTransforms = props.offsetTransforms,
      disabled = props.disabled,
      boundaryElement = props.boundaryElement,
      scrollElement = props.scrollElement,
      bottomOffset = props.bottomOffset,
      topOffset = props.topOffset,
      positionRecheckInterval = props.positionRecheckInterval,
      children = props.children,
      isIOSFixEnabled = props.isIOSFixEnabled,
      dontUpdateHolderHeightWhenSticky = props.dontUpdateHolderHeightWhenSticky,
      windowTopOffset = props.windowTopOffset,
      wrapperClassName = props.wrapperClassName,
      stickyClassName = props.stickyClassName,
      stickyStyle = props.stickyStyle,
      rest = _objectWithoutPropertiesLoose(props, ["mode", "onFixedToggle", "hideOnBoundaryHit", "offsetTransforms", "disabled", "boundaryElement", "scrollElement", "bottomOffset", "topOffset", "positionRecheckInterval", "children", "isIOSFixEnabled", "dontUpdateHolderHeightWhenSticky", "windowTopOffset", "wrapperClassName", "stickyClassName", "stickyStyle"]);

  return /*#__PURE__*/_react.default.createElement(_renderPropsVersion.default, {
    mode: mode,
    onFixedToggle: onFixedToggle,
    hideOnBoundaryHit: hideOnBoundaryHit,
    offsetTransforms: offsetTransforms,
    disabled: disabled,
    boundaryElement: boundaryElement,
    scrollElement: scrollElement,
    bottomOffset: bottomOffset,
    topOffset: topOffset,
    positionRecheckInterval: positionRecheckInterval,
    isIOSFixEnabled: isIOSFixEnabled,
    dontUpdateHolderHeightWhenSticky: dontUpdateHolderHeightWhenSticky,
    windowTopOffset: windowTopOffset
  }, function (_ref) {
    var isFixed = _ref.isFixed,
        wrapperStyles = _ref.wrapperStyles,
        wrapperRef = _ref.wrapperRef,
        holderStyles = _ref.holderStyles,
        holderRef = _ref.holderRef;
    return /*#__PURE__*/_react.default.createElement("div", _extends({}, rest, {
      ref: holderRef,
      style: holderStyles
    }), /*#__PURE__*/_react.default.createElement("div", _extends({}, rest, {
      className: wrapperClassName + " " + (isFixed ? stickyClassName : ""),
      style: // $FlowFixMe - flow does not like when we merge 2 inexact objects
      isFixed ? _extends({}, wrapperStyles, stickyStyle) : wrapperStyles,
      ref: wrapperRef
    }), children));
  });
}

Sticky.defaultProps = {
  stickyClassName: "sticky",
  wrapperClassName: "",
  stickyStyle: {}
};
var _default = Sticky;
exports.default = _default;
module.exports = exports.default;