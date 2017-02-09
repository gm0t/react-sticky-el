import { jsdom } from 'jsdom';
import chai from 'chai';
import sinonChai from 'sinon-chai';

// Chai initialization
chai.use(sinonChai);
chai.should();

// JSDOM initialization
global.document = jsdom('<body></body>');
global.window = document.defaultView;
global.navigator = window.navigator;
