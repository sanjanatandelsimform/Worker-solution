/**
 * Tests for GetInTouchModal and ProgressLoadingModal
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { MemoryRouter } from "react-router-dom";

vi.mock("@/components/base/modal/modal", () => ({
  Modal: ({ isOpen, onOpenChange, children }: any) => {
    if (!isOpen) return null;
    return (
      <div data-testid="modal">
        {children}
        <button data-testid="modal-bg-close" onClick={() => onOpenChange(false)} />
      </div>
    );
  },
  ModalContent: ({ children, className }: any) => (
    <div className={className} data-testid="modal-content">
      {children}
    </div>
  ),
  ModalHeader: ({ children, className }: any) => (
    <div className={className} data-testid="modal-header">
      {children}
    </div>
  ),
  ModalTitle: ({ children, className }: any) => <h2 className={className}>{children}</h2>,
  ModalDescription: ({ children }: any) => <p>{children}</p>,
  ModalBody: ({ children }: any) => <div>{children}</div>,
  ModalFooter: ({ children, className }: any) => (
    <div className={className} data-testid="modal-footer">
      {children}
    </div>
  ),
}));

vi.mock("@/components/base/buttons/button", () => ({
  Button: ({
    children,
    onClick,
    type,
    isDisabled,
    iconTrailing,
    color,
    size,
    className,
    "aria-label": ariaLabel,
  }: any) => (
    <button
      type={type || "button"}
      onClick={onClick}
      disabled={isDisabled}
      className={className}
      data-color={color}
      data-size={size}
      aria-label={ariaLabel}
    >
      {iconTrailing}
      {children}
    </button>
  ),
}));

vi.mock("@/components/base/input/input", () => ({
  Input: ({ label, placeholder, size, isRequired }: any) => (
    <div>
      {label && <label>{label}</label>}
      <input placeholder={placeholder} data-size={size} required={isRequired} />
    </div>
  ),
  InputBase: ({ placeholder, type, size, value }: any) => (
    <input placeholder={placeholder} type={type} data-size={size} value={value} readOnly />
  ),
}));

vi.mock("@/components/base/input/input-group", () => ({
  InputGroup: ({ children, label, leadingAddon, className }: any) => (
    <div className={className} data-testid="input-group">
      {label && <label>{label}</label>}
      {leadingAddon}
      {children}
    </div>
  ),
}));

vi.mock("../base/select/select-native", () => ({
  NativeSelect: ({ value, onChange, options }: any) => (
    <select value={value} onChange={onChange} data-testid="country-select">
      {options?.map((opt: any) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  ),
}));

vi.mock("@/components/base/select/select-native", () => ({
  NativeSelect: ({ value, onChange, options }: any) => (
    <select value={value} onChange={onChange} data-testid="country-select">
      {options?.map((opt: any) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  ),
}));

vi.mock("@/components/base/textarea/textarea", () => ({
  TextArea: ({ label, placeholder, rows }: any) => (
    <div>
      {label && <label>{label}</label>}
      <textarea placeholder={placeholder} rows={rows} />
    </div>
  ),
}));

vi.mock("@/components/base/checkbox/checkbox", () => ({
  Checkbox: ({ label }: any) => <label data-testid="checkbox">{label}</label>,
}));

vi.mock("@untitledui/icons", () => ({
  X: ({ className }: any) => <span className={className} data-testid="x-icon" />,
}));

vi.mock("@/assets/icons/LoadingProgress", () => ({
  LandingProgress: () => <div data-testid="landing-progress" />,
}));

import { GetInTouchModal } from "@/components/modals/GetInTouchModal";
import { ProgressLoadingModal } from "@/components/modals/ProgressLoadingModal";

describe("GetInTouchModal", () => {
  it("renders nothing when isOpen is false", () => {
    render(
      <MemoryRouter>
        <GetInTouchModal isOpen={false} onClose={vi.fn()} />
      </MemoryRouter>
    );
    expect(screen.queryByTestId("modal")).toBeNull();
  });

  it("renders modal when isOpen is true", () => {
    render(
      <MemoryRouter>
        <GetInTouchModal isOpen={true} onClose={vi.fn()} />
      </MemoryRouter>
    );
    expect(screen.getByTestId("modal")).toBeTruthy();
    expect(screen.getByText("Get in touch")).toBeTruthy();
  });

  it("renders form fields", () => {
    render(
      <MemoryRouter>
        <GetInTouchModal isOpen={true} onClose={vi.fn()} />
      </MemoryRouter>
    );
    expect(screen.getByPlaceholderText("First name")).toBeTruthy();
    expect(screen.getByPlaceholderText("Last name")).toBeTruthy();
  });

  it("renders the close button", () => {
    const onClose = vi.fn();
    render(
      <MemoryRouter>
        <GetInTouchModal isOpen={true} onClose={onClose} />
      </MemoryRouter>
    );
    const xIcon = screen.getByTestId("x-icon");
    // Click the button containing the x icon
    fireEvent.click(xIcon.closest("button") || xIcon);
    expect(onClose).toHaveBeenCalled();
  });

  it("calls onClose when modal background is closed", () => {
    const onClose = vi.fn();
    render(
      <MemoryRouter>
        <GetInTouchModal isOpen={true} onClose={onClose} />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByTestId("modal-bg-close"));
    expect(onClose).toHaveBeenCalled();
  });

  it("renders country code select", () => {
    render(
      <MemoryRouter>
        <GetInTouchModal isOpen={true} onClose={vi.fn()} />
      </MemoryRouter>
    );
    expect(screen.getByTestId("country-select")).toBeTruthy();
  });

  it("updates country code when selection changes", () => {
    render(
      <MemoryRouter>
        <GetInTouchModal isOpen={true} onClose={vi.fn()} />
      </MemoryRouter>
    );
    const select = screen.getByTestId("country-select") as HTMLSelectElement;
    fireEvent.change(select, { target: { value: "UK" } });
    expect(select.value).toBe("UK");
  });

  it("renders message textarea", () => {
    render(
      <MemoryRouter>
        <GetInTouchModal isOpen={true} onClose={vi.fn()} />
      </MemoryRouter>
    );
    expect(screen.getByPlaceholderText("Leave us a message...")).toBeTruthy();
  });

  it("renders submit button with Share feedback text", () => {
    render(
      <MemoryRouter>
        <GetInTouchModal isOpen={true} onClose={vi.fn()} />
      </MemoryRouter>
    );
    expect(screen.getByText("Share feedback")).toBeTruthy();
  });

  it("renders privacy policy checkbox", () => {
    render(
      <MemoryRouter>
        <GetInTouchModal isOpen={true} onClose={vi.fn()} />
      </MemoryRouter>
    );
    expect(screen.getByTestId("checkbox")).toBeTruthy();
  });
});

describe("ProgressLoadingModal", () => {
  const defaultButtons = [{ text: "OK", onClick: vi.fn(), color: "primary" as const }];

  it("renders nothing when isOpen is false", () => {
    render(
      <ProgressLoadingModal
        isOpen={false}
        onClose={vi.fn()}
        title="Loading"
        buttons={defaultButtons}
        size="sm"
      />
    );
    expect(screen.queryByTestId("modal")).toBeNull();
  });

  it("renders modal when isOpen is true", () => {
    render(
      <ProgressLoadingModal
        isOpen={true}
        onClose={vi.fn()}
        title="Loading Progress"
        icon={<span>icon</span>}
        buttons={defaultButtons}
        size="sm"
      />
    );
    expect(screen.getByTestId("modal")).toBeTruthy();
    expect(screen.getByText("Loading Progress")).toBeTruthy();
  });

  it("renders with icon (icon branch)", () => {
    render(
      <ProgressLoadingModal
        isOpen={true}
        onClose={vi.fn()}
        title="With Icon"
        icon={<span>Icon</span>}
        buttons={defaultButtons}
        size="sm"
      />
    );
    // When icon is truthy, LandingProgress is shown
    expect(screen.getByTestId("landing-progress")).toBeTruthy();
  });

  it("renders subtitle when provided (subtitle branch)", () => {
    render(
      <ProgressLoadingModal
        isOpen={true}
        onClose={vi.fn()}
        title="Title"
        subtitle="Subtitle text"
        icon={<span>icon</span>}
        buttons={defaultButtons}
        size="sm"
      />
    );
    expect(screen.getByText("Subtitle text")).toBeTruthy();
  });

  it("renders without subtitle (no subtitle branch)", () => {
    render(
      <ProgressLoadingModal
        isOpen={true}
        onClose={vi.fn()}
        title="Title"
        icon={<span>icon</span>}
        buttons={defaultButtons}
        size="sm"
      />
    );
    expect(screen.queryByText("Subtitle text")).toBeNull();
  });

  it("renders close button when showCloseButton is true (default)", () => {
    const onClose = vi.fn();
    render(
      <ProgressLoadingModal
        isOpen={true}
        onClose={onClose}
        title="Loading"
        buttons={defaultButtons}
        size="sm"
      />
    );
    const closeBtn = screen.getByLabelText("Close modal");
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalled();
  });

  it("does not render close button when showCloseButton is false", () => {
    render(
      <ProgressLoadingModal
        isOpen={true}
        onClose={vi.fn()}
        title="Loading"
        buttons={defaultButtons}
        showCloseButton={false}
        size="sm"
      />
    );
    expect(screen.queryByLabelText("Close modal")).toBeNull();
  });

  it("renders with unsuccessful background pattern", () => {
    render(
      <ProgressLoadingModal
        isOpen={true}
        onClose={vi.fn()}
        title="Loading"
        buttons={defaultButtons}
        backgroundPattern="unsuccess"
        size="sm"
      />
    );
    expect(screen.getByTestId("modal")).toBeTruthy();
  });

  it("renders multiple buttons", () => {
    const buttons = [
      { text: "Cancel", onClick: vi.fn(), color: "secondary" as const },
      { text: "Confirm", onClick: vi.fn(), color: "primary" as const },
    ];
    render(
      <ProgressLoadingModal
        isOpen={true}
        onClose={vi.fn()}
        title="Loading"
        buttons={buttons}
        size="sm"
      />
    );
    expect(screen.getByText("Cancel")).toBeTruthy();
    expect(screen.getByText("Confirm")).toBeTruthy();
  });

  it("renders content title and description", () => {
    render(
      <ProgressLoadingModal
        isOpen={true}
        onClose={vi.fn()}
        title="Loading"
        contentTitle="Step 1"
        contentDescription="Doing step 1"
        contentNote="Source: data"
        buttons={defaultButtons}
        size="sm"
      />
    );
    expect(screen.getByText("Step 1")).toBeTruthy();
    expect(screen.getByText("Doing step 1")).toBeTruthy();
  });

  it("calls button onClick when button is clicked", () => {
    const onClick = vi.fn();
    render(
      <ProgressLoadingModal
        isOpen={true}
        onClose={vi.fn()}
        title="Loading"
        buttons={[{ text: "Click me", onClick }]}
        size="sm"
      />
    );
    fireEvent.click(screen.getByText("Click me"));
    expect(onClick).toHaveBeenCalled();
  });

  it("renders disabled button when isDisabled is true", () => {
    render(
      <ProgressLoadingModal
        isOpen={true}
        onClose={vi.fn()}
        title="Loading"
        buttons={[{ text: "Disabled btn", onClick: vi.fn(), isDisabled: true }]}
        size="sm"
      />
    );
    const btn = screen.getByText("Disabled btn") as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });
});
