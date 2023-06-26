import React from 'react';
import { expect } from 'chai';
import { mount } from 'enzyme';
import { spy, match } from 'sinon';
import { randomString } from '../utils';
import * as events from '../../src/helpers/events';

const listen = spy(events.listen);
const unlisten = spy(events.unlisten);

// @ts-expect-error -- mocks
events.rewire$listen(listen);
// @ts-expect-error -- mocks
events.rewire$unlisten(unlisten);

import Sticky, { RenderPropSticky } from '../../src/';

function StickyTestContent(props: any) {
  return <div {...props}>content</div>
}

describe('Sticky', function () {
  beforeEach(() => {
    listen.resetHistory();
    unlisten.resetHistory();
  });

  describe('event handlers', function () {
    it('should remove all event listeners on unmount', function () {
      const { unmount } = mountSticky();
      unmount();
      expect(unlisten).to.have.callCount(2);
      for (let i = 0, l = listen.callCount; i < l; i += 1) {
        const args = listen.getCall(i).args;
        expect(unlisten.getCall(i)).to.have.been.calledWithExactly(args[0], args[1], args[2]);
      }
    });

    it('should listen for scroll, resize, pageshow, load events on window by default', function () {
      const { sticky, unmount } = mountSticky();
      expect(listen).have.been.calledWithMatch(
        match(value => value === window, 'window'),
        createMatch([ 'scroll', 'resize', 'pageshow', 'load' ]),
        // @ts-expect-error -- mocks
        match(cb => cb === sticky.instance().checkPosition, 'this.checkPosition')
      );
      unmount();
    });

    it('should listen for scroll event on scrollElement', function () {
      const { sticky, unmount } = mountSticky({ scrollElement: "#scrollarea" });

      expect(listen).have.been.calledWithMatch(
        match(el => el === document.getElementById('scrollarea'), 'div#scrollarea'),
        createMatch([ 'scroll' ]),
        // @ts-expect-error -- mocks
        match(cb => cb === sticky.instance().checkPosition, 'this.checkPosition')
      );
      unmount();
    });
  });


  describe('wrapper', function () {
    it('should receive sanitized props passed to Sticky', function () {
      const props = {
        'data-test-1': randomString(),
        'data-test-2': randomString(),
        wrapperClassName: randomString(),
        mode: 'top',
        positionRecheckInterval: 123
      };
      const { unmount, wrapper } = mountSticky(props);
      const wrapperProps = wrapper.props();
      const propsCount = Object.keys(wrapperProps);

      expect(propsCount.length).to.be.equal(5);
      expect(wrapperProps).to.have.property('data-test-1', props['data-test-1']);
      expect(wrapperProps).to.have.property('data-test-2', props['data-test-2']);
      expect(wrapperProps.className.trim()).to.equal(props.wrapperClassName, 'wrapperClassName should be passed as className');
      expect(wrapperProps).to.have.property('style');
      expect(wrapperProps).to.have.property('children');
      unmount();
    });
  });

});


function createMatch(arr: any) {
  return match(value => {
    return value instanceof Array && arr.every((v: any) => value.indexOf(v) !== -1);
  }, '[' + arr.join(',') + ']');
}

function mountSticky(props = {}) {
  const tree = mount(
    <div id="scrollarea">
      <div id="boundary">
        <Sticky {...props} scrollElement="#scrollarea" boundaryElement="#boundary"><StickyTestContent /></Sticky>
      </div>
    </div>,
    { attachTo: document.getElementById("app") }
  );

  const sticky = tree.find(RenderPropSticky),
    content = tree.find(StickyTestContent),
    wrapper = sticky.children().at(0).children().at(0);

  return {
    sticky,
    content,
    wrapper,
    tree,
    unmount: tree.unmount.bind(tree)
  };
}