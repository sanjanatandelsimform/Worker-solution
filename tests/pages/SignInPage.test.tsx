/**
 * Sign In Page Tests
 *
 * Unit tests for SignInPage and SignInForm: render, form fields, submit success and error.
 */

import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { SignInPage } from "@/pages/auth/SignInPage";
import { signin } from "@/services/api/authApi";

vi.mock("@/services/api/authApi", () => ({
  signin: vi.fn(),
}));

vi.mock("@/assets/finch-checkmark.svg", () => ({ default: "finch-checkmark.svg" }));

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
  return render(
    <MemoryRouter>
      <SignInPage />
    </MemoryRouter>
  );
}

describe("SignInPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("render", () => {
    it("should render BeneStats logo and Log in heading", () => {
      renderSignInPage();
      expect(screen.getByText("BeneStats")).toBeInTheDocument();
      expect(screen.getByText("Log in to your account")).toBeInTheDocument();
      expect(screen.getByText(/Welcome back! Please enter your details/)).toBeInTheDocument();
    });

    it("should render email and password inputs", () => {
      renderSignInPage();
      expect(screen.getByRole("textbox", { name: /email/i })).toBeInTheDocument();
      const passwordInput = document.querySelector('input[type="password"]');
      expect(passwordInput).toBeInTheDocument();
    });

    it("should render remember me checkbox and sign in button", () => {
      renderSignInPage();
      expect(screen.getByRole("checkbox", { name: /remember me/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /sign in|log in/i })).toBeInTheDocument();
    });
  });

  describe("submit", () => {
    it("should call signin and navigate to success on successful login", async () => {
      const mockUser = {
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
      };
      mockSignin.mockResolvedValueOnce({
        status: true,
        message: "OK",
        data: {
          user: mockUser,
          tokens: { accessToken: "at", refreshToken: "rt" },
        },
      });

      renderSignInPage();

      fireEvent.change(screen.getByRole("textbox", { name: /email/i }), {
        target: { value: "user@example.com" },
      });
      const passwordInput = document.querySelector('input[type="password"]');
      if (passwordInput) {
        fireEvent.change(passwordInput, { target: { value: "Password123!" } });
      }
      fireEvent.click(screen.getByRole("button", { name: /sign in|log in/i }));

      await waitFor(() => {
        expect(mockSignin).toHaveBeenCalledWith({
          businessEmail: "user@example.com",
          password: "Password123!",
          rememberMe: false,
        });
      });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/success", {
          state: expect.objectContaining({
            title: "Sign In Successful!",
            buttonText: "Go to Dashboard",
            buttonPath: "/dashboard",
          }),
        });
      });
    });

    it("should show error when signin returns error status", async () => {
      mockSignin.mockResolvedValueOnce({
        status: "error",
        message: "Incorrect email or password",
      });

      renderSignInPage();

      fireEvent.change(screen.getByRole("textbox", { name: /email/i }), {
        target: { value: "user@example.com" },
      });
      const passwordInput = document.querySelector('input[type="password"]');
      if (passwordInput) {
        fireEvent.change(passwordInput, { target: { value: "wrong" } });
      }
      fireEvent.click(screen.getByRole("button", { name: /sign in|log in/i }));

      await waitFor(() => {
        expect(screen.getByText(/Incorrect email or password/i)).toBeInTheDocument();
      });
    });

    it("should show error when signin throws", async () => {
      mockSignin.mockRejectedValueOnce(new Error("Network error"));

      renderSignInPage();

      fireEvent.change(screen.getByRole("textbox", { name: /email/i }), {
        target: { value: "user@example.com" },
      });
      const passwordInput = document.querySelector('input[type="password"]');
      if (passwordInput) {
        fireEvent.change(passwordInput, { target: { value: "Password123!" } });
      }
      fireEvent.click(screen.getByRole("button", { name: /sign in|log in/i }));

      await waitFor(() => {
        expect(screen.getByText(/Network error|error/i)).toBeInTheDocument();
      });
    });
  });
});
