import { expect } from 'chai';
import { spy, match } from 'sinon';
import { randomString } from '../utils';
import { unlisten, listen } from '../../src/helpers/events';

describe('helpers/events', function() {
  describe('listen', function() {
    it('should be a function', function () {
      expect(listen).to.be.a('function');
    });

    it('should register proper event listeners', function () {
      var el = {addEventListener: spy() },
        events = ['event-1-' + randomString(), 'event-2-' + randomString(), 'event-3-' + randomString()];

      listen(el, events, () => {});
      expect(el.addEventListener).to.have.been
        .calledThrice
        .calledWithMatch(events[0], match.func)
        .calledWithMatch(events[1], match.func)
        .calledWithMatch(events[2], match.func);
    });

    it('should register listener only once for multiple calls', function () {
      var el = {addEventListener: spy() }, event = randomString();

      listen(el, [event], () => {});
      listen(el, [event], () => {});
      listen(el, [event], () => {});
      listen(el, [event], () => {});

      expect(el.addEventListener).to.have.been
        .calledOnce
        .calledWithMatch(event, match.func);
    });


    it('should call all registered listeners with proper arguments', function () {
      var eventCallback,
        event = randomString();

      var el = {
        addEventListener: spy((e, cb) => {
          if (e === event) {
            eventCallback = cb;
          }
        })
      };

      var shouldBeCalled = [spy(), spy(), spy()];
      shouldBeCalled.forEach(listen.bind(null, el, [event]));
      var data = randomString();
      eventCallback(data);
      eventCallback(data);
      eventCallback(data);
      shouldBeCalled.forEach(cb => expect(cb).to.have.been.calledThrice.calledWithExactly(data));
    });

    it('should not call listeners registered for other events', function () {
      var eventCallback,
        event = randomString();

      var el = {
        addEventListener: spy((e, cb) => {
          if (e !== event) {
            eventCallback = cb;
          }
        })
      };

      var shouldNotBeCalled = [spy(), spy(), spy()];
      listen(el, [event + '-called'], () => {})
      shouldNotBeCalled.forEach(listen.bind(null, el, [event]));
      eventCallback(randomString());
      shouldNotBeCalled.forEach(cb => expect(cb).to.have.not.been.called);
    });


  });

  describe('unlisten', function() {
    it('should be a function', function () {
      expect(unlisten).to.be.a('function');
    });

    it('should call removeListener if last callback had been removed', function () {
      var l1, l2, l3, str = randomString(),
        e1 = 'e1-' + str, e2 = 'e2-' + str, e3 = 'e3-' + str,
        cb1 = spy(), cb2 = spy(), cb3 = spy();

      var el = {
        addEventListener: spy((e, cb) => {
          if (e === e1) l1 = cb;
          if (e === e2) l2 = cb;
          if (e === e3) l3 = cb;
        }),
        removeEventListener: spy()
      };

      listen(el, [e1], cb1);
      listen(el, [e2, e3], cb2);
      listen(el, [e3], cb3);

      // should ignore unknown listeners
      unlisten(el, [e1], () => {});
      expect(el.removeEventListener).to.have.not.been.called;

      // simple case
      unlisten(el, [e1], cb1);
      expect(el.removeEventListener).to.have.been.calledOnce.calledWithExactly(e1, l1);
      el.removeEventListener.resetHistory();

      // remove only one of the listeners
      unlisten(el, [e2, e3], cb2);
      expect(el.removeEventListener).to.have.been.calledOnce.calledWithExactly(e2, l2);
      l3(randomString());
      expect(cb2).to.have.not.been.called;
      expect(cb3).to.have.been.calledOnce;
      cb3.resetHistory();
      el.removeEventListener.resetHistory();

      unlisten(el, [e3], cb3);
      expect(el.removeEventListener).to.have.been.calledOnce.calledWithExactly(e3, l3);

      l1(randomString());
      l2(randomString());
      l3(randomString());

      expect(cb1).to.have.not.been.called;
      expect(cb2).to.have.not.been.called;
      expect(cb3).to.have.not.been.called;
    });

  });

});