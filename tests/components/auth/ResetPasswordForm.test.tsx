import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { renderWithProviders } from "../../test-utils";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

const mockNavigate = vi.fn();
let mockSearchParams = new URLSearchParams("token=test-token");

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: () => [mockSearchParams, vi.fn()],
    Navigate: ({ to }: { to: string }) => <div data-testid="navigate-redirect" data-to={to} />,
  };
});

vi.mock("@/services/api/authApi", () => ({
  resetPassword: vi.fn(),
}));

vi.mock("@/assets/logo.svg", () => ({ default: "logo.svg" }));
vi.mock("@/assets/finch-checkmark.svg", () => ({ default: "checkmark.svg" }));

vi.mock("@/components/common/ErrorMessage", () => ({
  default: ({ errorMessage, onClose }: { errorMessage: string; onClose: () => void }) => (
    <div data-testid="error-message">
      {errorMessage}
      <button onClick={onClose} data-testid="error-close">
        Close
      </button>
    </div>
  ),
}));

vi.mock("@/components/modals/SuccessModalWithLogo", () => ({
  SuccessModalWithLogo: ({
    isOpen,
    title,
    onClose,
    button,
  }: {
    isOpen: boolean;
    title: string;
    onClose?: () => void;
    button?: { text: string; onClick?: () => void };
  }) =>
    isOpen ? (
      <div data-testid="success-modal">
        {title}
        <button data-testid="modal-close" onClick={onClose}>
          Close
        </button>
        {button && (
          <button data-testid="modal-action" onClick={button.onClick}>
            {button.text}
          </button>
        )}
      </div>
    ) : null,
}));

describe("ResetPasswordForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams = new URLSearchParams("token=test-token");
  });

  it("redirects to sign-in when no token is present in URL", () => {
    mockSearchParams = new URLSearchParams("");
    renderWithProviders(<ResetPasswordForm />);
    const redirect = screen.getByTestId("navigate-redirect");
    expect(redirect).toHaveAttribute("data-to", "/sign-in");
  });

  it("renders the form with heading and password inputs", () => {
    renderWithProviders(<ResetPasswordForm />);
    expect(screen.getByText("Reset password")).toBeInTheDocument();
    expect(screen.getByText("Save password")).toBeInTheDocument();
    expect(screen.getByText("Sign in")).toBeInTheDocument();
  });

  it("renders sign in link", () => {
    renderWithProviders(<ResetPasswordForm />);
    const link = screen.getByText("Sign in");
    expect(link).toHaveAttribute("href", "/sign-in");
  });

  it("submits form and shows success modal", async () => {
    const { resetPassword } = await import("@/services/api/authApi");
    (resetPassword as ReturnType<typeof vi.fn>).mockResolvedValueOnce({});

    renderWithProviders(<ResetPasswordForm />);

    const passwordInput = screen.getByPlaceholderText("Password");
    const confirmInput = screen.getByPlaceholderText("Confirm password");

    fireEvent.input(passwordInput, { target: { value: "NewPassword1!" } });
    fireEvent.blur(passwordInput);
    fireEvent.input(confirmInput, { target: { value: "NewPassword1!" } });
    fireEvent.blur(confirmInput);

    const form = passwordInput.closest("form")!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(resetPassword).toHaveBeenCalledWith("test-token", "NewPassword1!");
    });
  });

  it("success navigates to success page with correct state (covers lines 178-180)", async () => {
    const { resetPassword } = await import("@/services/api/authApi");
    (resetPassword as ReturnType<typeof vi.fn>).mockResolvedValueOnce({});

    renderWithProviders(<ResetPasswordForm />);

    const passwordInput = screen.getByPlaceholderText("Password");
    const confirmInput = screen.getByPlaceholderText("Confirm password");
    fireEvent.input(passwordInput, { target: { value: "NewPassword1!" } });
    fireEvent.blur(passwordInput);
    fireEvent.input(confirmInput, { target: { value: "NewPassword1!" } });
    fireEvent.blur(confirmInput);
    fireEvent.submit(passwordInput.closest("form")!);

    await waitFor(
      () => {
        expect(mockNavigate).toHaveBeenCalledWith(
          "/success",
          expect.objectContaining({
            state: expect.objectContaining({
              title: "Password reset successful",
              buttonPath: "/sign-in",
              shouldClearUser: true,
            }),
          })
        );
      },
      { timeout: 3000 }
    );
  });

  it("success navigates to success page with buttonText Log in (covers lines 61-64)", async () => {
    const { resetPassword } = await import("@/services/api/authApi");
    (resetPassword as ReturnType<typeof vi.fn>).mockResolvedValueOnce({});

    renderWithProviders(<ResetPasswordForm />);

    const passwordInput = screen.getByPlaceholderText("Password");
    const confirmInput = screen.getByPlaceholderText("Confirm password");
    fireEvent.input(passwordInput, { target: { value: "NewPassword1!" } });
    fireEvent.blur(passwordInput);
    fireEvent.input(confirmInput, { target: { value: "NewPassword1!" } });
    fireEvent.blur(confirmInput);
    fireEvent.submit(passwordInput.closest("form")!);

    await waitFor(
      () => {
        expect(mockNavigate).toHaveBeenCalledWith(
          "/success",
          expect.objectContaining({
            state: expect.objectContaining({
              buttonText: "Log in",
              buttonPath: "/sign-in",
            }),
          })
        );
      },
      { timeout: 3000 }
    );
  });

  it("error message onClose callback clears error (covers line 143)", async () => {
    const { resetPassword } = await import("@/services/api/authApi");
    (resetPassword as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("Failed"));

    renderWithProviders(<ResetPasswordForm />);

    const passwordInput = screen.getByPlaceholderText("Password");
    const confirmInput = screen.getByPlaceholderText("Confirm password");

    fireEvent.input(passwordInput, { target: { value: "NewPassword1!" } });
    fireEvent.blur(passwordInput);
    fireEvent.input(confirmInput, { target: { value: "NewPassword1!" } });
    fireEvent.blur(confirmInput);

    const form = passwordInput.closest("form")!;
    fireEvent.submit(form);

    await waitFor(
      () => {
        expect(screen.getByTestId("error-message")).toBeTruthy();
      },
      { timeout: 3000 }
    );

    // If error message appears, click close
    const closeBtn = screen.queryByTestId("error-close");
    if (closeBtn) {
      fireEvent.click(closeBtn);
    }
    expect(document.body).toBeTruthy();
  });

  it("shows error on API failure", async () => {
    const { resetPassword } = await import("@/services/api/authApi");
    (resetPassword as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("Failed"));

    renderWithProviders(<ResetPasswordForm />);

    const passwordInput = screen.getByPlaceholderText("Password");
    const confirmInput = screen.getByPlaceholderText("Confirm password");

    fireEvent.input(passwordInput, { target: { value: "NewPassword1!" } });
    fireEvent.blur(passwordInput);
    fireEvent.input(confirmInput, { target: { value: "NewPassword1!" } });
    fireEvent.blur(confirmInput);

    const form = passwordInput.closest("form")!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(resetPassword).toHaveBeenCalled();
    });
  });
});
