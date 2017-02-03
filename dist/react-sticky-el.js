(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("react"), require("react-dom"));
	else if(typeof define === 'function' && define.amd)
		define(["react", "react-dom"], factory);
	else if(typeof exports === 'object')
		exports["ReactStickyEl"] = factory(require("react"), require("react-dom"));
	else
		root["ReactStickyEl"] = factory(root["React"], root["ReactDOM"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_4__, __WEBPACK_EXTERNAL_MODULE_5__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _sticky = __webpack_require__(3);

	var _sticky2 = _interopRequireDefault(_sticky);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	exports.default = _sticky2.default;

/***/ },
/* 1 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.listen = listen;
	exports.unlisten = unlisten;
	////////////////////////////////////////////////////////////////////////////////////////
	// Small helpers that provide an easy and effecient way to add/remove event listeners //
	////////////////////////////////////////////////////////////////////////////////////////

	var elementsWithListeners = [],
	    registeredListeners = [];

	function addListener(el, event, cb) {
	  var idx = elementsWithListeners.indexOf(el);
	  if (idx === -1) {
	    idx = elementsWithListeners.length;
	    elementsWithListeners.push(el);
	    registeredListeners.push({ el: el, totalCount: 0 });
	  }

	  var listeners = registeredListeners[idx],
	      listener = listeners[event];

	  if (!listener) {
	    listener = listeners[event] = { callbacks: [] };
	    listener.cb = function (e) {
	      for (var i = 0, l = listener.callbacks.length; i < l; i += 1) {
	        listener.callbacks[i](e);
	      }
	    };
	    listeners.totalCount += 1;
	    listeners.el.addEventListener(event, listener.cb);
	  }

	  // just to prevent double listeners
	  if (listener.callbacks.indexOf(cb) !== -1) {
	    return;
	  }

	  listener.callbacks.push(cb);
	}

	function removeListener(el, event, cb) {
	  var idx = elementsWithListeners.indexOf(el);
	  if (idx === -1) {
	    return;
	  }

	  var listeners = registeredListeners[idx],
	      listener = listeners[event],
	      callbacks = listener ? listener.callbacks : [];

	  if (!listener || callbacks.indexOf(cb) === -1) {
	    return;
	  }

	  callbacks.splice(callbacks.indexOf(cb), 1);
	  if (callbacks.length > 0) {
	    return;
	  }

	  listeners.el.removeEventListener(event, listener.cb);
	  listeners.totalCount -= 1;
	  delete listeners[event];

	  if (listeners.totalCount > 0) {
	    return;
	  }

	  elementsWithListeners.splice(idx, 1);
	  registeredListeners.splice(idx, 1);
	}

	/**
	 * Subscribe cb to events list
	 * @param  {HTMLElement}   el       target element
	 * @param  {Array}         events   array of event names
	 * @param  {Function} cb   callback that should be called
	 */
	function listen(el, events, cb) {
	  for (var i = 0, l = events.length; i < l; i += 1) {
	    addListener(el, events[i], cb);
	  }
	}

	/**
	 * Unsubscribe cb from events list
	 * @param  {HTMLElement}   el       target element
	 * @param  {Array}         events   array of event names
	 * @param  {Function} cb   callback that should be unsubscribed
	 */

	function unlisten(el, events, cb) {
	  for (var i = 0, l = events.length; i < l; i += 1) {
	    removeListener(el, events[i], cb);
	  }
	}

/***/ },
/* 2 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = find;
	var basicSelectors = {
	  'body': document.body,
	  'window': window,
	  'document': document
	};

	var matchesMethodName = function () {
	  var body = document.body;
	  return typeof body.matches === 'function' ? 'matches' : typeof body.webkitMatchesSelector === 'function' ? 'webkitMatchesSelector' : //webkit
	  typeof body.mozMatchesSelector === 'function' ? 'mozMatchesSelector' : //mozilla
	  typeof body.msMatchesSelector === 'function' ? 'msMatchesSelector' : //ie
	  typeof body.oMatchesSelector === 'function' ? 'oMatchesSelector' : //old opera
	  null;
	}();

	function find(selector, el) {
	  if (!selector) {
	    return null;
	  }

	  if (basicSelectors.hasOwnProperty(selector)) {
	    return basicSelectors[selector];
	  }

	  // select by id
	  if (selector[0] === '#') {
	    return window.getElementById(selector.slice(1));
	  }

	  if (!matchesMethodName) {
	    return null;
	  }

	  // eslint-disable-next-line no-cond-assign
	  while (el = el.parentElement) {
	    if (el[matchesMethodName](selector)) {
	      return el;
	    }
	  }

	  // nothing has been found :(
	  return null;
	}

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _react = __webpack_require__(4);

	var _react2 = _interopRequireDefault(_react);

	var _reactDom = __webpack_require__(5);

	var _reactDom2 = _interopRequireDefault(_reactDom);

	var _events = __webpack_require__(1);

	var _find = __webpack_require__(2);

	var _find2 = _interopRequireDefault(_find);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var stickyOwnProps = ['mode', 'inlineStyle', 'stickyStyle', 'stickyClassName', 'boundaryElement', 'scrollElement', 'bottomOffset', 'topOffset', 'positionRecheckInterval', 'noExceptionOnMissedScrollElement', 'wrapperCmp', 'holderCmp', 'holderProps'];

	var Sticky = function (_PureComponent) {
	  _inherits(Sticky, _PureComponent);

	  _createClass(Sticky, [{
	    key: 'isFixed',
	    value: function isFixed(holderRect, wrapperRect, boundaryRect, scrollRect) {
	      var _props = this.props;
	      var bottomOffset = _props.bottomOffset;
	      var topOffset = _props.topOffset;
	      var mode = _props.mode;


	      if (boundaryRect && !instersect(boundaryRect, scrollRect, topOffset, bottomOffset)) {
	        return false;
	      }

	      if (mode === 'top') {
	        return holderRect.top + topOffset < scrollRect.top && scrollRect.top + wrapperRect.height + bottomOffset < boundaryRect.bottom;
	      }

	      return holderRect.bottom - topOffset > scrollRect.bottom && scrollRect.bottom - wrapperRect.height - bottomOffset > boundaryRect.top;
	    }
	  }, {
	    key: 'componentDidMount',
	    value: function componentDidMount() {
	      var me = _reactDom2.default.findDOMNode(this);
	      var _props2 = this.props;
	      var boundaryElement = _props2.boundaryElement;
	      var scrollElement = _props2.scrollElement;
	      var noExceptionOnMissedScrollElement = _props2.noExceptionOnMissedScrollElement;
	      var positionRecheckInterval = _props2.positionRecheckInterval;


	      this.boundaryElement = (0, _find2.default)(boundaryElement, me);
	      if (this.boundaryElement === window || this.boundaryElement === document) {
	        // such objects can't be used as boundary
	        // and in fact there is no point in such a case
	        this.boundaryElement = null;
	      }

	      this.scrollElement = (0, _find2.default)(scrollElement, me);

	      if (this.scrollElement) {
	        (0, _events.listen)(this.scrollElement, ['scroll'], this.checkPosition);
	      } else if (!noExceptionOnMissedScrollElement) {
	        throw new Error('Cannot find scrollElement ' + scrollElement);
	      }

	      (0, _events.listen)(window, ['scroll', 'resize', 'pageshow', 'load'], this.checkPosition);
	      this.checkPosition();

	      if (positionRecheckInterval) {
	        this.checkPositionIntervalId = setInterval(this.checkPosition, positionRecheckInterval);
	      }
	    }
	  }, {
	    key: 'componentWillUnmount',
	    value: function componentWillUnmount() {
	      if (this.scrollElement) {
	        (0, _events.unlisten)(this.scrollElement, this.checkPosition);
	      }
	      (0, _events.unlisten)(window, ['scroll', 'resize', 'pageshow', 'load'], this.checkPosition);
	      this.boundaryElement = null;
	      this.scrollElement = null;
	      clearTimeout(this.checkPositionIntervalId);
	    }
	  }]);

	  function Sticky(props) {
	    _classCallCheck(this, Sticky);

	    var _this = _possibleConstructorReturn(this, (Sticky.__proto__ || Object.getPrototypeOf(Sticky)).call(this, props));

	    _this.checkPosition = function () {
	      var boundaryElement = _this.boundaryElement;
	      var scrollElement = _this.scrollElement;


	      var holderRect = _this.refs.holder.getBoundingClientRect(),
	          wrapperRect = _this.refs.wrapper.getBoundingClientRect(),
	          boundaryRect = boundaryElement ? getRect(boundaryElement) : { top: -Infinity, bottom: Infinity },
	          scrollRect = getRect(scrollElement),
	          isFixed = _this.isFixed(holderRect, wrapperRect, boundaryRect, scrollRect);

	      _this.setState({
	        fixed: isFixed,
	        top: scrollRect.top,
	        bottom: scrollRect.bottom,
	        width: holderRect.width,
	        height: wrapperRect.height
	      });
	    };

	    _this.state = {
	      height: 0,
	      fixed: false
	    };
	    return _this;
	  }

	  _createClass(Sticky, [{
	    key: 'buildStickyStyle',
	    value: function buildStickyStyle() {
	      var mode = this.props.mode;
	      var state = this.state;
	      var style = {
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
	  }, {
	    key: 'render',
	    value: function render() {
	      var props = this.props;
	      var _state = this.state;
	      var fixed = _state.fixed;
	      var height = _state.height;
	      var stickyClassName = props.stickyClassName;
	      var stickyStyle = props.stickyStyle;
	      var inlineStyle = props.inlineStyle;
	      var holderCmp = props.holderCmp;
	      var wrapperCmp = props.wrapperCmp;
	      var holderProps = props.holderProps;
	      var children = props.children;

	      var wrapperProps = sanitizeProps(props, stickyOwnProps);
	      // To ensure that this component becomes sticky immediately on mobile devices instead
	      // of disappearing until the scroll event completes, we add `transform: translateZ(0)`
	      // to 'kick' rendering of this element to the GPU
	      // @see http://stackoverflow.com/questions/32875046
	      var wrapperStyle = { transform: 'translateZ(0)', WebkitTransform: 'translateZ(0)' };
	      if (wrapperProps.style) {
	        wrapperStyle = _extends({ wrapperStyle: wrapperStyle }, wrapperProps.style);
	      }

	      if (fixed) {
	        wrapperProps.className += ' ' + stickyClassName;
	        if (inlineStyle) {
	          wrapperStyle = _extends({}, wrapperStyle, this.buildStickyStyle());
	        }
	        if (stickyStyle) {
	          wrapperStyle = _extends({}, wrapperStyle, stickyStyle);
	        }
	      }

	      holderProps.style = _extends({}, holderProps.style, { minHeight: height + 'px' });
	      holderProps.ref = 'holder';

	      wrapperProps.style = wrapperStyle;
	      wrapperProps.ref = 'wrapper';

	      return _react2.default.createElement(holderCmp, holderProps, _react2.default.createElement(wrapperCmp, wrapperProps, children));
	    }
	  }]);

	  return Sticky;
	}(_react.PureComponent);

	// some helpers

	Sticky.propTypes = {
	  mode: _react.PropTypes.oneOf(['top', 'bottom']),
	  inlineStyle: _react.PropTypes.bool,
	  stickyStyle: _react.PropTypes.object,
	  stickyClassName: _react.PropTypes.string,
	  boundaryElement: _react.PropTypes.string,
	  scrollElement: _react.PropTypes.string,
	  bottomOffset: _react.PropTypes.number,
	  topOffset: _react.PropTypes.number,
	  positionRecheckInterval: _react.PropTypes.number,
	  noExceptionOnMissedScrollElement: _react.PropTypes.bool,
	  wrapperCmp: _react.PropTypes.oneOfType([_react2.default.PropTypes.string, _react2.default.PropTypes.func]),
	  holderCmp: _react.PropTypes.oneOfType([_react2.default.PropTypes.string, _react2.default.PropTypes.func]),
	  holderProps: _react.PropTypes.object
	};
	Sticky.defaultProps = {
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
	};
	exports.default = Sticky;
	function getRect(el) {
	  if (el && typeof el.getBoundingClientRect === 'function') {
	    return el.getBoundingClientRect();
	  }

	  if (el === window || el === document) {
	    return { top: 0, left: 0, bottom: window.innerHeight, height: window.innerHeight, width: window.innerWidth, right: window.innerWidth };
	  }

	  return { top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0 };
	}

	function instersect(r1, r2, topOffset, bottomOffset) {
	  var r1Top = r1.top + topOffset,
	      r1Bottom = r1.bottom + bottomOffset;

	  return r1Top >= r2.top && r1Top <= r2.bottom || r1Bottom >= r2.top && r1Bottom <= r2.bottom || r1Bottom >= r2.bottom && r1Top <= r2.top;
	}

	/**
	 * Simply removes all unwanted props in order to avoid react 'unkown prop' warning
	 * @param  {Object} props     that should be sanitized
	 * @param  {Object} toRemove  array of prop names to remove
	 * @return {Object}           cloned and sanitized props
	 */
	function sanitizeProps(props, toRemove) {
	  props = _extends({}, props);
	  for (var i = 0, l = toRemove.length; i < l; i += 1) {
	    delete props[toRemove[i]];
	  }
	  return props;
	}

/***/ },
/* 4 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_4__;

/***/ },
/* 5 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_5__;

/***/ }
/******/ ])
});
;