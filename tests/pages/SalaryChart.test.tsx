/**
 * SalaryChart Component Tests
 *
 * Covers: DOM structure, canvas context setup, drawing calls,
 * resize event handling, and edge cases (empty data, null context).
 */
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import SalaryRangeChart from "@/pages/workforce/SalaryChart";

// ── Canvas context mock factory ───────────────────────────────────────────────
const makeMockCtx = () => ({
  scale: vi.fn(),
  clearRect: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  stroke: vi.fn(),
  fillText: vi.fn(),
  fillRect: vi.fn(),
  strokeRect: vi.fn(),
  strokeStyle: "" as string | CanvasGradient | CanvasPattern,
  fillStyle: "" as string | CanvasGradient | CanvasPattern,
  lineWidth: 1,
  font: "",
  textAlign: "center" as CanvasTextAlign,
});

// ── Fixtures ──────────────────────────────────────────────────────────────────
const sampleData = [
  { label: "IT", boxStart: 80, boxEnd: 120, max: 150, min: 60 },
  { label: "HR", boxStart: 70, boxEnd: 110, max: 140, min: 50 },
  { label: "Finance", boxStart: 90, boxEnd: 130, max: 160, min: 70 },
];

const singleItem = [{ label: "Engineering", boxStart: 100, boxEnd: 200, max: 250, min: 80 }];

// ── Tests ─────────────────────────────────────────────────────────────────────
describe("SalaryRangeChart", () => {
  let mockCtx: ReturnType<typeof makeMockCtx>;
  let getContextSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    mockCtx = makeMockCtx();
    getContextSpy = vi
      .spyOn(HTMLCanvasElement.prototype, "getContext")
      .mockReturnValue(mockCtx as unknown as CanvasRenderingContext2D);
  });

  afterEach(() => {
    getContextSpy.mockRestore();
  });

  // ── DOM structure ──────────────────────────────────────────────────────────
  describe("DOM structure", () => {
    it("renders the outer wrapper with w-full class", () => {
      const { container } = render(<SalaryRangeChart data={sampleData} />);
      const outerDiv = container.firstChild as HTMLElement;
      expect(outerDiv.tagName).toBe("DIV");
      expect(outerDiv.className).toContain("w-full");
    });

    it("renders a canvas element", () => {
      const { container } = render(<SalaryRangeChart data={sampleData} />);
      const canvas = container.querySelector("canvas");
      expect(canvas).not.toBeNull();
    });

    it("canvas has display block style", () => {
      const { container } = render(<SalaryRangeChart data={sampleData} />);
      const canvas = container.querySelector("canvas") as HTMLCanvasElement;
      expect(canvas.style.display).toBe("block");
    });

    it("container div has a fixed height of 450px", () => {
      const { container } = render(<SalaryRangeChart data={sampleData} />);
      // The containerRef div is the direct parent of the canvas element
      const canvas = container.querySelector("canvas") as HTMLCanvasElement;
      const innerDiv = canvas.parentElement as HTMLElement;
      expect(innerDiv.style.height).toBe("450px");
    });
  });

  // ── Canvas context ─────────────────────────────────────────────────────────
  describe("canvas context initialisation", () => {
    it("calls getContext with '2d' on mount", () => {
      render(<SalaryRangeChart data={sampleData} />);
      expect(getContextSpy).toHaveBeenCalledWith("2d");
    });

    it("does not throw when getContext returns null", () => {
      getContextSpy.mockReturnValue(null);
      expect(() => render(<SalaryRangeChart data={sampleData} />)).not.toThrow();
    });

    it("skips all drawing when getContext returns null", () => {
      getContextSpy.mockReturnValue(null);
      render(<SalaryRangeChart data={sampleData} />);
      expect(mockCtx.clearRect).not.toHaveBeenCalled();
    });
  });

  // ── Drawing calls ──────────────────────────────────────────────────────────
  describe("drawing behaviour", () => {
    it("calls clearRect on initial draw", () => {
      render(<SalaryRangeChart data={sampleData} />);
      expect(mockCtx.clearRect).toHaveBeenCalledTimes(1);
    });

    it("calls scale for HiDPI setup", () => {
      render(<SalaryRangeChart data={sampleData} />);
      expect(mockCtx.scale).toHaveBeenCalledTimes(1);
    });

    it("calls beginPath at least once per draw", () => {
      render(<SalaryRangeChart data={sampleData} />);
      expect(mockCtx.beginPath).toHaveBeenCalled();
    });

    it("calls stroke for grid lines and whiskers", () => {
      render(<SalaryRangeChart data={sampleData} />);
      expect(mockCtx.stroke).toHaveBeenCalled();
    });

    it("calls fillRect once per data item (box)", () => {
      render(<SalaryRangeChart data={sampleData} />);
      // One fillRect call per item
      expect(mockCtx.fillRect).toHaveBeenCalledTimes(sampleData.length);
    });

    it("calls strokeRect once per data item (box border)", () => {
      render(<SalaryRangeChart data={sampleData} />);
      expect(mockCtx.strokeRect).toHaveBeenCalledTimes(sampleData.length);
    });

    it("renders dollar-sign grid labels via fillText", () => {
      render(<SalaryRangeChart data={sampleData} />);
      // Grid draws $0, $100, $200, $300, $400, $500; bars also add dollar labels
      const dollarLabelCalls = mockCtx.fillText.mock.calls.filter(([text]) =>
        /^\$\d+$/.test(String(text))
      );
      // At minimum the 6 grid labels must be present
      expect(dollarLabelCalls.length).toBeGreaterThanOrEqual(6);
    });

    it("renders each item label via fillText", () => {
      render(<SalaryRangeChart data={sampleData} />);
      const labelTexts = mockCtx.fillText.mock.calls.map(([text]) => String(text));
      sampleData.forEach(item => {
        expect(labelTexts).toContain(item.label);
      });
    });

    it("renders boxEnd value label above each bar", () => {
      render(<SalaryRangeChart data={singleItem} />);
      const calls = mockCtx.fillText.mock.calls.map(([text]) => String(text));
      expect(calls).toContain(`$${singleItem[0].boxEnd}`);
    });

    it("renders boxStart value label below each bar", () => {
      render(<SalaryRangeChart data={singleItem} />);
      const calls = mockCtx.fillText.mock.calls.map(([text]) => String(text));
      expect(calls).toContain(`$${singleItem[0].boxStart}`);
    });
  });

  // ── Empty data ─────────────────────────────────────────────────────────────
  describe("empty data", () => {
    it("renders without crashing when data is empty", () => {
      expect(() => render(<SalaryRangeChart data={[]} />)).not.toThrow();
    });

    it("still calls clearRect with empty data", () => {
      render(<SalaryRangeChart data={[]} />);
      expect(mockCtx.clearRect).toHaveBeenCalledTimes(1);
    });

    it("does not call fillRect with empty data", () => {
      render(<SalaryRangeChart data={[]} />);
      expect(mockCtx.fillRect).not.toHaveBeenCalled();
    });
  });

  // ── Resize event listener ──────────────────────────────────────────────────
  describe("resize event listener", () => {
    it("adds a resize listener on mount", () => {
      const addSpy = vi.spyOn(window, "addEventListener");
      render(<SalaryRangeChart data={sampleData} />);
      expect(addSpy).toHaveBeenCalledWith("resize", expect.any(Function));
      addSpy.mockRestore();
    });

    it("removes the resize listener on unmount", () => {
      const removeSpy = vi.spyOn(window, "removeEventListener");
      const { unmount } = render(<SalaryRangeChart data={sampleData} />);
      unmount();
      expect(removeSpy).toHaveBeenCalledWith("resize", expect.any(Function));
      removeSpy.mockRestore();
    });

    it("redraws when a resize event fires", () => {
      render(<SalaryRangeChart data={sampleData} />);
      const beforeCallCount = mockCtx.clearRect.mock.calls.length;
      act(() => {
        window.dispatchEvent(new Event("resize"));
      });
      expect(mockCtx.clearRect.mock.calls.length).toBeGreaterThan(beforeCallCount);
    });
  });

  // ── Data updates ───────────────────────────────────────────────────────────
  describe("data prop updates", () => {
    it("redraws when the data prop changes", () => {
      const { rerender } = render(<SalaryRangeChart data={singleItem} />);
      const callsBefore = mockCtx.clearRect.mock.calls.length;

      rerender(<SalaryRangeChart data={sampleData} />);
      expect(mockCtx.clearRect.mock.calls.length).toBeGreaterThan(callsBefore);
    });

    it("draws the correct number of bars after a data update", () => {
      const { rerender } = render(<SalaryRangeChart data={singleItem} />);
      mockCtx.fillRect.mockClear();

      rerender(<SalaryRangeChart data={sampleData} />);
      expect(mockCtx.fillRect).toHaveBeenCalledTimes(sampleData.length);
    });
  });
});
