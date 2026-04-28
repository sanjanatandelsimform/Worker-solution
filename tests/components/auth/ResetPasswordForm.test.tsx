import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { renderWithProviders } from "../../test-utils";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: () => [new URLSearchParams("token=test-token"), vi.fn()],
  };
});

vi.mock("@/services/api/authApi", () => ({
  resetPassword: vi.fn(),
}));

vi.mock("@/assets/logo.svg", () => ({ default: "logo.svg" }));
vi.mock("@/assets/finch-checkmark.svg", () => ({ default: "checkmark.svg" }));

vi.mock("@/components/modals/SuccessModalWithLogo", () => ({
  SuccessModalWithLogo: ({ isOpen, title }: { isOpen: boolean; title: string }) =>
    isOpen ? <div data-testid="success-modal">{title}</div> : null,
}));

describe("ResetPasswordForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
    const confirmInput = screen.getByPlaceholderText("Confirm Password");

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

  it("shows error on API failure", async () => {
    const { resetPassword } = await import("@/services/api/authApi");
    (resetPassword as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("Failed"));

    renderWithProviders(<ResetPasswordForm />);

    const passwordInput = screen.getByPlaceholderText("Password");
    const confirmInput = screen.getByPlaceholderText("Confirm Password");

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
