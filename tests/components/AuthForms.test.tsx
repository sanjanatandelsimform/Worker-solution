import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

vi.mock("@/services/api/authApi", () => ({
  forgotPassword: vi.fn(),
  resetPassword: vi.fn(),
  default: { interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } } },
}));
vi.mock("@/assets/logo.svg", () => ({ default: "logo.svg" }));
vi.mock("@/assets/finch-checkmark.svg", () => ({ default: "check.svg" }));
vi.mock("@/components/modals/SuccessModalWithLogo", () => ({
  SuccessModalWithLogo: () => null,
}));

import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

const wrap = (ui: React.ReactNode) => (
  <MemoryRouter initialEntries={["/reset-password?token=abc123"]}>{ui}</MemoryRouter>
);

describe("ForgotPasswordForm", () => {
  it("renders heading", () => {
    render(wrap(<ForgotPasswordForm />));
    expect(screen.getByText("Forgot your password?")).toBeInTheDocument();
  });

  it("renders email field", () => {
    render(wrap(<ForgotPasswordForm />));
    expect(screen.getByText("Business Email Address")).toBeInTheDocument();
  });

  it("renders submit button", () => {
    render(wrap(<ForgotPasswordForm />));
    expect(screen.getByText("Reset Password")).toBeInTheDocument();
  });

  it("renders sign up link", () => {
    render(wrap(<ForgotPasswordForm />));
    expect(screen.getByText("Sign up")).toBeInTheDocument();
  });
});

describe("ResetPasswordForm", () => {
  it("renders heading", () => {
    render(wrap(<ResetPasswordForm />));
    expect(screen.getByText("Reset password")).toBeInTheDocument();
  });

  it("renders password fields", () => {
    render(wrap(<ResetPasswordForm />));
    expect(screen.getByText("Password")).toBeInTheDocument();
    expect(screen.getByText("Confirm Password")).toBeInTheDocument();
  });

  it("renders submit button", () => {
    render(wrap(<ResetPasswordForm />));
    expect(screen.getByText("Save password")).toBeInTheDocument();
  });

  it("renders sign in link", () => {
    render(wrap(<ResetPasswordForm />));
    expect(screen.getByText("Sign in")).toBeInTheDocument();
  });
});
