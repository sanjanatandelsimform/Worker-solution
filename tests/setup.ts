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

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
} as unknown as typeof ResizeObserver;

// Required for React's act() to work in jsdom
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

// Mock scrollIntoView which is not implemented in jsdom
Element.prototype.scrollIntoView = vi.fn();

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

// Mock HTMLCanvasElement.getContext for canvas-based chart components
HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
  scale: vi.fn(),
  clearRect: vi.fn(),
  fillRect: vi.fn(),
  strokeRect: vi.fn(),
  fillText: vi.fn(),
  measureText: vi.fn().mockReturnValue({ width: 50 }),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  arc: vi.fn(),
  closePath: vi.fn(),
  fill: vi.fn(),
  stroke: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
  setTransform: vi.fn(),
  drawImage: vi.fn(),
  createLinearGradient: vi.fn().mockReturnValue({ addColorStop: vi.fn() }),
  createRadialGradient: vi.fn().mockReturnValue({ addColorStop: vi.fn() }),
  createPattern: vi.fn(),
  clip: vi.fn(),
  translate: vi.fn(),
  rotate: vi.fn(),
  rect: vi.fn(),
  quadraticCurveTo: vi.fn(),
  bezierCurveTo: vi.fn(),
  globalAlpha: 1,
  globalCompositeOperation: "source-over",
  fillStyle: "",
  strokeStyle: "",
  lineWidth: 1,
  lineCap: "butt",
  lineJoin: "miter",
  font: "10px sans-serif",
  textAlign: "start",
  textBaseline: "alphabetic",
  shadowBlur: 0,
  shadowColor: "rgba(0, 0, 0, 0)",
  shadowOffsetX: 0,
  shadowOffsetY: 0,
}) as unknown as typeof HTMLCanvasElement.prototype.getContext;

// Mock react-loader-spinner which uses styled-components not compatible with jsdom
vi.mock("react-loader-spinner", () => ({
  Oval: (props: Record<string, unknown>) => {
    const React = require("react");
    return React.createElement("div", {
      "data-testid": "loading-spinner",
      "aria-label": props.ariaLabel || "loading",
    });
  },
}));
