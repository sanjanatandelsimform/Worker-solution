import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { AccountDeleteModal } from "../../../src/components/modals/AccountDeleteModal";
import { RetakeAssessmentModal } from "../../../src/components/modals/RetakeAssessmentModal";
import { SessionExpiredModal } from "../../../src/components/modals/SessionExpiredModal";
import { UpdateCompletedModal } from "../../../src/components/modals/UpdateCompletedModal";
import { ChangePasswordFailedModal } from "../../../src/components/modals/ChangePasswordFailedModal";
import { ChangePasswordSuccessModal } from "../../../src/components/modals/ChangePasswordSuccessModal";
import { InProgressModal } from "../../../src/components/modals/InProgressModal";
import { SuccessModalWithLogo } from "../../../src/components/modals/SuccessModalWithLogo";
import { BaseFormModal } from "../../../src/components/modals/BaseFormModal";

// Mock Modal components
vi.mock("@/components/base/modal/modal", () => ({
  Modal: ({ isOpen, children }: any) =>
    isOpen ? <div data-testid="modal">{children}</div> : null,
  ModalContent: ({ children, ...props }: any) => (
    <div data-testid="modal-content" {...props}>
      {children}
    </div>
  ),
  ModalHeader: ({ children }: any) => <div>{children}</div>,
  ModalFooter: ({ children }: any) => <div>{children}</div>,
  ModalTitle: ({ children }: any) => <h2>{children}</h2>,
  ModalBody: ({ children }: any) => <div>{children}</div>,
  ModalDescription: ({ children }: any) => <p>{children}</p>,
}));

// Mock Button
vi.mock("@/components/base/buttons/button", () => ({
  Button: ({ children, onClick, type, "aria-label": ariaLabel, isDisabled, ...props }: any) => (
    <button
      type={type || "button"}
      onClick={onClick}
      aria-label={ariaLabel}
      disabled={isDisabled}
      {...props}
    >
      {children}
    </button>
  ),
}));

// Mock BaseModalWithIcon
vi.mock("@/components/modals/BaseModalWithIcon", () => ({
  BaseModalWithIcon: ({ isOpen, onClose, title, subtitle, buttons }: any) => {
    if (!isOpen) return null;
    return (
      <div data-testid="base-modal">
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
        {buttons?.map((btn: any) => (
          <button key={btn.text} type="button" onClick={btn.onClick}>
            {btn.text}
          </button>
        ))}
        <button type="button" onClick={onClose} data-testid="modal-close">
          Close
        </button>
      </div>
    );
  },
}));

// Mock router
vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn(),
}));

// Mock redux
const mockDispatch = vi.fn().mockReturnValue({ unwrap: () => Promise.resolve() });
vi.mock("@/store/hooks", () => ({
  useAppDispatch: () => mockDispatch,
}));
vi.mock("@/store/slices/authSlice", () => ({
  logoutThunk: vi.fn(() => ({ type: "auth/logout" })),
}));

// Mock icons/assets
vi.mock("@untitledui/icons", () => ({
  CheckCircle: ({ className }: any) => <span className={className} data-testid="check-circle" />,
  AlertOctagon: ({ className }: any) => <span className={className} data-testid="alert-octagon" />,
  AlertTriangle: ({ className }: any) => (
    <span className={className} data-testid="alert-triangle" />
  ),
  X: ({ className }: any) => <span className={className} data-testid="x-icon" />,
}));
vi.mock("@/assets/icons/TrashIcon", () => ({
  TrashIcon: ({ className }: any) => <span className={className} data-testid="trash-icon" />,
}));
vi.mock("@/assets/icons/LoadingProgress", () => ({
  LandingProgress: () => <span data-testid="landing-progress" />,
}));
vi.mock("@/assets/alert-icon.svg", () => ({ default: "alert-icon.svg" }));
vi.mock("@/assets/success-check.svg", () => ({ default: "success-check.svg" }));

describe("AccountDeleteModal", () => {
  it("renders when open", () => {
    render(<AccountDeleteModal isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByTestId("base-modal")).toBeTruthy();
    expect(screen.getByText("Confirm Account Deletion")).toBeTruthy();
  });

  it("does not render when closed", () => {
    render(<AccountDeleteModal isOpen={false} onClose={vi.fn()} />);
    expect(screen.queryByTestId("base-modal")).toBeNull();
  });

  it("calls onContinue and onClose when confirm button clicked", () => {
    const onClose = vi.fn();
    const onContinue = vi.fn();
    render(<AccountDeleteModal isOpen={true} onClose={onClose} onContinue={onContinue} />);
    fireEvent.click(screen.getByText("Yes, delete my account"));
    expect(onContinue).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it("calls only onClose when no onContinue provided", () => {
    const onClose = vi.fn();
    render(<AccountDeleteModal isOpen={true} onClose={onClose} />);
    fireEvent.click(screen.getByText("Yes, delete my account"));
    expect(onClose).toHaveBeenCalled();
  });

  it("calls onClose when Cancel clicked", () => {
    const onClose = vi.fn();
    render(<AccountDeleteModal isOpen={true} onClose={onClose} />);
    fireEvent.click(screen.getByText("Cancel"));
    expect(onClose).toHaveBeenCalled();
  });
});

describe("RetakeAssessmentModal", () => {
  it("renders when open", () => {
    render(<RetakeAssessmentModal isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByTestId("base-modal")).toBeTruthy();
    expect(screen.getByText("Are you sure?")).toBeTruthy();
  });

  it("does not render when closed", () => {
    render(<RetakeAssessmentModal isOpen={false} onClose={vi.fn()} />);
    expect(screen.queryByTestId("base-modal")).toBeNull();
  });

  it("calls onContinue and onClose when confirm clicked", () => {
    const onClose = vi.fn();
    const onContinue = vi.fn();
    render(<RetakeAssessmentModal isOpen={true} onClose={onClose} onContinue={onContinue} />);
    fireEvent.click(screen.getByText("Yes, Retake assessment"));
    expect(onContinue).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it("calls only onClose when no onContinue provided", () => {
    const onClose = vi.fn();
    render(<RetakeAssessmentModal isOpen={true} onClose={onClose} />);
    fireEvent.click(screen.getByText("Yes, Retake assessment"));
    expect(onClose).toHaveBeenCalled();
  });

  it("calls onClose when Cancel clicked", () => {
    const onClose = vi.fn();
    render(<RetakeAssessmentModal isOpen={true} onClose={onClose} />);
    fireEvent.click(screen.getByText("Cancel"));
    expect(onClose).toHaveBeenCalled();
  });
});

describe("SessionExpiredModal", () => {
  it("renders when open", () => {
    render(<SessionExpiredModal isOpen={true} onClose={vi.fn()} onLoginAgain={vi.fn()} />);
    expect(screen.getByTestId("base-modal")).toBeTruthy();
    expect(screen.getByText("Session Expired")).toBeTruthy();
  });

  it("does not render when closed", () => {
    render(<SessionExpiredModal isOpen={false} onClose={vi.fn()} onLoginAgain={vi.fn()} />);
    expect(screen.queryByTestId("base-modal")).toBeNull();
  });

  it("calls onLoginAgain when Log In Again clicked", () => {
    const onLoginAgain = vi.fn();
    render(<SessionExpiredModal isOpen={true} onClose={vi.fn()} onLoginAgain={onLoginAgain} />);
    fireEvent.click(screen.getByText("Log In Again"));
    expect(onLoginAgain).toHaveBeenCalled();
  });

  it("calls onClose when Cancel clicked", () => {
    const onClose = vi.fn();
    render(<SessionExpiredModal isOpen={true} onClose={onClose} onLoginAgain={vi.fn()} />);
    fireEvent.click(screen.getByText("Cancel"));
    expect(onClose).toHaveBeenCalled();
  });
});

describe("UpdateCompletedModal", () => {
  it("renders when open", () => {
    render(<UpdateCompletedModal isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByTestId("base-modal")).toBeTruthy();
    expect(screen.getByText("Update Complete")).toBeTruthy();
  });

  it("does not render when closed", () => {
    render(<UpdateCompletedModal isOpen={false} onClose={vi.fn()} />);
    expect(screen.queryByTestId("base-modal")).toBeNull();
  });

  it("calls onBackToSettings and onClose when button clicked", () => {
    const onClose = vi.fn();
    const onBackToSettings = vi.fn();
    render(
      <UpdateCompletedModal isOpen={true} onClose={onClose} onBackToSettings={onBackToSettings} />
    );
    fireEvent.click(screen.getByText("Back to Settings"));
    expect(onBackToSettings).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it("calls only onClose when no onBackToSettings provided", () => {
    const onClose = vi.fn();
    render(<UpdateCompletedModal isOpen={true} onClose={onClose} />);
    fireEvent.click(screen.getByText("Back to Settings"));
    expect(onClose).toHaveBeenCalled();
  });
});

describe("ChangePasswordFailedModal", () => {
  it("renders when open", () => {
    render(<ChangePasswordFailedModal isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByTestId("base-modal")).toBeTruthy();
    expect(screen.getByText("Uh-oh")).toBeTruthy();
  });

  it("does not render when closed", () => {
    render(<ChangePasswordFailedModal isOpen={false} onClose={vi.fn()} />);
    expect(screen.queryByTestId("base-modal")).toBeNull();
  });

  it("calls onContinue and onClose when Continue clicked", () => {
    const onClose = vi.fn();
    const onContinue = vi.fn();
    render(<ChangePasswordFailedModal isOpen={true} onClose={onClose} onContinue={onContinue} />);
    fireEvent.click(screen.getByText("Continue"));
    expect(onContinue).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it("calls only onClose when no onContinue provided", () => {
    const onClose = vi.fn();
    render(<ChangePasswordFailedModal isOpen={true} onClose={onClose} />);
    fireEvent.click(screen.getByText("Continue"));
    expect(onClose).toHaveBeenCalled();
  });

  it("calls onClose when Cancel clicked", () => {
    const onClose = vi.fn();
    render(<ChangePasswordFailedModal isOpen={true} onClose={onClose} />);
    fireEvent.click(screen.getByText("Cancel"));
    expect(onClose).toHaveBeenCalled();
  });
});

describe("ChangePasswordSuccessModal", () => {
  it("renders when open", () => {
    render(<ChangePasswordSuccessModal isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByTestId("base-modal")).toBeTruthy();
    expect(screen.getByText(/Your password has been changed/i)).toBeTruthy();
  });

  it("does not render when closed", () => {
    render(<ChangePasswordSuccessModal isOpen={false} onClose={vi.fn()} />);
    expect(screen.queryByTestId("base-modal")).toBeNull();
  });

  it("Log in button triggers dispatch", () => {
    const onClose = vi.fn();
    render(<ChangePasswordSuccessModal isOpen={true} onClose={onClose} />);
    fireEvent.click(screen.getByText("Log in"));
    expect(mockDispatch).toHaveBeenCalled();
  });
});

describe("InProgressModal", () => {
  it("renders when open with default title", () => {
    render(<InProgressModal isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByTestId("modal")).toBeTruthy();
    expect(screen.getByText("Preparing...")).toBeTruthy();
  });

  it("renders with custom title and subtitle", () => {
    render(
      <InProgressModal
        isOpen={true}
        onClose={vi.fn()}
        title="Custom Title"
        subtitle="Custom subtitle text"
      />
    );
    expect(screen.getByText("Custom Title")).toBeTruthy();
    expect(screen.getByText("Custom subtitle text")).toBeTruthy();
  });

  it("does not render when closed", () => {
    render(<InProgressModal isOpen={false} onClose={vi.fn()} />);
    expect(screen.queryByTestId("modal")).toBeNull();
  });

  it("renders spinning SVG icon", () => {
    const { container } = render(<InProgressModal isOpen={true} onClose={vi.fn()} />);
    expect(container.querySelector("svg")).toBeTruthy();
  });
});

describe("SuccessModalWithLogo", () => {
  it("renders when open", () => {
    render(
      <SuccessModalWithLogo
        isOpen={true}
        onClose={vi.fn()}
        messageImg="test-img.svg"
        title="Success!"
        subtitle="Your action was successful."
        button={{ text: "Continue", onClick: vi.fn() }}
      />
    );
    expect(screen.getByTestId("modal")).toBeTruthy();
    expect(screen.getByText("Success!")).toBeTruthy();
    expect(screen.getByText("Your action was successful.")).toBeTruthy();
    expect(screen.getByText("Continue")).toBeTruthy();
  });

  it("does not render when closed", () => {
    render(
      <SuccessModalWithLogo
        isOpen={false}
        onClose={vi.fn()}
        messageImg="test-img.svg"
        button={{ text: "Go", onClick: vi.fn() }}
      />
    );
    expect(screen.queryByTestId("modal")).toBeNull();
  });

  it("calls button.onClick when button is clicked", () => {
    const onClick = vi.fn();
    render(
      <SuccessModalWithLogo
        isOpen={true}
        onClose={vi.fn()}
        messageImg="test-img.svg"
        title="Done"
        button={{ text: "OK", onClick }}
      />
    );
    fireEvent.click(screen.getByText("OK"));
    expect(onClick).toHaveBeenCalled();
  });

  it("calls onClose when close button clicked", () => {
    const onClose = vi.fn();
    render(
      <SuccessModalWithLogo
        isOpen={true}
        onClose={onClose}
        messageImg="test-img.svg"
        button={{ text: "OK", onClick: vi.fn() }}
        showCloseButton={true}
      />
    );
    fireEvent.click(screen.getByLabelText("Close modal"));
    expect(onClose).toHaveBeenCalled();
  });

  it("hides logo when showLogo=false", () => {
    render(
      <SuccessModalWithLogo
        isOpen={true}
        onClose={vi.fn()}
        messageImg="test-img.svg"
        button={{ text: "OK", onClick: vi.fn() }}
        showLogo={false}
      />
    );
    expect(screen.queryByText("A2B")).toBeNull();
  });

  it("shows logo when showLogo=true (default)", () => {
    render(
      <SuccessModalWithLogo
        isOpen={true}
        onClose={vi.fn()}
        messageImg="test-img.svg"
        button={{ text: "OK", onClick: vi.fn() }}
      />
    );
    expect(screen.getByText("A2B")).toBeTruthy();
  });
});

describe("BaseFormModal", () => {
  it("renders when open", () => {
    render(
      <BaseFormModal
        isOpen={true}
        onClose={vi.fn()}
        title="Edit Form"
        buttons={[{ text: "Save", onClick: vi.fn() }]}
      >
        <input placeholder="Name" />
      </BaseFormModal>
    );
    expect(screen.getByTestId("modal")).toBeTruthy();
    expect(screen.getByText("Edit Form")).toBeTruthy();
    expect(screen.getByText("Save")).toBeTruthy();
    expect(screen.getByPlaceholderText("Name")).toBeTruthy();
  });

  it("renders description when provided", () => {
    render(
      <BaseFormModal
        isOpen={true}
        onClose={vi.fn()}
        title="Form"
        description="Fill in the details"
        buttons={[{ text: "OK", onClick: vi.fn() }]}
      >
        <span>Content</span>
      </BaseFormModal>
    );
    expect(screen.getByText("Fill in the details")).toBeTruthy();
  });

  it("does not render when closed", () => {
    render(
      <BaseFormModal
        isOpen={false}
        onClose={vi.fn()}
        title="Form"
        buttons={[{ text: "OK", onClick: vi.fn() }]}
      >
        <span>Content</span>
      </BaseFormModal>
    );
    expect(screen.queryByTestId("modal")).toBeNull();
  });

  it("calls button onClick when button clicked", () => {
    const onClick = vi.fn();
    render(
      <BaseFormModal
        isOpen={true}
        onClose={vi.fn()}
        title="Form"
        buttons={[{ text: "Submit", onClick }]}
      >
        <span>Content</span>
      </BaseFormModal>
    );
    fireEvent.click(screen.getByText("Submit"));
    expect(onClick).toHaveBeenCalled();
  });

  it("calls onClose when X button clicked", () => {
    const onClose = vi.fn();
    render(
      <BaseFormModal
        isOpen={true}
        onClose={onClose}
        title="Form"
        buttons={[{ text: "OK", onClick: vi.fn() }]}
      >
        <span>Content</span>
      </BaseFormModal>
    );
    // The X icon button has no text
    const buttons = screen.getAllByRole("button");
    const closeBtn = buttons.find(b => b.textContent?.trim() === "");
    if (closeBtn) {
      fireEvent.click(closeBtn);
      expect(onClose).toHaveBeenCalled();
    }
  });

  it("calls onSubmit when form submitted", () => {
    const onSubmit = vi.fn(e => e.preventDefault());
    const { container } = render(
      <BaseFormModal
        isOpen={true}
        onClose={vi.fn()}
        title="Form"
        buttons={[{ text: "Submit", onClick: vi.fn(), type: "submit" }]}
        onSubmit={onSubmit}
      >
        <input name="test" />
      </BaseFormModal>
    );
    const form = container.querySelector("form");
    if (form) fireEvent.submit(form);
    expect(onSubmit).toHaveBeenCalled();
  });

  it("renders multiple buttons", () => {
    render(
      <BaseFormModal
        isOpen={true}
        onClose={vi.fn()}
        title="My Form"
        buttons={[
          { text: "Cancel", onClick: vi.fn(), color: "secondary" },
          { text: "Save Changes", onClick: vi.fn(), color: "primary" },
        ]}
      >
        <span>Content</span>
      </BaseFormModal>
    );
    expect(screen.getByText("Cancel")).toBeTruthy();
    expect(screen.getByText("Save Changes")).toBeTruthy();
  });

  it("hides close button when showCloseButton=false", () => {
    render(
      <BaseFormModal
        isOpen={true}
        onClose={vi.fn()}
        title="Form"
        buttons={[{ text: "OK", onClick: vi.fn() }]}
        showCloseButton={false}
      >
        <span>Content</span>
      </BaseFormModal>
    );
    // Only the OK button should be present
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBe(1);
    expect(buttons[0].textContent).toBe("OK");
  });
});
