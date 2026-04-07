import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
} as unknown as typeof IntersectionObserver;

// Required for React's act() to work in jsdom
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

// Mock broken @untitledui/icons package
vi.mock("@untitledui/icons", () => {
  const dummyComponent = () => null;
  const moduleExports: Record<string, unknown> = {};
  const handler = {
    get: (_target: Record<string, unknown>, prop: string) => {
      if (prop === "__esModule") return true;
      if (prop === "then") return undefined; // not a thenable
      // Return a dummy React component for any icon
      if (!(prop in moduleExports)) {
        moduleExports[prop] = dummyComponent;
      }
      return moduleExports[prop];
    },
  };
  return new Proxy(moduleExports, handler);
});
