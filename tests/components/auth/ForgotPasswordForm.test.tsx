import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { renderWithProviders } from "../../test-utils";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock("@/services/api/authApi", () => ({
  forgotPassword: vi.fn(),
}));

vi.mock("@/assets/logo.svg", () => ({ default: "logo.svg" }));
vi.mock("@/assets/finch-checkmark.svg", () => ({ default: "checkmark.svg" }));

describe("ForgotPasswordForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the form with heading and email input", () => {
    renderWithProviders(<ForgotPasswordForm />);
    expect(screen.getByText("Forgot your password?")).toBeInTheDocument();
    expect(screen.getByText("Reset Password")).toBeInTheDocument();
    expect(screen.getByText("Sign up")).toBeInTheDocument();
  });

  it("renders sign up link", () => {
    renderWithProviders(<ForgotPasswordForm />);
    const link = screen.getByText("Sign up");
    expect(link).toHaveAttribute("href", "/sign-up");
  });

  it("submits form and navigates on success", async () => {
    const { forgotPassword } = await import("@/services/api/authApi");
    (forgotPassword as ReturnType<typeof vi.fn>).mockResolvedValueOnce({});

    renderWithProviders(<ForgotPasswordForm />);

    const emailInput = screen.getByPlaceholderText("olivia@untitledui.com");
    fireEvent.input(emailInput, { target: { value: "test@example.com" } });
    fireEvent.blur(emailInput);

    const form = emailInput.closest("form")!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(forgotPassword).toHaveBeenCalledWith("test@example.com");
    });
  });

  it("shows error message on API failure", async () => {
    const { forgotPassword } = await import("@/services/api/authApi");
    (forgotPassword as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("Network error"));

    renderWithProviders(<ForgotPasswordForm />);

    const emailInput = screen.getByPlaceholderText("olivia@untitledui.com");
    fireEvent.input(emailInput, { target: { value: "test@example.com" } });
    fireEvent.blur(emailInput);

    const form = emailInput.closest("form")!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(forgotPassword).toHaveBeenCalled();
    });
  });
});
