import React, { Component } from 'react';

export function randomString() {
  return Math.random().toString(36).replace(/[^a-z]+/g, '');
}

class TestsWrapper extends Component {
  render() {
    return <div>{this.props.children}</div>
  }
}

export function emitEvent(type: string, window: any) {
  const evt = document.createEvent('Event');
  evt.initEvent(type, true, true);
  window.dispatchEvent(evt);
}
