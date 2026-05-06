// Global test setup: import jest-dom matchers
require('@testing-library/jest-dom');

// Fix TextEncoder/TextDecoder missing in jsdom (needed by react-router-dom v7)
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Suppress framer-motion warnings in test env
global.IS_REACT_ACT_ENVIRONMENT = true;

// Mock window.matchMedia (not available in jsdom)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Writable window.location mock — jsdom 24+ has read-only location.
// We create a plain object proxy and expose it globally so every test file
// can simply read/write window.location.href without re-defining the property.
const _locationMock = { href: 'http://localhost/' };
Object.defineProperty(window, 'location', {
  configurable: true,
  get: () => _locationMock,
  set: () => {},
});
// Expose as global so test files can call: global.resetLocation()
global.resetLocation = () => { _locationMock.href = 'http://localhost/'; };
global.getLocationHref = () => _locationMock.href;

// Mock Notification API
global.Notification = {
  permission: 'granted',
  requestPermission: jest.fn().mockResolvedValue('granted'),
};

// Silence verbose console.warn from framer-motion / react-router internals
const originalWarn = console.warn;
const originalError = console.error;
beforeAll(() => {
  console.warn = (...args) => {
    const msg = typeof args[0] === 'string' ? args[0] : '';
    if (msg.includes('framer-motion') || msg.includes('ReactDOMTestUtils')) return;
    originalWarn(...args);
  };
  // Suppress React prop warnings from the framer-motion mock leaking whileHover/whileTap
  console.error = (...args) => {
    const msg = typeof args[0] === 'string' ? args[0] : '';
    if (msg.includes('whileHover') || msg.includes('whileTap')) return;
    originalError(...args);
  };
});
afterAll(() => {
  console.warn  = originalWarn;
  console.error = originalError;
});
