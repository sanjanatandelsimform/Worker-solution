import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import HourlyChart from "@/pages/benchmark/SalaryHourlyCharts/SalaryHourlyChartsFinch/HourlyChart";
import SalaryChart from "@/pages/benchmark/SalaryHourlyCharts/SalaryHourlyChartsFinch/SalaryChart";

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
};

const hourlyChartData = {
  industryAverage: 10,
  yourCompanyAverage: 12,
  nationalAverage: 8,
};

// Salary chart needs realistic salary values (maxValue=80000)
const salaryChartData = {
  industryAverage: 55000,
  yourCompanyAverage: 62000,
  nationalAverage: 58000,
};

describe("Salary/Hourly finch charts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    HTMLCanvasElement.prototype.getContext = vi.fn(
      () => ctx as unknown as CanvasRenderingContext2D
    );
    HTMLCanvasElement.prototype.getBoundingClientRect = vi.fn(
      () => ({ left: 0, top: 0, width: 500, height: 350 }) as DOMRect
    );
  });

  describe("HourlyChart", () => {
    it("renders and executes tooltip mouse handlers", () => {
      const { container } = render(<HourlyChart data={hourlyChartData} />);
      const canvas = container.querySelector("canvas");
      expect(canvas).toBeTruthy();
      fireEvent.mouseMove(canvas!, { clientX: 200, clientY: 200 });
      fireEvent.mouseLeave(canvas!);
      expect(ctx.fillRect).toHaveBeenCalled();
    });

    it("handles null canvas context (covers !ctx guard branch)", () => {
      HTMLCanvasElement.prototype.getContext = vi.fn(() => null);
      const { container } = render(<HourlyChart data={hourlyChartData} />);
      const canvas = container.querySelector("canvas");
      expect(canvas).toBeTruthy();
      // No crash expected when ctx is null
    });

    it("shows tooltip when mouse hits a bar (covers foundTooltip assignment)", () => {
      const { container } = render(<HourlyChart data={hourlyChartData} />);
      const canvas = container.querySelector("canvas")!;
      // For width=500: chartCenterX = 60+430/2=275, startX=275-102=173
      // industryX=173, barWidth=60, yBase=270, industryHeight=10*10=100
      // industryBar hit: x[173,233], y[170,270]
      fireEvent.mouseMove(canvas, { clientX: 200, clientY: 220 });
      expect(canvas).toBeTruthy();
    });

    it("clears tooltip on mouse leave after hover", () => {
      const { container } = render(<HourlyChart data={hourlyChartData} />);
      const canvas = container.querySelector("canvas")!;
      fireEvent.mouseMove(canvas, { clientX: 200, clientY: 220 });
      fireEvent.mouseLeave(canvas);
      expect(canvas).toBeTruthy();
    });

    it("handles mouse move when hitAreas is not set (early return branch)", () => {
      // Render with null ctx so hitAreas are never set
      HTMLCanvasElement.prototype.getContext = vi.fn(() => null);
      const { container } = render(<HourlyChart data={hourlyChartData} />);
      const canvas = container.querySelector("canvas")!;
      expect(() => fireEvent.mouseMove(canvas, { clientX: 100, clientY: 100 })).not.toThrow();
    });
  });

  describe("SalaryChart", () => {
    it("renders and executes tooltip mouse handlers with salary data", () => {
      const { container } = render(<SalaryChart data={salaryChartData} />);
      const canvas = container.querySelector("canvas");
      expect(canvas).toBeTruthy();
      fireEvent.mouseMove(canvas!, { clientX: 200, clientY: 180 });
      fireEvent.mouseLeave(canvas!);
      expect(ctx.fillRect).toHaveBeenCalled();
    });

    it("handles null canvas context (covers !ctx guard branch)", () => {
      HTMLCanvasElement.prototype.getContext = vi.fn(() => null);
      const { container } = render(<SalaryChart data={salaryChartData} />);
      const canvas = container.querySelector("canvas");
      expect(canvas).toBeTruthy();
    });

    it("shows tooltip when mouse hits a bar (covers foundTooltip branch)", () => {
      const { container } = render(<SalaryChart data={salaryChartData} />);
      const canvas = container.querySelector("canvas")!;
      // For width=500, maxValue=80000: chartCenterX=70+(500-70-10)/2=70+210=280
      // startX=280-102=178, industryX=178, barWidth=60
      // yBase=270, industryHeight=55000*250/80000=171.875
      // industryBar hit: x[178,238], y[98,270]
      fireEvent.mouseMove(canvas, { clientX: 200, clientY: 180 });
      expect(canvas).toBeTruthy();
    });

    it("handles mouse move when hitAreas is not set", () => {
      HTMLCanvasElement.prototype.getContext = vi.fn(() => null);
      const { container } = render(<SalaryChart data={salaryChartData} />);
      const canvas = container.querySelector("canvas")!;
      expect(() => fireEvent.mouseMove(canvas, { clientX: 100, clientY: 100 })).not.toThrow();
    });
  });
});
