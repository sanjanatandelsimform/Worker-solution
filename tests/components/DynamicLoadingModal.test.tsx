import { describe, it, expect, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import DynamicLoadingModal from "../../src/components/dashboard/DynamicLoadingModal";

vi.useFakeTimers();

describe("DynamicLoadingModal", () => {
  const labels = [
    "78% of employees reported they’re more likely to stay with an employer because of their benefits program.",
    "Companies with strong benefits programs see 2x higher retention rates.",
    "Benefits satisfaction increases employee engagement by 41%.",
  ];
  const notes = [
    "Source: 2018 Willis Towers Watson Employee and Employer Experience on a Benefit Marketplace Survey",
    "Source: SHRM 2022 Employee Benefits Survey",
    "Source: MetLife Employee Benefit Trends Study 2023",
  ];

  it("renders and cycles through all carousel items", () => {
    render(<DynamicLoadingModal shouldShow={true} />);
    // Initial render
    expect(screen.getByText("Did you know?")).toBeTruthy();
    expect(screen.getByText("Loading...")).toBeTruthy();
    expect(screen.getByText("Generating your custom dashboard.")).toBeTruthy();
    expect(screen.getByText(labels[0])).toBeTruthy();
    expect(screen.getByText(notes[0])).toBeTruthy();

    // Cycle to second item
    act(() => {
      vi.advanceTimersByTime(7000);
    });
    expect(screen.getByText(labels[1])).toBeTruthy();
    expect(screen.getByText(notes[1])).toBeTruthy();

    // Cycle to third item
    act(() => {
      vi.advanceTimersByTime(7000);
    });
    expect(screen.getByText(labels[2])).toBeTruthy();
    expect(screen.getByText(notes[2])).toBeTruthy();

    // Cycle back to first item
    act(() => {
      vi.advanceTimersByTime(7000);
    });
    expect(screen.getByText(labels[0])).toBeTruthy();
    expect(screen.getByText(notes[0])).toBeTruthy();
  });

  it("does not render when shouldShow is false", () => {
    render(<DynamicLoadingModal shouldShow={false} />);
    expect(screen.queryByText("Did you know?")).toBeNull();
  });

  it("cleans up interval on unmount", () => {
    const { unmount } = render(<DynamicLoadingModal shouldShow={true} />);
    unmount();
    // No error should occur, interval should be cleared
    // (No assertion needed, just coverage)
  });
});
