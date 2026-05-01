/**
 * SalaryHourlyChartsView Tests
 * Covers HourlyChart, SalaryChart, and SalaryHourlyComparisonChart mouse handlers
 */
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import HourlyChart from "@/pages/benchmark/SalaryHourlyCharts/SalaryHourlyChartsView/HourlyChart";
import SalaryChart from "@/pages/benchmark/SalaryHourlyCharts/SalaryHourlyChartsView/SalaryChart";
import SalaryHourlyComparisonChart from "@/pages/benchmark/SalaryHourlyCharts/SalaryHourlyChartsView/SalaryHourlyComparisonChart";

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
  textAlign: "left" as CanvasTextAlign,
  textBaseline: "alphabetic" as CanvasTextBaseline,
};

describe("SalaryHourlyChartsView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    HTMLCanvasElement.prototype.getContext = vi.fn(
      () => ctx as unknown as CanvasRenderingContext2D
    );
    HTMLCanvasElement.prototype.getBoundingClientRect = vi.fn(
      () =>
        ({
          left: 0,
          top: 0,
          width: 500,
          height: 350,
          right: 500,
          bottom: 350,
          x: 0,
          y: 0,
          toJSON: vi.fn(),
        }) as DOMRect
    );
  });

  describe("HourlyChart", () => {
    const data = { industryAverage: 15, nationalAverage: 18 };

    it("renders without crashing", () => {
      const { container } = render(<HourlyChart data={data} />);
      const canvas = container.querySelector("canvas");
      expect(canvas).toBeTruthy();
    });

    it("renders canvas with custom width/height", () => {
      const { container } = render(<HourlyChart data={data} width={400} height={300} />);
      const canvas = container.querySelector("canvas");
      expect(canvas).toBeTruthy();
    });

    it("shows tooltip on mouse move inside a bar hit area", () => {
      const { container } = render(<HourlyChart data={data} />);
      const canvas = container.querySelector("canvas")!;

      // Manually set hitAreas on canvas to simulate drawing
      (canvas as any).hitAreas = {
        industryBar: {
          x: 200,
          y: 100,
          width: 40,
          height: 100,
          value: 15,
          color: "#7ECCC4",
          label: "State average",
        },
      };

      fireEvent.mouseMove(canvas, { clientX: 220, clientY: 150 });
      // Tooltip should appear
      expect(screen.queryByText("State average")).toBeTruthy();
    });

    it("clears tooltip on mouse leave", () => {
      const { container } = render(<HourlyChart data={data} />);
      const canvas = container.querySelector("canvas")!;

      // Set hitAreas first
      (canvas as any).hitAreas = {
        industryBar: {
          x: 200,
          y: 100,
          width: 40,
          height: 100,
          value: 15,
          color: "#7ECCC4",
          label: "State average",
        },
      };

      // Show tooltip
      fireEvent.mouseMove(canvas, { clientX: 220, clientY: 150 });
      // Hide tooltip
      fireEvent.mouseLeave(canvas);
      // Tooltip should be gone
      expect(screen.queryByText("State average")).toBeNull();
    });

    it("handles mouse move when canvas has no hitAreas", () => {
      const { container } = render(<HourlyChart data={data} />);
      const canvas = container.querySelector("canvas")!;
      // No hitAreas set - should not throw
      expect(() => fireEvent.mouseMove(canvas, { clientX: 100, clientY: 100 })).not.toThrow();
    });

    it("handles null canvas context gracefully (covers !ctx guard branch)", () => {
      HTMLCanvasElement.prototype.getContext = vi.fn(() => null);
      const { container } = render(<HourlyChart data={data} />);
      const canvas = container.querySelector("canvas");
      expect(canvas).toBeTruthy();
      // hitAreas never set when ctx=null, mouseMove returns early
      expect(() => fireEvent.mouseMove(canvas!, { clientX: 100, clientY: 100 })).not.toThrow();
    });

    it("handles mouse move outside bar areas (no tooltip)", () => {
      const { container } = render(<HourlyChart data={data} />);
      const canvas = container.querySelector("canvas")!;

      (canvas as any).hitAreas = {
        industryBar: {
          x: 200,
          y: 100,
          width: 40,
          height: 100,
          value: 15,
          color: "#7ECCC4",
          label: "State average",
        },
      };
      // Mouse outside hit area
      fireEvent.mouseMove(canvas, { clientX: 50, clientY: 50 });
      expect(screen.queryByText("State average")).toBeNull();
    });

    it("shows national average tooltip", () => {
      const { container } = render(<HourlyChart data={data} />);
      const canvas = container.querySelector("canvas")!;

      (canvas as any).hitAreas = {
        nationalBar: {
          x: 260,
          y: 80,
          width: 40,
          height: 120,
          value: 18,
          color: "#4B8F87",
          label: "National average",
        },
      };

      fireEvent.mouseMove(canvas, { clientX: 280, clientY: 130 });
      expect(screen.queryByText("National average")).toBeTruthy();
    });
  });

  describe("SalaryChart", () => {
    const data = { industryAverage: 55000, nationalAverage: 62000 };

    it("renders without crashing", () => {
      const { container } = render(<SalaryChart data={data} />);
      const canvas = container.querySelector("canvas");
      expect(canvas).toBeTruthy();
    });

    it("renders with custom width and height", () => {
      const { container } = render(<SalaryChart data={data} width={400} height={300} />);
      const canvas = container.querySelector("canvas");
      expect(canvas).toBeTruthy();
    });

    it("shows tooltip on mouse move inside a bar", () => {
      const { container } = render(<SalaryChart data={data} />);
      const canvas = container.querySelector("canvas")!;

      (canvas as any).hitAreas = {
        industryBar: {
          x: 200,
          y: 100,
          width: 40,
          height: 150,
          value: 55000,
          color: "#7ECCC4",
          label: "State average",
        },
      };

      fireEvent.mouseMove(canvas, { clientX: 220, clientY: 150 });
      expect(screen.queryByText("State average")).toBeTruthy();
    });

    it("hides tooltip on mouse leave", () => {
      const { container } = render(<SalaryChart data={data} />);
      const canvas = container.querySelector("canvas")!;

      (canvas as any).hitAreas = {
        nationalBar: {
          x: 260,
          y: 80,
          width: 40,
          height: 180,
          value: 62000,
          color: "#4B8F87",
          label: "National average",
        },
      };

      fireEvent.mouseMove(canvas, { clientX: 280, clientY: 130 });
      fireEvent.mouseLeave(canvas);
      expect(screen.queryByText("National average")).toBeNull();
    });

    it("handles mouse move when hitAreas is undefined", () => {
      const { container } = render(<SalaryChart data={data} />);
      const canvas = container.querySelector("canvas")!;
      expect(() => fireEvent.mouseMove(canvas, { clientX: 100, clientY: 100 })).not.toThrow();
    });

    it("handles null canvas context gracefully (covers !ctx guard branch)", () => {
      HTMLCanvasElement.prototype.getContext = vi.fn(() => null);
      const { container } = render(<SalaryChart data={data} />);
      const canvas = container.querySelector("canvas");
      expect(canvas).toBeTruthy();
      expect(() => fireEvent.mouseMove(canvas!, { clientX: 100, clientY: 100 })).not.toThrow();
    });

    it("shows national average tooltip for salary", () => {
      const { container } = render(<SalaryChart data={data} />);
      const canvas = container.querySelector("canvas")!;

      (canvas as any).hitAreas = {
        nationalBar: {
          x: 260,
          y: 60,
          width: 40,
          height: 200,
          value: 62000,
          color: "#4B8F87",
          label: "National average",
        },
      };

      fireEvent.mouseMove(canvas, { clientX: 280, clientY: 160 });
      expect(screen.queryByText("National average")).toBeTruthy();
    });
  });

  describe("SalaryHourlyComparisonChart", () => {
    const salaryData = { industryAverage: 55000, nationalAverage: 62000 };
    const hourlyData = { industryAverage: 15, nationalAverage: 18 };

    it("renders both salary and hourly chart sections", () => {
      render(<SalaryHourlyComparisonChart salaryData={salaryData} hourlyData={hourlyData} />);
      expect(screen.getByText("Annual Salary & Hourly Comparison")).toBeInTheDocument();
      expect(screen.getByText("Salary")).toBeInTheDocument();
      expect(screen.getByText("Hourly")).toBeInTheDocument();
    });

    it("renders default source attribution", () => {
      render(<SalaryHourlyComparisonChart salaryData={salaryData} hourlyData={hourlyData} />);
      expect(screen.getByText("Source: BLS, 2029")).toBeInTheDocument();
    });

    it("renders custom source attribution", () => {
      render(
        <SalaryHourlyComparisonChart
          salaryData={salaryData}
          hourlyData={hourlyData}
          sourceAttribution="Custom Source 2025"
        />
      );
      expect(screen.getByText("Custom Source 2025")).toBeInTheDocument();
    });

    it("renders legend items", () => {
      render(<SalaryHourlyComparisonChart salaryData={salaryData} hourlyData={hourlyData} />);
      expect(screen.getByText("State average")).toBeInTheDocument();
      expect(screen.getByText("National average")).toBeInTheDocument();
    });
  });
});
