import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent } from "@testing-library/react";
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

describe("WageBarChart", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    HTMLCanvasElement.prototype.getContext = vi.fn(
      () => ctx as unknown as CanvasRenderingContext2D
    );
    HTMLCanvasElement.prototype.getBoundingClientRect = vi.fn(
      () => ({ left: 0, top: 0, width: 700, height: 350 }) as DOMRect
    );
  });

  it("renders placeholder bars when all values are zero", () => {
    const { container } = render(
      <WageBarChart
        data={[
          { name: "Salary", industryAverage: 0, yourCompany: 0, nationalAverage: 0 },
          { name: "Hourly", industryAverage: 0, yourCompany: 0, nationalAverage: 0 },
        ]}
      />
    );
    expect(container.querySelector("canvas")).toBeTruthy();
    expect(ctx.fillRect).toHaveBeenCalled();
  });

  it("renders data bars and handles hover tooltip path", () => {
    const { container } = render(
      <WageBarChart
        data={[
          { name: "Salary", industryAverage: 5, yourCompany: 8, nationalAverage: 10 },
          { name: "Hourly", industryAverage: 4, yourCompany: 6, nationalAverage: 7 },
        ]}
      />
    );
    const wrapper = container.querySelector(".flex.w-full.flex-col");
    expect(wrapper).toBeTruthy();
    fireEvent.mouseMove(wrapper!, { clientX: 120, clientY: 200 });
    fireEvent.mouseLeave(wrapper!);
    expect(ctx.strokeRect).toHaveBeenCalled();
  });
});
