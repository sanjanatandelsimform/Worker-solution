import { vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { BaseModalWithIcon } from "@/components/modals/BaseModalWithIcon";

describe("BaseModalWithIcon", () => {
  it("renders title/subtitle and invokes button handlers", () => {
    const onClose = vi.fn();
    const onAction = vi.fn();

    render(
      <BaseModalWithIcon
        isOpen={true}
        onClose={onClose}
        title="Test Title"
        subtitle="Test Subtitle"
        buttons={[{ text: "Do it", onClick: onAction, color: "primary" }]}
      />
    );

    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(screen.getByText("Test Subtitle")).toBeInTheDocument();

    const btn = screen.getByText("Do it");
    fireEvent.click(btn);
    expect(onAction).toHaveBeenCalled();

    // Close button should exist and invoke onClose
    const closeBtn = screen.getByLabelText("Close modal");
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalled();
  });

  it("disables buttons when isDisabled true", () => {
    const onClose = vi.fn();
    const onAction = vi.fn();

    render(
      <BaseModalWithIcon
        isOpen={true}
        onClose={onClose}
        title="Disabled Test"
        buttons={[{ text: "Cant", onClick: onAction, isDisabled: true }]}
      />
    );

    const btn = screen.getByRole("button", { name: "Cant" });
    expect(btn).toBeDisabled();
  });
});
