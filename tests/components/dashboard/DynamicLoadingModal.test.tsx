import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";

// Mock the didYouKnowSlides constant
vi.mock("@/constants/didYouKnowSlides", () => ({
  didYouKnowSlides: [
    {
      id: 1,
      icon: null,
      title: "Slide One Title",
      content: "Slide one content.",
      source: "Source A",
    },
    {
      id: 2,
      icon: null,
      title: "Slide Two Title",
      content: "Slide two content.",
      source: "Source B",
    },
  ],
}));

// Mock ProgressLoadingModal to avoid deep rendering
vi.mock("@/components/modals", () => ({
  ProgressLoadingModal: ({
    isOpen,
    title,
    contentTitle,
    contentDescription,
    contentNote,
    showCloseButton,
    onClose,
  }: {
    isOpen: boolean;
    title: string;
    contentTitle?: string;
    contentDescription?: string;
    contentNote?: string;
    showCloseButton?: boolean;
    onClose?: () => void;
  }) =>
    isOpen ? (
      <div data-testid="progress-modal">
        <span data-testid="modal-title">{title}</span>
        <span data-testid="content-title">{contentTitle}</span>
        <span data-testid="content-description">{contentDescription}</span>
        <span data-testid="content-note">{contentNote}</span>
        {showCloseButton && onClose && (
          <button data-testid="close-button" onClick={onClose}>
            Close
          </button>
        )}
      </div>
    ) : null,
}));

// Mock LandingProgress icon
vi.mock("@/assets/icons/LoadingProgress", () => ({
  LandingProgress: () => <svg data-testid="landing-progress" />,
}));

import DynamicLoadingModal from "@/components/dashboard/DynamicLoadingModal";

describe("DynamicLoadingModal", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders nothing when shouldShow is false", () => {
    render(<DynamicLoadingModal shouldShow={false} />);
    expect(screen.queryByTestId("progress-modal")).not.toBeInTheDocument();
  });

  it("renders the modal when shouldShow is true", () => {
    render(<DynamicLoadingModal shouldShow={true} />);
    expect(screen.getByTestId("progress-modal")).toBeInTheDocument();
  });

  it("displays the first slide's content initially", () => {
    render(<DynamicLoadingModal shouldShow={true} />);
    expect(screen.getByTestId("content-title")).toHaveTextContent("Slide One Title");
    expect(screen.getByTestId("content-description")).toHaveTextContent("Slide one content.");
    expect(screen.getByTestId("content-note")).toHaveTextContent("Source: Source A");
  });

  it("cycles to the next slide after 7 seconds", () => {
    render(<DynamicLoadingModal shouldShow={true} />);
    expect(screen.getByTestId("content-description")).toHaveTextContent("Slide one content.");

    act(() => {
      vi.advanceTimersByTime(7000);
    });

    expect(screen.getByTestId("content-description")).toHaveTextContent("Slide two content.");
    expect(screen.getByTestId("content-note")).toHaveTextContent("Source: Source B");
  });

  it("does not start cycling when shouldShow is false", () => {
    render(<DynamicLoadingModal shouldShow={false} />);
    vi.advanceTimersByTime(7000);
    expect(screen.queryByTestId("progress-modal")).not.toBeInTheDocument();
  });

  it("renders close button when onClose is provided", () => {
    const onClose = vi.fn();
    render(<DynamicLoadingModal shouldShow={true} onClose={onClose} />);
    expect(screen.getByTestId("close-button")).toBeInTheDocument();
  });

  it("does not render close button when onClose is not provided", () => {
    render(<DynamicLoadingModal shouldShow={true} />);
    expect(screen.queryByTestId("close-button")).not.toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", () => {
    const onClose = vi.fn();
    render(<DynamicLoadingModal shouldShow={true} onClose={onClose} />);
    fireEvent.click(screen.getByTestId("close-button"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("displays the fixed title and subtitle", () => {
    render(<DynamicLoadingModal shouldShow={true} />);
    expect(screen.getByTestId("modal-title")).toHaveTextContent("Loading...");
  });
});
