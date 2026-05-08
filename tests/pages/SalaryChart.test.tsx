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
      // sampleData max=160 → maxValue=300 (gap 40<70 → bump to next 100)
      // grid draws $100, $200, $300; bars add 6 more dollar labels (boxEnd + boxStart per item)
      const dollarLabelCalls = mockCtx.fillText.mock.calls.filter(([text]) =>
        /^\$\d+$/.test(String(text))
      );
      // 3 grid labels + 6 bar labels = 9 total; at least 6 must be present
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

  // ── Dynamic scale (US1) ────────────────────────────────────────────────────
  describe("dynamic scale", () => {
    it("uses maxValue = 700 when data max is 545 (gap 55 < 70 → bumps to next 100)", () => {
      const data = [{ label: "A", boxStart: 400, boxEnd: 500, min: 300, max: 545 }];
      render(<SalaryRangeChart data={data} />);
      const allTexts = mockCtx.fillText.mock.calls.map(([text]) => String(text));
      expect(allTexts).toContain("$700");
      expect(allTexts).not.toContain("$800");
    });

    it("draws exactly 7 grid lines when data max is 545 (maxValue = 700)", () => {
      const data = [{ label: "A", boxStart: 400, boxEnd: 500, min: 300, max: 545 }];
      render(<SalaryRangeChart data={data} />);
      // Grid fillText is called with x === 30; bar labels use a computed x
      const gridLabels = mockCtx.fillText.mock.calls.filter(([, x]) => x === 30);
      expect(gridLabels).toHaveLength(7);
    });

    it("uses maxValue = 800 when data max is exactly 700 (gap 0 < 70 → bumps to next 100)", () => {
      const data = [{ label: "A", boxStart: 400, boxEnd: 600, min: 300, max: 700 }];
      render(<SalaryRangeChart data={data} />);
      const allTexts = mockCtx.fillText.mock.calls.map(([text]) => String(text));
      expect(allTexts).toContain("$800");
      expect(allTexts).not.toContain("$900");
      const gridLabels = mockCtx.fillText.mock.calls.filter(([, x]) => x === 30);
      expect(gridLabels).toHaveLength(8);
    });

    it("falls back to maxValue = 100 and 1 grid line when data is empty", () => {
      render(<SalaryRangeChart data={[]} />);
      const allTexts = mockCtx.fillText.mock.calls.map(([text]) => String(text));
      expect(allTexts).toContain("$100");
      const gridLabels = mockCtx.fillText.mock.calls.filter(([, x]) => x === 30);
      expect(gridLabels).toHaveLength(1);
    });

    it("bumps to next 100 when data max is an exact multiple (gap 0 < 70)", () => {
      // dataMax=600 → rounded=600, gap=0 < 70 → maxValue=700
      const data = [{ label: "A", boxStart: 400, boxEnd: 550, min: 300, max: 600 }];
      render(<SalaryRangeChart data={data} />);
      const allTexts = mockCtx.fillText.mock.calls.map(([text]) => String(text));
      expect(allTexts).toContain("$700");
      expect(allTexts).not.toContain("$800");
      const gridLabels = mockCtx.fillText.mock.calls.filter(([, x]) => x === 30);
      expect(gridLabels).toHaveLength(7);
    });

    it("dataMax = 620 → rounded = 700 → maxValue = 850 → 8 grid lines", () => {
      // rounded + 150 = 850, rowCount = 8.5 → 8 grid lines ($100–$800)
      const data = [{ label: "A", boxStart: 400, boxEnd: 580, min: 300, max: 620 }];
      render(<SalaryRangeChart data={data} />);
      const allTexts = mockCtx.fillText.mock.calls.map(([text]) => String(text));
      expect(allTexts).toContain("$800");
      expect(allTexts).not.toContain("$900");
      const gridLabels = mockCtx.fillText.mock.calls.filter(([, x]) => x === 30);
      expect(gridLabels).toHaveLength(8);
    });

    it("bumps when gap is 69 (just below threshold): dataMax = 631 → maxValue = 800", () => {
      // dataMax=631 → rounded=700, gap=69 < 70 → maxValue=800
      const data = [{ label: "A", boxStart: 400, boxEnd: 580, min: 300, max: 631 }];
      render(<SalaryRangeChart data={data} />);
      const allTexts = mockCtx.fillText.mock.calls.map(([text]) => String(text));
      expect(allTexts).toContain("$800");
      expect(allTexts).not.toContain("$900");
      const gridLabels = mockCtx.fillText.mock.calls.filter(([, x]) => x === 30);
      expect(gridLabels).toHaveLength(8);
    });

    it("key example: dataMax = 660 → maxValue = 800 (gap 40 < 70)", () => {
      const data = [{ label: "A", boxStart: 400, boxEnd: 600, min: 300, max: 660 }];
      render(<SalaryRangeChart data={data} />);
      const allTexts = mockCtx.fillText.mock.calls.map(([text]) => String(text));
      expect(allTexts).toContain("$800");
      expect(allTexts).not.toContain("$900");
      const gridLabels = mockCtx.fillText.mock.calls.filter(([, x]) => x === 30);
      expect(gridLabels).toHaveLength(8);
    });

    it("handles data max > 700 correctly (e.g., 1050 → maxValue 1200, gap 50 < 70)", () => {
      // dataMax=1050 → rounded=1100, gap=50 < 70 → maxValue=1200
      const data = [{ label: "A", boxStart: 800, boxEnd: 1000, min: 700, max: 1050 }];
      render(<SalaryRangeChart data={data} />);
      const allTexts = mockCtx.fillText.mock.calls.map(([text]) => String(text));
      expect(allTexts).toContain("$1200");
      const gridLabels = mockCtx.fillText.mock.calls.filter(([, x]) => x === 30);
      expect(gridLabels).toHaveLength(12);
    });
  });

  // ── Null data suppression (US2) ────────────────────────────────────────────
  describe("null data suppression", () => {
    it("does not call fillRect for an all-null item", () => {
      const data = [{ label: "X", boxStart: null, boxEnd: null, max: null, min: null }];
      render(<SalaryRangeChart data={data} />);
      expect(mockCtx.fillRect).not.toHaveBeenCalled();
    });

    it("does not call strokeRect for an all-null item", () => {
      const data = [{ label: "X", boxStart: null, boxEnd: null, max: null, min: null }];
      render(<SalaryRangeChart data={data} />);
      expect(mockCtx.strokeRect).not.toHaveBeenCalled();
    });

    it("does not render any text containing 'null' for an all-null item", () => {
      const data = [{ label: "X", boxStart: null, boxEnd: null, max: null, min: null }];
      render(<SalaryRangeChart data={data} />);
      const allTexts = mockCtx.fillText.mock.calls.map(([text]) => String(text));
      allTexts.forEach(text => {
        expect(text).not.toContain("null");
      });
    });

    it("draws only valid items in a mixed dataset (1 null + 2 valid)", () => {
      const data = [
        { label: "Null", boxStart: null, boxEnd: null, max: null, min: null },
        { label: "IT", boxStart: 80, boxEnd: 120, max: 150, min: 60 },
        { label: "HR", boxStart: 70, boxEnd: 110, max: 140, min: 50 },
      ];
      render(<SalaryRangeChart data={data} />);
      expect(mockCtx.fillRect).toHaveBeenCalledTimes(2);
      expect(mockCtx.strokeRect).toHaveBeenCalledTimes(2);
    });

    it("suppresses an item with any single null field (partial null)", () => {
      const data = [{ label: "Partial", boxStart: 100, boxEnd: 200, max: null, min: 50 }];
      render(<SalaryRangeChart data={data} />);
      expect(mockCtx.fillRect).not.toHaveBeenCalled();
    });

    it("renders all items normally when dataset has no null values", () => {
      render(<SalaryRangeChart data={sampleData} />);
      expect(mockCtx.fillRect).toHaveBeenCalledTimes(sampleData.length);
      expect(mockCtx.strokeRect).toHaveBeenCalledTimes(sampleData.length);
    });

    it("renders the salary band label for an all-null item", () => {
      const data = [{ label: "X", boxStart: null, boxEnd: null, max: null, min: null }];
      render(<SalaryRangeChart data={data} />);
      const allTexts = mockCtx.fillText.mock.calls.map(([text]) => String(text));
      expect(allTexts).toContain("X");
    });

    it("renders all labels in a mixed null/valid dataset", () => {
      const data = [
        { label: "Null", boxStart: null, boxEnd: null, max: null, min: null },
        { label: "IT", boxStart: 80, boxEnd: 120, max: 150, min: 60 },
        { label: "HR", boxStart: 70, boxEnd: 110, max: 140, min: 50 },
      ];
      render(<SalaryRangeChart data={data} />);
      const allTexts = mockCtx.fillText.mock.calls.map(([text]) => String(text));
      expect(allTexts).toContain("Null");
      expect(allTexts).toContain("IT");
      expect(allTexts).toContain("HR");
    });
  });
});
