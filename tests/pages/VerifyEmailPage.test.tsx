/**
 * Email Verification Flow Tests
 *
 * Unit tests for VerifyEmailPage: token handling, success navigation, error display.
 */

import React from "react";
import { describe, it, expect, vi, beforeEach, afterAll, beforeAll } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter, useNavigate, useSearchParams } from "react-router-dom";
import { VerifyEmailPage } from "@/pages/auth/VerifyEmailPage";
import authReducer from "@/store/slices/authSlice";
import profileReducer from "@/store/slices/profileSlice";
import registrationFormReducer from "@/store/slices/registrationFormSlice";
import userReducer from "@/store/slices/userSlice";
import dashboardReducer from "@/store/slices/dashboardSlice";
import { verifyEmail } from "@/services/api/authApi";

vi.mock("react-loader-spinner", () => ({
  Oval: () => <div data-testid="loading-spinner" aria-label="oval-loading" />,
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return {
    ...actual,
    useNavigate: vi.fn(),
    useSearchParams: vi.fn(),
  };
});

vi.mock("@/services/api/authApi", () => ({
  verifyEmail: vi.fn(),
}));

vi.mock("@/assets/success-check.svg", () => ({ default: "success-check.svg" }));

const mockNavigate = vi.mocked(useNavigate);
const mockUseSearchParams = vi.mocked(useSearchParams);

const createTestStore = () =>
  configureStore({
    reducer: {
      auth: authReducer,
      profile: profileReducer,
      registrationForm: registrationFormReducer,
      user: userReducer,
      dashboard: dashboardReducer,
    },
  });

function renderWithProviders(ui: React.ReactElement) {
  const store = createTestStore();
  return {
    ...render(
      <Provider store={store}>
        <MemoryRouter>{ui}</MemoryRouter>
      </Provider>
    ),
    store,
  };
}

describe("VerifyEmailPage", () => {
  const mockNavigateFn = vi.fn();
  const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

  beforeAll(() => {
    consoleErrorSpy.mockClear();
  });
  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockReturnValue(mockNavigateFn);
    Object.defineProperty(window, "localStorage", {
      value: { getItem: vi.fn(), setItem: vi.fn(), removeItem: vi.fn() },
      writable: true,
    });
  });

  describe("missing or invalid token", () => {
    it("should show error message when token is missing", async () => {
      mockUseSearchParams.mockReturnValue([
        new URLSearchParams(), // no token
      ] as ReturnType<typeof useSearchParams>);

      renderWithProviders(<VerifyEmailPage />);

      await waitFor(() => {
        expect(screen.getByText(/Invalid or missing verification token/i)).toBeInTheDocument();
      });

      expect(screen.getByText("Verification Failed")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Back to Sign In/i })).toBeInTheDocument();
    });
  });

  describe("valid token", () => {
    it("should call verifyEmail with token and navigate to success on success", async () => {
      const token = "valid-verification-token";
      mockUseSearchParams.mockReturnValue([new URLSearchParams({ token })] as ReturnType<
        typeof useSearchParams
      >);

      const mockUser = {
        id: "user-1",
        businessEmail: "user@example.com",
        emailVerify: true,
      };
      const mockTokens = {
        accessToken: "access-123",
        refreshToken: "refresh-456",
      };

      vi.mocked(verifyEmail).mockResolvedValueOnce({
        user: mockUser,
        tokens: mockTokens,
      });

      renderWithProviders(<VerifyEmailPage />);

      await waitFor(() => {
        expect(verifyEmail).toHaveBeenCalledWith(token);
      });

      await waitFor(() => {
        expect(mockNavigateFn).toHaveBeenCalledWith("/success", {
          state: expect.objectContaining({
            title: "Your email has been verified!",
            subtitle: expect.stringContaining("Welcome aboard"),
            buttonLabel: "Take the Assessment",
            buttonPath: "/assessment",
          }),
        });
      });
    });
  });

  describe("verification API error", () => {
    it("should show error UI when verifyEmail throws", async () => {
      mockUseSearchParams.mockReturnValue([
        new URLSearchParams({ token: "some-token" }),
      ] as ReturnType<typeof useSearchParams>);

      vi.mocked(verifyEmail).mockRejectedValueOnce(new Error("Link has expired"));

      renderWithProviders(<VerifyEmailPage />);

      await waitFor(() => {
        expect(verifyEmail).toHaveBeenCalledWith("some-token");
      });

      await waitFor(() => {
        expect(screen.getByText("Verification Failed")).toBeInTheDocument();
        expect(screen.getByText(/Link has expired|Unable to verify/i)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /Back to Sign In/i })).toBeInTheDocument();
      });
    });

    it("should show fallback error when thrown value is not an Error", async () => {
      mockUseSearchParams.mockReturnValue([
        new URLSearchParams({ token: "bad-token" }),
      ] as ReturnType<typeof useSearchParams>);

      vi.mocked(verifyEmail).mockRejectedValueOnce("Network error");

      renderWithProviders(<VerifyEmailPage />);

      await waitFor(() => {
        expect(verifyEmail).toHaveBeenCalledWith("bad-token");
      });

      await waitFor(() => {
        expect(screen.getByText("Verification Failed")).toBeInTheDocument();
        expect(
          screen.getByText(/Unable to verify email|request a new verification email/i)
        ).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /Back to Sign In/i })).toBeInTheDocument();
      });
    });
  });

  describe("loading state", () => {
    it("should show loading indicator while verifying", () => {
      mockUseSearchParams.mockReturnValue([
        new URLSearchParams({ token: "wait-token" }),
      ] as ReturnType<typeof useSearchParams>);

      vi.mocked(verifyEmail).mockImplementation(
        () => new Promise(() => {}) // never resolves
      );

      renderWithProviders(<VerifyEmailPage />);

      expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
    });
  });
});
