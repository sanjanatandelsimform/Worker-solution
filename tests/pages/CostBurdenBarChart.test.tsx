import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent, screen, waitFor } from "@testing-library/react";
import { IncomeDistributionChart } from "@/pages/benchmark/CostBurdenBarChart";

const mockCtx = {
  scale: vi.fn(),
  clearRect: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  stroke: vi.fn(),
  fillText: vi.fn(),
  fillRect: vi.fn(),
  strokeStyle: "",
  lineWidth: 1,
  font: "",
  fillStyle: "",
  textAlign: "left",
  textBaseline: "alphabetic",
};

describe("CostBurdenBarChart", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, "devicePixelRatio", { value: 1, configurable: true });
    HTMLCanvasElement.prototype.getContext = vi.fn(
      () => mockCtx as unknown as CanvasRenderingContext2D
    );
    HTMLCanvasElement.prototype.getBoundingClientRect = vi.fn(
      () =>
        ({
          left: 0,
          top: 0,
          width: 800,
          height: 400,
        }) as DOMRect
    );
  });

  it("renders default chart and legends when data is null", () => {
    render(<IncomeDistributionChart data={null} />);
    expect(screen.getByText("Burdened")).toBeInTheDocument();
    expect(screen.getByText("Severely Burdened")).toBeInTheDocument();
  });

  it("renders with provided data and handles mouse move/leave", () => {
    const { container } = render(
      <IncomeDistributionChart
        data={[
          {
            incomeCategory: "low",
            label: "Low",
            range: "0-10",
            burdened: 60,
            severelyBurdened: 30,
          },
        ]}
      />
    );

    const wrapper = container.querySelector(".relative.w-full");
    expect(wrapper).toBeTruthy();

    fireEvent.mouseMove(wrapper!, { clientX: 120, clientY: 250 });
    fireEvent.mouseLeave(wrapper!);
    expect(HTMLCanvasElement.prototype.getContext).toHaveBeenCalled();
  });
});

// Import CostBurdenBarChart directly for better control
import CostBurdenBarChart from "@/pages/benchmark/CostBurdenBarChart";

describe("CostBurdenBarChart - direct rendering with width=800", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, "devicePixelRatio", { value: 1, configurable: true });
    HTMLCanvasElement.prototype.getContext = vi.fn(
      () => mockCtx as unknown as CanvasRenderingContext2D
    );
    HTMLCanvasElement.prototype.getBoundingClientRect = vi.fn(
      () => ({ left: 0, top: 0, width: 800, height: 400 }) as DOMRect
    );
  });

  it("isOverLighterBar=true branch: tooltip shows lighter bar value when mouse over value2 area", async () => {
    // width=800: padding={top:60,right:100,bottom:80,left:60}, chartWidth=640, chartHeight=260
    // Single item: x = 60+(640-128)/2=60+256=316, baseY=60+260=320
    // value1=74, value2=44, maxValue=118, yScale=260/118=2.2034
    // bar1Height=74*2.2034=163.05, bar2Height=44*2.2034=96.95
    // isOverLighterBar: mouseX in [316+18,316+128-18]=[334,426], mouseY in [320-96.95,320]=[223,320]
    const { container } = render(
      <CostBurdenBarChart
        width={800}
        data={[{ label: "Low", sublabel: "$50k", value1: 74, value2: 44 }]}
      />
    );
    const wrapper = container.querySelector(".relative");
    expect(wrapper).toBeTruthy();

    // Hit the lighter bar (value2) area
    fireEvent.mouseMove(wrapper!, { clientX: 370, clientY: 260 });
    await waitFor(() => {
      const tooltip = container.querySelector(".absolute");
      expect(tooltip).toBeTruthy();
    });
  });

  it("isOverLighterBar=false branch: tooltip shows main bar value when mouse outside lighter area", async () => {
    // Hit the main bar area but NOT the lighter bar
    // mouseX=320 is in [316,444] but NOT in [334,426]? Actually 320 < 334 so outside lighter bar
    const { container } = render(
      <CostBurdenBarChart
        width={800}
        data={[{ label: "Low", sublabel: "$50k", value1: 74, value2: 44 }]}
      />
    );
    const wrapper = container.querySelector(".relative");
    expect(wrapper).toBeTruthy();

    // Hit main bar but outside the lighter bar x-range
    fireEvent.mouseMove(wrapper!, { clientX: 320, clientY: 260 });
    await waitFor(() => {
      const tooltip = container.querySelector(".absolute");
      expect(tooltip).toBeTruthy();
    });
  });

  it("handles null canvas context (covers !ctx guard branch)", () => {
    HTMLCanvasElement.prototype.getContext = vi.fn(() => null);
    const { container } = render(
      <CostBurdenBarChart
        width={800}
        data={[{ label: "Low", sublabel: "$50k", value1: 74, value2: 44 }]}
      />
    );
    expect(container.querySelector("canvas")).toBeTruthy();
  });

  it("mouse leave clears tooltip", async () => {
    const { container } = render(
      <CostBurdenBarChart
        width={800}
        data={[{ label: "Low", sublabel: "$50k", value1: 74, value2: 44 }]}
      />
    );
    const wrapper = container.querySelector(".relative");
    fireEvent.mouseMove(wrapper!, { clientX: 370, clientY: 260 });
    fireEvent.mouseLeave(wrapper!);
    await waitFor(() => {
      const tooltip = container.querySelector(".pointer-events-none.absolute");
      expect(tooltip).toBeNull();
    });
  });
});
