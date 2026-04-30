import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

let profileState = {
  profileLoading: false,
  profileError: "Invalid password",
  passwordAttempts: 0,
  isAccountLocked: false,
  lockoutExpiry: null as number | null,
};

const unwrapSuccess = { unwrap: () => Promise.resolve({ success: true }) };
const unwrapFailure = { unwrap: () => Promise.reject("2 attempts remaining") };

const mockDispatch = vi.fn(() => unwrapSuccess as any);

vi.mock("@/store/hooks", () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: any) => selector(),
}));

vi.mock("@/store/selectors/profileSelectors", () => ({
  selectProfileLoading: () => profileState.profileLoading,
  selectProfileError: () => profileState.profileError,
  selectPasswordAttempts: () => profileState.passwordAttempts,
  selectIsAccountLocked: () => profileState.isAccountLocked,
  selectLockoutExpiry: () => profileState.lockoutExpiry,
}));

vi.mock("@/store/slices/profileSlice", () => ({
  changePassword: vi.fn((payload: any) => payload),
}));

vi.mock("@/utils/validation", () => ({
  validatePassword: vi.fn(() => ({ isValid: true, message: "" })),
  isPasswordDifferent: vi.fn(() => true),
}));

vi.mock("@/components/base/modal/modal", () => ({
  Modal: ({ isOpen, children }: any) => (isOpen ? <div>{children}</div> : null),
  ModalContent: ({ children }: any) => <div>{children}</div>,
  ModalHeader: ({ children }: any) => <div>{children}</div>,
  ModalTitle: ({ children }: any) => <h1>{children}</h1>,
  ModalDescription: ({ children }: any) => <p>{children}</p>,
  ModalBody: ({ children }: any) => <div>{children}</div>,
  ModalFooter: ({ children }: any) => <div>{children}</div>,
}));

vi.mock("@/components/base/buttons/button", () => ({
  Button: ({
    children,
    onClick,
    color,
    "aria-label": ariaLabel,
    type,
    isDisabled,
  }: any) => (
    <button
      aria-label={ariaLabel}
      data-color={color}
      type={type || "button"}
      disabled={!!isDisabled}
      onClick={onClick}
    >
      {children || ariaLabel}
    </button>
  ),
}));

vi.mock("@/components/base/input/input-group", () => ({
  InputGroup: ({ children }: any) => <div>{children}</div>,
}));

vi.mock("@/components/base/input/input", () => ({
  Input: ({ value, onChange, hint, isDisabled, label }: any) => (
    <div>
      <div>{label}</div>
      <input
        aria-label={label}
        disabled={isDisabled}
        value={value}
        onChange={e => onChange?.(e.target.value)}
      />
      {hint ? <span>{hint}</span> : null}
    </div>
  ),
}));

vi.mock("@/components/common/ErrorMessage", () => ({
  default: ({ errorMessage }: any) => <div data-testid="error-message">{errorMessage}</div>,
}));

vi.mock("@/components/modals/ChangePasswordSuccessModal", () => ({
  ChangePasswordSuccessModal: ({ isOpen }: any) =>
    isOpen ? <div data-testid="success-modal">success</div> : null,
}));

import { ChangePasswordModal } from "@/components/modals/ChangePasswordModal";

describe("ChangePasswordModal branches", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    profileState = {
      profileLoading: false,
      profileError: "Invalid password",
      passwordAttempts: 0,
      isAccountLocked: false,
      lockoutExpiry: null,
    };
    mockDispatch.mockReturnValue(unwrapSuccess as any);
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z").getTime());
  });

  it("shows lockout message when account is locked and lockoutExpiry exists", () => {
    profileState.isAccountLocked = true;
    profileState.lockoutExpiry = Date.now() + 3 * 60 * 1000 - 1000; // => ceil => 3

    render(<ChangePasswordModal isOpen={true} onClose={vi.fn()} />);

    expect(
      screen.getByText(/Account locked for 3 minutes/i)
    ).toBeTruthy();
  });

  it("validates required fields and shows validation hints on Update when inputs are empty", () => {
    const { container } = render(
      <ChangePasswordModal isOpen={true} onClose={vi.fn()} />
    );
    const form = container.querySelector("form")!;
    fireEvent.submit(form);

    expect(screen.getByText("Current password is required")).toBeTruthy();
    expect(screen.getByText("Please confirm your password")).toBeTruthy();
  });

  it("submits successfully and opens success modal", async () => {
    const onClose = vi.fn();
    const dispatchResult = { unwrap: () => Promise.resolve({}) };
    mockDispatch.mockReturnValue(dispatchResult as any);

    const { container } = render(
      <ChangePasswordModal isOpen={true} onClose={onClose} />
    );

    fireEvent.change(screen.getByLabelText("Current Password"), { target: { value: "CurrentPassword1!" } });
    fireEvent.change(screen.getByLabelText("New Password"), { target: { value: "NewPassword1!" } });
    fireEvent.change(screen.getByLabelText("Confirm New Password"), { target: { value: "NewPassword1!" } });

    await waitFor(() => {
      const btn = screen.getByText("Update") as HTMLButtonElement;
      expect(btn.disabled).toBe(false);
    });

    fireEvent.submit(container.querySelector("form")!);

    // success modal opens after async update resolves
    expect(await screen.findByTestId("success-modal")).toBeTruthy();
    expect(onClose).toHaveBeenCalled();
  });

  it("shows profile error with attempts remaining on update failure", async () => {
    const dispatchResult = { unwrap: () => Promise.reject("2 attempts remaining") };
    mockDispatch.mockReturnValue(dispatchResult as any);

    const { container } = render(<ChangePasswordModal isOpen={true} onClose={vi.fn()} />);

    fireEvent.change(screen.getByLabelText("Current Password"), { target: { value: "CurrentPassword1!" } });
    fireEvent.change(screen.getByLabelText("New Password"), { target: { value: "NewPassword1!" } });
    fireEvent.change(screen.getByLabelText("Confirm New Password"), { target: { value: "NewPassword1!" } });

    fireEvent.submit(container.querySelector("form")!);

    // error message includes attempts remaining
    expect(await screen.findByTestId("error-message")).toHaveTextContent(
      "Invalid password (2 attempts remaining)"
    );
  });
});

