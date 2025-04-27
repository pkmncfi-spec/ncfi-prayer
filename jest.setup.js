import '@testing-library/jest-dom';

// Mock ResizeObserver with callback functionality
class ResizeObserverMock {
  constructor(callback) {
    this.callback = callback;
    this.observables = new Map();
  }

  observe(target) {
    this.observables.set(target, {
      target,
      contentRect: {
        width: target.clientWidth || 0,
        height: target.clientHeight || 0,
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        x: 0,
        y: 0
      }
    });

    // Trigger the callback asynchronously
    queueMicrotask(() => {
      if (this.callback && this.observables.size > 0) {
        const entries = Array.from(this.observables.values());
        this.callback(entries, this);
      }
    });
  }

  unobserve(target) {
    this.observables.delete(target);
  }

  disconnect() {
    this.observables.clear();
  }
}

global.ResizeObserver = ResizeObserverMock;

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});