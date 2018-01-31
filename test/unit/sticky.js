import React, { Component } from 'react';
import { expect } from 'chai';
import { mount, shallow } from 'enzyme';
import { spy, match } from 'sinon';
import { randomString } from '../utils';
import * as events from '../../src/helpers/events';
const listen = spy(events.listen);
const unlisten = spy(events.unlisten);

events.rewire$listen(listen);
events.rewire$unlisten(unlisten);

import Sticky from '../../src/';

function StickyTestContent(props) {
  return <div {...props}>content</div>
}

class StickyTestWrapper extends Component {
  render() {
    return <div {...this.props}>{this.props.children}</div>
  }
}
class StickyTestHolder extends Component {
  render() {
    return <div {...this.props}>{this.props.children}</div>
  }
}

describe('Sticky', function() {
  beforeEach(() => {
      listen.resetHistory();
      unlisten.resetHistory();
  });

  describe('event handlers', function() {
    it('should remove all event listeners on unmount', function () {
      const { unmount } = mountSticky();
      unmount();
      expect(unlisten).to.have.callCount(2);
      for (let i = 0, l = listen.callCount; i < l; i += 1) {
        let args = listen.getCall(i).args;
        expect(unlisten.getCall(i)).to.have.been.calledWithExactly(args[0], args[1], args[2]);
      }
    });

    it('should listen for scroll, resize, pageshow, load events on window by default', function () {
      const { sticky, unmount } = mountSticky();
      expect(listen).have.been.calledWithMatch(
        match(value => value === window, 'window'),
        createMatch(['scroll', 'resize', 'pageshow', 'load']),
        match(cb => cb === sticky.instance().checkPosition, 'this.checkPosition')
      );
      unmount();
    });

    it('should listen for scroll event on scrollElement', function () {
      const { sticky, unmount } = mountSticky({ scrollElement: "#scrollarea" });

      expect(listen).have.been.calledWithMatch(
        match(el => el === document.getElementById('scrollarea'), 'div#scrollarea'),
        createMatch(['scroll']),
        match(cb => cb === sticky.instance().checkPosition, 'this.checkPosition')
      );
      unmount();
    });
  });

  describe('holder', function() {
    createComponentChecks('holder');

    it('should receive holderProps', function () {
      let props = { 'data-test-1': randomString(), 'data-test-2': randomString() };
      let { unmount, holder } = mountSticky({ holderProps: props });
      expect(holder.props()).to.have.property('data-test-1', props['data-test-1']);
      expect(holder.props()).to.have.property('data-test-2', props['data-test-2']);
      unmount();
    });
  });

  describe('wrapper', function() {
    createComponentChecks('wrapper');

    it('should receive sanitized props passed to Sticky', function () {
      const props = {
        'data-test-1': randomString(),
        'data-test-2': randomString(),
        className: randomString(),
        mode: 'top',
        positionRecheckInterval: 123
      };
      const { unmount, wrapper } = mountSticky(props);
      const wrapperProps = wrapper.props();
      const propsCount = Object.keys(wrapperProps);

      expect(propsCount.length).to.be.equal(5);
      expect(wrapperProps).to.have.property('data-test-1', props['data-test-1']);
      expect(wrapperProps).to.have.property('data-test-2', props['data-test-2']);
      expect(wrapperProps).to.have.property('className', props.className);
      expect(wrapperProps).to.have.property('style');
      expect(wrapperProps).to.have.property('children');
      unmount();
    });
  });

});


function createMatch(arr) {
  return match(value => {
    return value instanceof Array && arr.every(v => value.indexOf(v) !== -1);
  }, '[' + arr.join(',') + ']');
}

function mountSticky(props = {}) {
  props = { wrapperCmp: StickyTestWrapper, holderCmp: StickyTestHolder, ...props };

  let tree = mount(
    <div id="scrollarea"><Sticky {...props}/></div>,
    { attachTo: document.getElementById("app")}
  );

  let sticky = tree.find(Sticky),
    content = tree.find(StickyTestContent),
    wrapper = tree.find(props.wrapperCmp),
    holder = tree.find(props.holderCmp);

  return {
    sticky,
    content,
    wrapper,
    holder,
    tree,
    wrapperCmp: props.wrapperCmp,
    holderCmp: props.holderCmp,
    unmount: tree.unmount.bind(tree)
  };
}

function createComponentChecks(cmp) {
  it(`should accept custom component as ${cmp}Cmp`, function () {
    const mounted = mountSticky();
    expect(mounted[cmp].type()).to.equal(mounted[cmp + 'Cmp']);
    mounted.unmount();
  });

  it(`should accept tag name as ${cmp}Cmp`, function () {
    const mounted = mountSticky({ [cmp + 'Cmp']: 'blockquote' });
    expect(mounted[cmp].name()).to.equal('blockquote');
    mounted.unmount();
  });
}