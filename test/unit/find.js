import { expect } from 'chai';
import { stub } from 'sinon';
import { randomString } from '../utils';
import find from '../../src/helpers/find';



describe('helpers/find', function() {
  beforeEach(() => {
    stub(document, 'getElementById');
  });

  afterEach(() => {
    document.getElementById.restore();
  });

  it('should be a function', function () {
    expect(find).to.be.a('function');
  });

  describe('basic selectors', function() {
    it('body', function () {
      expect(find('body')).to.be.equal(document.body);
    });

    it('window', function () {
      expect(find('window')).to.be.equal(window);
    });

    it('document', function () {
      expect(find('document')).to.be.equal(document);
    });
  });

  it('should use getElementById for #{something} selectors', function () {
    var el = randomString(),
      selector = randomString();
    document.getElementById.returns(el)
    expect(find('#' + selector)).to.be.equal(el);
    expect(document.getElementById).to.have.been.calledOnce.calledWithExactly(selector)
  });

// selector by testing the element itself and traversing up through its ancestors in the DOM tree.

  var createFakeTree = (depth, matches) => {
    if (depth < 0) return null;
    return {
      parentElement: createFakeTree(depth - 1, matches),
      matches: stub().returns(matches === undefined ? depth === 0 : matches)
    }
  };

  it('should traversing up through element\'s ancestors in the DOM tree and testing them using "matches"', function () {
    var el = createFakeTree(5),
      selector = '.' + randomString(),
      result = find(selector, el);


    var topParent;
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