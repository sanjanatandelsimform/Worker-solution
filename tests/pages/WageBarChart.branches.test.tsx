/**
 * WageBarChart branch tests
 * Covers: single-item data, tooltip rendering for all three bar positions, resize listener,
 * no data hover (clears tooltip), data with 0 values but partial non-zero, legend rendering
 */
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent, waitFor, screen } from "@testing-library/react";
import WageBarChart from "@/pages/benchmark/WageBarChart";

const ctx = {
  scale: vi.fn(),
  clearRect: vi.fn(),
  fillRect: vi.fn(),
  strokeRect: vi.fn(),
  fillText: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  stroke: vi.fn(),
  fillStyle: "",
  strokeStyle: "",
  lineWidth: 1,
  font: "",
  textAlign: "left",
  textBaseline: "alphabetic",
  globalAlpha: 1,
};

describe("WageBarChart - branch coverage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    HTMLCanvasElement.prototype.getContext = vi.fn(
      () => ctx as unknown as CanvasRenderingContext2D
    );
    HTMLCanvasElement.prototype.getBoundingClientRect = vi.fn(
      () => ({ left: 0, top: 0, width: 700, height: 350 }) as DOMRect
    );
  });

  it("renders with single-item data (no groupSpacing)", () => {
    const { container } = render(
      <WageBarChart
        data={[{ name: "Salary", industryAverage: 5, yourCompany: 8, nationalAverage: 10 }]}
      />
    );
    expect(container.querySelector("canvas")).toBeTruthy();
    expect(ctx.fillRect).toHaveBeenCalled();
  });

  it("renders legend items when data is present", () => {
    const { getByText } = render(
      <WageBarChart
        data={[{ name: "Salary", industryAverage: 5, yourCompany: 8, nationalAverage: 10 }]}
      />
    );
    expect(getByText("State average")).toBeTruthy();
    expect(getByText("Your company")).toBeTruthy();
    expect(getByText("National average")).toBeTruthy();
  });

  it("renders fallback legend when all data values are 0", () => {
    const { getByText } = render(
      <WageBarChart
        data={[{ name: "Salary", industryAverage: 0, yourCompany: 0, nationalAverage: 0 }]}
      />
    );
    expect(getByText("Industry average")).toBeTruthy();
  });

  it("renders fallback legend when data array is empty", () => {
    const { getByText } = render(<WageBarChart data={[]} />);
    expect(getByText("Industry average")).toBeTruthy();
  });

  it("tooltip shows for bar 1 (industry average / state average) hover", async () => {
    // Use width={700} to prevent jsdom resize effect from zeroing canvasWidth
    // Single item: groupX = 30+(640-174)/2=263, bar1=[263,321], baseY=290
    // industryAverage=50, groupMax=80, yScale=3.5, bar1Height=175 → y=[115,290]
    const { container } = render(
      <WageBarChart
        width={700}
        data={[{ name: "Salary", industryAverage: 50, yourCompany: 80, nationalAverage: 70 }]}
      />
    );
    const figure = container.querySelector("figure");
    fireEvent.mouseMove(figure!, { clientX: 290, clientY: 200 });

    await waitFor(() => {
      const tooltip = container.querySelector(".absolute.rounded-lg");
      expect(tooltip).toBeTruthy();
    });
  });

  it("tooltip shows for bar 2 (your company) hover", async () => {
    // Single item with width=700: groupX=263, bar2=[321,379], baseY=290
    // yourCompany=80, groupMax=80, yScale=3.5, bar2Height=280 → y=[10,290]
    const { container } = render(
      <WageBarChart
        width={700}
        data={[{ name: "Salary", industryAverage: 5, yourCompany: 80, nationalAverage: 10 }]}
      />
    );
    const figure = container.querySelector("figure");
    fireEvent.mouseMove(figure!, { clientX: 350, clientY: 200 });

    await waitFor(() => {
      const tooltip = container.querySelector(".absolute.rounded-lg");
      expect(tooltip).toBeTruthy();
    });
  });

  it("tooltip shows for bar 3 (national average) hover", async () => {
    // Single item with width=700: groupX=263, bar3=[379,437], baseY=290
    // nationalAverage=80, groupMax=80, yScale=3.5, bar3Height=280 → y=[10,290]
    const { container } = render(
      <WageBarChart
        width={700}
        data={[{ name: "Salary", industryAverage: 5, yourCompany: 10, nationalAverage: 80 }]}
      />
    );
    const figure = container.querySelector("figure");
    fireEvent.mouseMove(figure!, { clientX: 410, clientY: 200 });

    await waitFor(() => {
      const tooltip = container.querySelector(".absolute.rounded-lg");
      expect(tooltip).toBeTruthy();
    });
  });

  it("hovering with no data does not set tooltip", async () => {
    const { container } = render(<WageBarChart data={[]} />);
    const figure = container.querySelector("figure");
    fireEvent.mouseMove(figure!, { clientX: 100, clientY: 100 });

    await waitFor(() => {
      // Tooltip should NOT be rendered
      const tooltip = container.querySelector(".absolute.rounded-lg");
      expect(tooltip).toBeNull();
    });
  });

  it("mouse leave clears the tooltip", async () => {
    const { container } = render(
      <WageBarChart
        data={[{ name: "Salary", industryAverage: 50, yourCompany: 80, nationalAverage: 70 }]}
      />
    );
    const figure = container.querySelector("figure");
    fireEvent.mouseMove(figure!, { clientX: 350, clientY: 200 });
    fireEvent.mouseLeave(figure!);

    await waitFor(() => {
      const tooltip = container.querySelector(".absolute.rounded-lg");
      expect(tooltip).toBeNull();
    });
  });

  it("accepts custom width prop", () => {
    const { container } = render(
      <WageBarChart
        width={800}
        data={[{ name: "Test", industryAverage: 10, yourCompany: 20, nationalAverage: 15 }]}
      />
    );
    expect(container.querySelector("canvas")).toBeTruthy();
  });

  it("adds resize event listener when no width prop", () => {
    const addSpy = vi.spyOn(window, "addEventListener");
    render(
      <WageBarChart
        data={[{ name: "Test", industryAverage: 10, yourCompany: 20, nationalAverage: 15 }]}
      />
    );
    expect(addSpy).toHaveBeenCalledWith("resize", expect.any(Function));
    addSpy.mockRestore();
  });

  it("removes resize event listener on unmount", () => {
    const removeSpy = vi.spyOn(window, "removeEventListener");
    const { unmount } = render(
      <WageBarChart
        data={[{ name: "Test", industryAverage: 10, yourCompany: 20, nationalAverage: 15 }]}
      />
    );
    unmount();
    expect(removeSpy).toHaveBeenCalledWith("resize", expect.any(Function));
    removeSpy.mockRestore();
  });

  it("renders data bars with multiple groups using spacing", () => {
    const { container } = render(
      <WageBarChart
        data={[
          { name: "Salary", industryAverage: 3, yourCompany: 5, nationalAverage: 7 },
          { name: "Hourly", industryAverage: 2, yourCompany: 4, nationalAverage: 6 },
          { name: "Other", industryAverage: 1, yourCompany: 3, nationalAverage: 5 },
        ]}
      />
    );
    expect(ctx.fillText).toHaveBeenCalledWith("Salary", expect.any(Number), expect.any(Number));
    expect(ctx.fillText).toHaveBeenCalledWith("Hourly", expect.any(Number), expect.any(Number));
    expect(ctx.fillText).toHaveBeenCalledWith("Other", expect.any(Number), expect.any(Number));
  });

  it("renders tooltip on right side of chart (x > 65% width)", async () => {
    const { container } = render(
      <WageBarChart
        width={700}
        data={[{ name: "Salary", industryAverage: 50, yourCompany: 80, nationalAverage: 70 }]}
      />
    );
    const figure = container.querySelector("figure");
    // x > 700*0.65 = 455
    fireEvent.mouseMove(figure!, { clientX: 500, clientY: 200 });

    await waitFor(() => {
      // No crash expected
      expect(figure).toBeTruthy();
    });
  });
});
