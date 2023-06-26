import {expect} from 'chai';
import {stub} from 'sinon';
import {randomString} from '../utils';
import find from '../../src/helpers/find';

describe('helpers/find', function () {
  const el: Element = {} as Element;
  beforeEach(() => {
    stub(document, 'getElementById');
  });

  afterEach(() => {
    // @ts-expect-error - we don't care about the type here
    document.getElementById.restore();
  });

  it('should be a function', function () {
    expect(find).to.be.a('function');
  });

  describe('basic selectors', function () {
    it('body', function () {
      expect(find('body', el)).to.be.equal(document.body);
    });

    it('window', function () {
      expect(find('window', el)).to.be.equal(window);
    });

    it('document', function () {
      expect(find('document', el)).to.be.equal(document);
    });
  });

  it('should use getElementById for #{something} selectors', function () {
    const expected = randomString(),
      selector = randomString();
    // @ts-expect-error - we don't care about the type here
    document.getElementById.returns(expected)
    expect(find('#' + selector, el)).to.be.equal(expected);
    expect(document.getElementById).to.have.been.calledOnce.calledWithExactly(selector)
  });

// selector by testing the element itself and traversing up through its ancestors in the DOM tree.

  const createFakeTree = (depth: number, matches?: boolean): Element => {
    return ({
      // @ts-expect-error - we don't care about the type here
      parentElement: depth > 0 ? createFakeTree(depth - 1, matches) : null,
      matches: stub().returns(matches === undefined ? depth === 0 : matches)
    })
  };

  it('should traversing up through element\'s ancestors in the DOM tree and testing them using "matches"', function () {
    let el = createFakeTree(5);
    const selector = '.' + randomString(),
      result = find(selector, el);

    let topParent;
    // @ts-expect-error - we don't care about the type here
    // eslint-disable-next-line no-cond-assign
    while (el = el.parentElement) {
      expect(el.matches).to.have.been.calledOnce.calledWithExactly(selector);
      topParent = el;
    }

    expect(result).to.be.equal(topParent);
  });

  it('should return null if element has not been found', function () {
    expect(find('.' + randomString(), createFakeTree(10, false))).to.be.equal(null);
  });
});