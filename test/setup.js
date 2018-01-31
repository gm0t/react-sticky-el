import { JSDOM } from 'jsdom';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({ adapter: new Adapter() });

// Chai initialization
chai.use(sinonChai);
// chai.should();

// JSDOM initialization
function copyProps(src, target) {
  const props = Object.getOwnPropertyNames(src)
    .filter(prop => typeof target[prop] === 'undefined')
    .reduce((result, prop) => ({
      ...result,
      [prop]: Object.getOwnPropertyDescriptor(src, prop),
    }), {});
  Object.defineProperties(target, props);
}

const dom = new JSDOM(`<body><div id="app"></div></body>`);
global.window = dom.window;
global.document = global.window.document;
global.navigator = window.navigator;
copyProps(window, global);
