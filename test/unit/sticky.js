import React, { Component } from 'react';
import ReactTestUtils, { isCompositeComponentWithType } from 'react-addons-test-utils';
import { expect } from 'chai';
import { mount, unmountAll } from '../utils';
import { spy, match } from 'sinon';
import { randomString } from '../utils';
import * as events from '../../src/helpers/events';
let listen = spy(events.listen), unlisten = spy(events.unlisten);

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
  });

  afterEach(() => {
    unmountAll();
    listen.reset();
    unlisten.reset();
  });

  describe('event handlers', function() {
    it('should remove all event listeners on unmount', function () {
      listen.reset();
      unlisten.reset();

      mountSticky();
      unmountAll();

      expect(unlisten.callCount).to.be.eql(listen.callCount);
      for (let i = 0, l = listen.callCount; i < l; i += 1) {
        let args = listen.getCall(i).args;
        expect(unlisten).to.have.been.calledWithExactly(args[0], args[1], args[2]);
      }
    });

    it('should listen for scroll, resize, pageshow, load events on window', function () {
      let { sticky } = mountSticky();
      expect(listen).have.been.calledWithMatch(
        match(value => value === window, 'window'),
        createMatch(['scroll', 'resize', 'pageshow', 'load']),
        match(cb => cb === sticky.checkPosition, 'this.checkPosition')
      );
    });

    it('should listen for scroll event on scrollElement', function () {
      let { sticky } = mountSticky({scrollElement: '#scrollarea'});
      expect(listen).have.been.calledWithMatch(
        match(el => el === document.getElementById('scrollarea'), 'div#scrollarea'),
        createMatch(['scroll']),
        match(cb => cb === sticky.checkPosition, 'this.checkPosition')
      );
    });
  });

  describe('holder', function() {
    createComponentChecks('holder');

    it('should receive holderProps', function () {
      let props = {'data-test-1': randomString(), 'data-test-2': randomString()};
      let resultProps = mountSticky({holderProps: props}).holder.props;
      expect(resultProps).to.have.property('data-test-1', props['data-test-1']);
      expect(resultProps).to.have.property('data-test-2', props['data-test-2']);
    });

  });

  describe('wrapper', function() {
    createComponentChecks('wrapper');

    it('should receive sanitized props passed to Sticky', function () {
      let props = {
        'data-test-1': randomString(),
        'data-test-2': randomString(),
        className: randomString(),
        mode: 'top',
        positionRecheckInterval: 123
      };
      let wraperProps = mountSticky(props).wrapper.props,
        keys = Object.keys(wraperProps);

      expect(keys.length).to.be.equal(5);
      expect(wraperProps).to.have.property('data-test-1', props['data-test-1']);
      expect(wraperProps).to.have.property('data-test-2', props['data-test-2']);
      expect(wraperProps).to.have.property('className', props.className);
      expect(wraperProps).to.have.property('style');
      expect(wraperProps).to.have.property('children');
    });

    it('should ', function () {

    });
  });


  describe('description', function() {

  });

});


function createMatch(arr) {
  return match(value => {
    return value instanceof Array && arr.every(v => value.indexOf(v) !== -1);
  }, '[' + arr.join(',') + ']');
}

function mountSticky(props = {}) {
  props = {wrapperCmp: StickyTestWrapper, holderCmp: StickyTestHolder, ...props};
  let tree = mount(
      <div id="scrollarea">
        <Sticky {...props}><StickyTestContent /></Sticky>
      </div>
    );

  let sticky = ReactTestUtils.findRenderedComponentWithType(tree, Sticky),
    content = ReactTestUtils.scryRenderedComponentsWithType(tree, StickyTestContent)[0],
    wrapper = ReactTestUtils.scryRenderedComponentsWithType(tree, props.wrapperCmp)[0],
    holder = ReactTestUtils.scryRenderedComponentsWithType(tree, props.holderCmp)[0];

  return {
    sticky,
    content,
    wrapper,
    holder,
    tree,
    wrapperCmp: props.wrapperCmp,
    holderCmp: props.holderCmp
  };
}

function createComponentChecks(cmp) {
  it(`should accept custom component as ${cmp}Cmp`, function () {
    let mounted = mountSticky();
    expect(isCompositeComponentWithType(mounted[cmp], mounted[cmp + 'Cmp'])).to.be.true;
  });

  it(`should accept tag name as ${cmp}Cmp`, function () {
    let props = {};
    props[cmp + 'Cmp'] = 'blockquote';
    let { sticky } = mountSticky(props);
    expect(() => ReactTestUtils.findRenderedDOMComponentWithTag(sticky, 'blockquote')).to.not.Throw();
  });
}