import {expect} from 'chai';
import {spy, match} from 'sinon';
import {randomString} from '../utils';
import {unlisten, listen} from '../../src/helpers/events';

describe('helpers/events', function () {
  describe('listen', function () {
    it('should be a function', function () {
      expect(listen).to.be.a('function');
    });

    it('should register proper event listeners', function () {
      // @ts-expect-error - we don't care about the type here
      const el: Element = {addEventListener: spy()},
        events = ['event-1-' + randomString(), 'event-2-' + randomString(), 'event-3-' + randomString()];

      listen(el, events, () => null);
      expect(el.addEventListener).to.have.been
        .calledThrice
        .calledWithMatch(events[0], match.func)
        .calledWithMatch(events[1], match.func)
        .calledWithMatch(events[2], match.func);
    });

    it('should register listener only once for multiple calls', function () {
      // @ts-expect-error - we don't care about the type here
      const el: Element = {addEventListener: spy()}, event = randomString();

      listen(el, [event], () => null);
      listen(el, [event], () => null);
      listen(el, [event], () => null);
      listen(el, [event], () => null);

      expect(el.addEventListener).to.have.been
        .calledOnce
        .calledWithMatch(event, match.func);
    });


    it('should call all registered listeners with proper arguments', function () {
      let eventCallback = (_: string) => null;
      const event = randomString();

      // @ts-expect-error - we don't care about the type here
      const el : Element = {
        addEventListener: spy((e, cb) => {
          if (e === event) {
            eventCallback = cb;
          }
        })
      };

      const shouldBeCalled = [spy(), spy(), spy()];
      shouldBeCalled.forEach(listen.bind(null, el, [event]));
      const data = randomString();
      eventCallback(data);
      eventCallback(data);
      eventCallback(data);
      shouldBeCalled.forEach(cb => expect(cb).to.have.been.calledThrice.calledWithExactly(data));
    });

    it('should not call listeners registered for other events', function () {
      let eventCallback = (_: string) => null;
      const event = randomString();

      // @ts-expect-error - we don't care about the type here
      const el : Element = {
        addEventListener: spy((e, cb) => {
          if (e !== event) {
            eventCallback = cb;
          }
        })
      };

      const shouldNotBeCalled = [spy(), spy(), spy()];
      listen(el, [event + '-called'], () => null)
      shouldNotBeCalled.forEach(listen.bind(null, el, [event]));
      eventCallback(randomString());
      shouldNotBeCalled.forEach(cb => expect(cb).to.have.not.been.called);
    });
  });

  describe('unlisten', function () {
    it('should be a function', function () {
      expect(unlisten).to.be.a('function');
    });

    it('should call removeListener if last callback had been removed', function () {
      const str = randomString(),
        e1 = 'e1-' + str, e2 = 'e2-' + str, e3 = 'e3-' + str,
        cb1 = spy(), cb2 = spy(), cb3 = spy();

      const listeners: Record<string, (_: string) => null> = {};
      const deleted: Record<string, (_: string) => null> = {};

      // @ts-expect-error - we don't care about the type here
      const el : Element = {
        addEventListener: spy((e, cb) => {
          listeners[e] = cb;
        }),
        removeEventListener: spy((e, cb) => {
          if (listeners[e] === cb) {
            deleted[e] = cb;
            delete listeners[e];
          }
        })
      };

      listen(el, [e1], cb1);
      listen(el, [e2, e3], cb2);
      listen(el, [e3], cb3);

      // should ignore unknown listeners
      unlisten(el, [e1], () => null);
      expect(el.removeEventListener).to.have.not.been.called;

      // simple case
      unlisten(el, [e1], cb1);
      expect(el.removeEventListener).to.have.been.calledOnce.calledWithExactly(e1, deleted[e1]);
      //@ts-expect-error - mocks
      el.removeEventListener.resetHistory();

      // remove only one of the listeners
      unlisten(el, [e2, e3], cb2);
      expect(el.removeEventListener).to.have.been.calledOnce.calledWithExactly(e2, deleted[e2]);

      listeners[e3](randomString());
      expect(cb2).to.have.not.been.called;
      expect(cb3).to.have.been.calledOnce;

      cb3.resetHistory();
      //@ts-expect-error - mocks
      el.removeEventListener.resetHistory();

      unlisten(el, [e3], cb3);
      expect(el.removeEventListener).to.have.been.calledOnce.calledWithExactly(e3, deleted[e3]);

      expect(listeners).to.deep.equal({}, 'all listeners should have been removed')
    });

  });

});