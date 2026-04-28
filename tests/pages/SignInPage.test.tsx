/**
 * SignInPage & SignInForm Tests
 */
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { SignInPage } from "@/pages/auth/SignInPage";
import { signin } from "@/services/api/authApi";
import { createTestStore } from "../test-utils";

vi.mock("@/services/api/authApi", () => ({
  signin: vi.fn(),
}));

vi.mock("@/assets/logo.svg", () => ({ default: "logo.svg" }));

const mockSignin = vi.mocked(signin);

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

function renderSignInPage() {
  const store = createTestStore();
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <SignInPage />
      </MemoryRouter>
    </Provider>
  );
}

describe("SignInPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

<<<<<<< HEAD
  describe("render", () => {
    it("should render A2B logo and Log in heading", () => {
      renderSignInPage();
      expect(screen.getByText("A2B")).toBeInTheDocument();
      expect(screen.getByText("Log in to your account")).toBeInTheDocument();
      expect(screen.getByText(/Welcome back! Please enter your details/)).toBeInTheDocument();
=======
  it("should render log in heading and description", () => {
    renderSignInPage();
    expect(screen.getByText("Log in to your account")).toBeInTheDocument();
    expect(screen.getByText(/Welcome back! Please enter your details/)).toBeInTheDocument();
  });

  it("should render logo image", () => {
    renderSignInPage();
    expect(screen.getByAltText("Logo")).toBeInTheDocument();
  });

  it("should render form fields and links", () => {
    renderSignInPage();
    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByText("Password")).toBeInTheDocument();
    expect(screen.getByText(/Remember for 30 days/i)).toBeInTheDocument();
    expect(screen.getByText("Sign in")).toBeInTheDocument();
    expect(screen.getByText("Forgot password?")).toBeInTheDocument();
    expect(screen.getByText("Sign up")).toBeInTheDocument();
  });

  it("should call signin and navigate to dashboard on success", async () => {
    mockSignin.mockResolvedValueOnce({
      status: true,
      message: "OK",
      data: {
        user: {
          id: "user-1",
          firstName: "Jane",
          lastName: "Doe",
          businessName: "Acme",
          phoneNumber: "+15551234567",
          industry: { id: 1, industry_name: "Tech", industry_code: "TECH" },
          zipCode: 94102,
          emailVerify: true,
          createdAt: "2026-01-01T00:00:00Z",
          updatedAt: "2026-01-01T00:00:00Z",
        },
        tokens: { accessToken: "at", refreshToken: "rt" },
      },
>>>>>>> develop1
    });

    renderSignInPage();

    const emailInput = document.querySelector('input[name="email"]');
    if (emailInput) fireEvent.change(emailInput, { target: { value: "user@example.com" } });
    const passwordInput = document.querySelector('input[type="password"]');
    if (passwordInput) fireEvent.change(passwordInput, { target: { value: "Password123!" } });

    fireEvent.click(screen.getByText("Sign in"));

    await waitFor(() => {
      expect(mockSignin).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("should handle signin error", async () => {
    mockSignin.mockRejectedValueOnce(new Error("Network error"));

    renderSignInPage();

    const emailInput = document.querySelector('input[name="email"]');
    if (emailInput) fireEvent.change(emailInput, { target: { value: "user@example.com" } });
    const passwordInput = document.querySelector('input[type="password"]');
    if (passwordInput) fireEvent.change(passwordInput, { target: { value: "Password123!" } });

    fireEvent.click(screen.getByText("Sign in"));

    await waitFor(() => {
      expect(mockSignin).toHaveBeenCalled();
    });
  });
});
