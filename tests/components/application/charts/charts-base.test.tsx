import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import {
  ChartLegendContent,
  ChartTooltipContent,
  ChartActiveDot,
} from "@/components/application/charts/charts-base";

describe("charts-base", () => {
  it("renders legend with reverse + layout/align branches", () => {
    const payload = [
      { value: "One", type: "line", color: "red", dataKey: "one", payload: { className: "dot-one" } },
      { value: "Two", type: "line", color: "blue", dataKey: "two", payload: { className: "dot-two" } },
    ];

    const { container, rerender } = render(
      <ChartLegendContent
        reversed
        payload={payload}
        layout="vertical"
        align="center"
        className="legend-extra"
      />
    );

    const items = container.querySelectorAll("li");
    expect(items.length).toBe(2);
    // reversed branch puts "Two" first
    expect(items[0].textContent).toContain("Two");
    expect(container.querySelector("ul")?.className).toContain("items-center");
    expect(container.querySelector("ul")?.className).toContain("legend-extra");

    rerender(<ChartLegendContent payload={payload} layout="horizontal" align="right" />);
    expect(container.querySelector("ul")?.className).toContain("justify-end");
  });

  it("returns null tooltip when inactive/no payload", () => {
    const { container } = render(<ChartTooltipContent active={false} payload={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders tooltip single-point radial + pie paths with formatter and labelFormatter", () => {
    const formatter = (value: any) => `F:${String(value)}`;
    const labelFormatter = (value: any) => `L:${String(value)}`;

    const { rerender } = render(
      <ChartTooltipContent
        active
        isRadialChart
        payload={[{ value: 42, payload: { name: "Workers" }, name: "Workers" }]}
        formatter={formatter}
        labelFormatter={labelFormatter}
      />
    );
    expect(screen.getByText("F:42")).toBeTruthy();
    expect(screen.getByText("L:Workers")).toBeTruthy();

    rerender(
      <ChartTooltipContent
        active
        isPieChart
        payload={[{ value: 7, name: "Slice A", payload: { name: "Ignored" } }]}
        formatter={formatter}
        labelFormatter={labelFormatter}
      />
    );
    expect(screen.getByText("F:7")).toBeTruthy();
    expect(screen.getByText("L:Slice A")).toBeTruthy();
  });

  it("renders tooltip multi-entry array branch", () => {
    render(
      <ChartTooltipContent
        active
        label="Total"
        payload={[
          { name: "A", value: 10 },
          { name: "B", value: 20 },
        ]}
      />
    );

    expect(screen.getByText("Total")).toBeTruthy();
    expect(screen.getByText("A: 10")).toBeTruthy();
    expect(screen.getByText("B: 20")).toBeTruthy();
  });

  it("renders active dot with default and explicit coordinates", () => {
    const { container, rerender } = render(<ChartActiveDot />);
    const svg = container.querySelector("svg")!;
    expect(svg.getAttribute("x")).toBe("-6");
    expect(svg.getAttribute("y")).toBe("-6");

    rerender(<ChartActiveDot cx={20} cy={30} />);
    const svg2 = container.querySelector("svg")!;
    expect(svg2.getAttribute("x")).toBe("14");
    expect(svg2.getAttribute("y")).toBe("24");
  });
});

