import React, { Component } from 'react';
import ReactDOM from 'react-dom';

export function randomString() {
  return Math.random().toString(36).replace(/[^a-z]+/g, '');
}

class TestsWrapper extends Component {
  render() {
    return <div>{this.props.children}</div>
  }
}

var containers = [];
export function mount(cmp) {
  let container = document.createElement('div');
  containers.push(container);
  document.body.appendChild(container);
  return ReactDOM.render(<TestsWrapper>{cmp}</TestsWrapper>, container);
}

export function unmountAll() {
  containers.forEach(container => ReactDOM.unmountComponentAtNode(container));
  containers = [];
}

export function emitEvent(type, window) {
  let evt = document.createEvent('Event');
  evt.initEvent(type, true, true);
  window.dispatchEvent(evt);
}
