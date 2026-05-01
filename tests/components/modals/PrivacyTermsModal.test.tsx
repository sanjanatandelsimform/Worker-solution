/**
 * Tests for PrivacyModal and TermsModal
 */
import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("@/components/base/modal/modal", () => ({
  Modal: ({ children, isOpen }: any) => (isOpen ? <div data-testid="modal">{children}</div> : null),
  ModalContent: ({ children }: any) => <div>{children}</div>,
  ModalHeader: ({ children }: any) => <div>{children}</div>,
  ModalFooter: ({ children }: any) => <div>{children}</div>,
  ModalTitle: ({ children }: any) => <h2>{children}</h2>,
}));

vi.mock("@/components/base/buttons/button", () => ({
  Button: ({ children, onClick, "aria-label": ariaLabel }: any) => (
    <button onClick={onClick} aria-label={ariaLabel}>
      {children}
    </button>
  ),
}));

vi.mock("@untitledui/icons", () => ({
  X: () => <span>X</span>,
}));

vi.mock("@/assets/featured-icon.svg", () => ({ default: "featured-icon.svg" }));

import { PrivacyModal } from "@/components/modals/PrivacyModal";
import { TermsModal } from "@/components/modals/TermsModal";

const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
  title: "Test Modal",
  buttons: [{ text: "Close", onClick: vi.fn() }],
};

describe("PrivacyModal", () => {
  it("renders when open", () => {
    render(<PrivacyModal {...defaultProps} />);
    expect(screen.getByTestId("modal")).toBeTruthy();
    expect(screen.getByText("Test Modal")).toBeTruthy();
  });

  it("does not render when closed", () => {
    render(<PrivacyModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByTestId("modal")).toBeNull();
  });

  it("renders close button by default", () => {
    render(<PrivacyModal {...defaultProps} />);
    expect(screen.getByLabelText("Close modal")).toBeTruthy();
  });

  it("hides close button when showCloseButton=false", () => {
    render(<PrivacyModal {...defaultProps} showCloseButton={false} />);
    expect(screen.queryByLabelText("Close modal")).toBeNull();
  });

  it("calls onClose when close button clicked", () => {
    const onClose = vi.fn();
    render(<PrivacyModal {...defaultProps} onClose={onClose} />);
    fireEvent.click(screen.getByLabelText("Close modal"));
    expect(onClose).toHaveBeenCalled();
  });

  it("renders image when icon prop is truthy", () => {
    render(<PrivacyModal {...defaultProps} icon={<span>icon</span>} />);
    // PrivacyModal shows an <img> when icon prop is truthy
    expect(screen.getByAltText("Success checkmark")).toBeTruthy();
  });

  it("renders messageImg src when icon and messageImg provided", () => {
    render(<PrivacyModal {...defaultProps} icon={<span>icon</span>} messageImg="custom.png" />);
    const img = screen.getByAltText("Success checkmark");
    expect(img.getAttribute("src")).toBe("custom.png");
  });

  it("uses featuredIcon as fallback when icon without messageImg", () => {
    render(<PrivacyModal {...defaultProps} icon={<span>icon</span>} />);
    const img = screen.getByAltText("Success checkmark");
    expect(img.getAttribute("src")).toBe("featured-icon.svg");
  });

  it("renders subtitle when provided", () => {
    render(<PrivacyModal {...defaultProps} subtitle="A subtitle" subtitleOne="More text" />);
    expect(screen.getByText("A subtitle")).toBeTruthy();
    expect(screen.getByText("More text")).toBeTruthy();
  });

  it("renders buttons", () => {
    const onClick = vi.fn();
    render(
      <PrivacyModal
        {...defaultProps}
        buttons={[
          { text: "Cancel", onClick: vi.fn(), color: "secondary" },
          { text: "Confirm", onClick },
        ]}
      />
    );
    expect(screen.getByText("Cancel")).toBeTruthy();
    expect(screen.getByText("Confirm")).toBeTruthy();
    fireEvent.click(screen.getByText("Confirm"));
    expect(onClick).toHaveBeenCalled();
  });

  it("applies unsuccess background pattern", () => {
    render(<PrivacyModal {...defaultProps} backgroundPattern="unsuccess" />);
    expect(screen.getByTestId("modal")).toBeTruthy();
  });
});

describe("TermsModal", () => {
  it("renders when open", () => {
    render(<TermsModal {...defaultProps} />);
    expect(screen.getByTestId("modal")).toBeTruthy();
  });

  it("does not render when closed", () => {
    render(<TermsModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByTestId("modal")).toBeNull();
  });

  it("renders close button and calls onClose", () => {
    const onClose = vi.fn();
    render(<TermsModal {...defaultProps} onClose={onClose} />);
    fireEvent.click(screen.getByLabelText("Close modal"));
    expect(onClose).toHaveBeenCalled();
  });

  it("hides close button when showCloseButton=false", () => {
    render(<TermsModal {...defaultProps} showCloseButton={false} />);
    expect(screen.queryByLabelText("Close modal")).toBeNull();
  });

  it("renders with subtitle", () => {
    render(<TermsModal {...defaultProps} subtitle="Terms subtitle" />);
    expect(screen.getByText("Terms subtitle")).toBeTruthy();
  });

  it("renders without icon", () => {
    const { container } = render(<TermsModal {...defaultProps} />);
    expect(container.querySelector("img")).toBeNull();
  });

  it("renders with icon", () => {
    render(<TermsModal {...defaultProps} icon={<span>icon</span>} />);
    expect(screen.getByAltText("Success checkmark")).toBeTruthy();
  });

  it("applies unsuccess background", () => {
    render(<TermsModal {...defaultProps} backgroundPattern="unsuccess" />);
    expect(screen.getByTestId("modal")).toBeTruthy();
  });
});
