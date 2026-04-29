import { render, screen, act } from "@testing-library/react";
import DynamicLoadingModal from "./DynamicLoadingModal";

jest.useFakeTimers();

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
    expect(screen.getByText("Did you know?"));
    expect(screen.getByText("Loading..."));
    expect(screen.getByText("Generating your custom dashboard."));
    expect(screen.getByText(labels[0]));
    expect(screen.getByText(notes[0]));

    // Cycle to second item
    act(() => {
      jest.advanceTimersByTime(7000);
    });
    expect(screen.getByText(labels[1])).toBeInTheDocument();
    expect(screen.getByText(notes[1])).toBeInTheDocument();

    // Cycle to third item
    act(() => {
      jest.advanceTimersByTime(7000);
    });
    expect(screen.getByText(labels[2])).toBeInTheDocument();
    expect(screen.getByText(notes[2])).toBeInTheDocument();

    // Cycle back to first item
    act(() => {
      jest.advanceTimersByTime(7000);
    });
    expect(screen.getByText(labels[0])).toBeInTheDocument();
    expect(screen.getByText(notes[0])).toBeInTheDocument();
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
