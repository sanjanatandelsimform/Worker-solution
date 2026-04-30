/**
 * Tests for ProgressBarCircle, ProgressBarHalfCircle, Tooltip, TooltipTrigger, InputGroup
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import {
  ProgressBarCircle,
  ProgressBarHalfCircle,
} from "../../../src/components/base/progress-indicators/progress-circles";

// --- ProgressBarCircle Tests ---
describe("ProgressBarCircle", () => {
  it("renders basic circle with percentage", () => {
    const { container } = render(<ProgressBarCircle value={50} size="md" />);
    expect(container.querySelector('[role="progressbar"]')).toBeTruthy();
    expect(screen.getByText("50%")).toBeTruthy();
  });

  it("renders with label and non-xxs size (label + size branch)", () => {
    render(<ProgressBarCircle value={75} size="sm" label="Progress" />);
    expect(screen.getByText("Progress")).toBeTruthy();
    expect(screen.getByText("75%")).toBeTruthy();
  });

  it("renders with label and xxs size (label at bottom)", () => {
    render(<ProgressBarCircle value={30} size="xxs" label="My label" />);
    // The label should appear at the bottom for xxs size
    expect(screen.getByText("My label")).toBeTruthy();
    expect(screen.getByText("30%")).toBeTruthy();
  });

  it("renders without label (no-label branch)", () => {
    render(<ProgressBarCircle value={60} size="lg" />);
    expect(screen.getByText("60%")).toBeTruthy();
  });

  it("renders with valueFormatter", () => {
    const formatter = vi.fn((_value: number, pct: number) => `${pct} pct`);
    render(<ProgressBarCircle value={40} size="md" valueFormatter={formatter} />);
    expect(formatter).toHaveBeenCalled();
    expect(screen.getByText("40 pct")).toBeTruthy();
  });

  it("renders with label + valueFormatter (non-xxs)", () => {
    const formatter = (_value: number, pct: number) => `${pct}%`;
    render(<ProgressBarCircle value={80} size="lg" label="Total" valueFormatter={formatter} />);
    expect(screen.getByText("Total")).toBeTruthy();
  });

  it("renders with label + size xs", () => {
    render(<ProgressBarCircle value={50} size="xs" label="XS label" />);
    expect(screen.getByText("XS label")).toBeTruthy();
  });

  it("handles custom min/max values", () => {
    render(<ProgressBarCircle value={5} min={0} max={10} size="md" />);
    expect(screen.getByText("50%")).toBeTruthy();
  });

  it("renders all size variants without crashing", () => {
    const sizes: Array<"xxs" | "xs" | "sm" | "md" | "lg"> = ["xxs", "xs", "sm", "md", "lg"];
    sizes.forEach(size => {
      const { unmount } = render(<ProgressBarCircle value={50} size={size} />);
      unmount();
    });
  });
});

// --- ProgressBarHalfCircle Tests ---
describe("ProgressBarHalfCircle", () => {
  it("renders basic half circle with percentage", () => {
    const { container } = render(<ProgressBarHalfCircle value={50} size="md" />);
    expect(container.querySelector('[role="progressbar"]')).toBeTruthy();
    expect(screen.getByText("50%")).toBeTruthy();
  });

  it("renders with label and non-xxs size", () => {
    render(<ProgressBarHalfCircle value={70} size="sm" label="Half Prog" />);
    expect(screen.getByText("Half Prog")).toBeTruthy();
    expect(screen.getByText("70%")).toBeTruthy();
  });

  it("renders with label and xxs size (label at bottom)", () => {
    render(<ProgressBarHalfCircle value={25} size="xxs" label="Small" />);
    expect(screen.getByText("Small")).toBeTruthy();
  });

  it("renders with valueFormatter", () => {
    const formatter = (_value: number, pct: number) => `${pct}%`;
    render(<ProgressBarHalfCircle value={60} size="md" valueFormatter={formatter} />);
    expect(screen.getByText("60%")).toBeTruthy();
  });

  it("renders with label + valueFormatter (non-xxs)", () => {
    const formatter = (_value: number, pct: number) => `${pct}%`;
    render(
      <ProgressBarHalfCircle value={80} size="lg" label="Total" valueFormatter={formatter} />
    );
    expect(screen.getByText("Total")).toBeTruthy();
  });

  it("renders without label", () => {
    render(<ProgressBarHalfCircle value={45} size="lg" />);
    expect(screen.getByText("45%")).toBeTruthy();
  });

  it("handles custom min/max values", () => {
    render(<ProgressBarHalfCircle value={5} min={0} max={20} size="md" />);
    expect(screen.getByText("25%")).toBeTruthy();
  });

  it("renders all size variants without crashing", () => {
    const sizes: Array<"xxs" | "xs" | "sm" | "md" | "lg"> = ["xxs", "xs", "sm", "md", "lg"];
    sizes.forEach(size => {
      const { unmount } = render(<ProgressBarHalfCircle value={50} size={size} />);
      unmount();
    });
  });
});
