/**
 * Dashboard Page Tests
 *
 * Unit tests for DashboardPage: render with user, welcome message, and assessment CTA.
 */

import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter } from "react-router-dom";
import DashboardPage from "@/pages/dashboard/DashboardPage";
import authReducer from "@/store/slices/authSlice";
import profileReducer from "@/store/slices/profileSlice";
import registrationFormReducer from "@/store/slices/registrationFormSlice";
import userReducer from "@/store/slices/userSlice";
import dashboardReducer from "@/store/slices/dashboardSlice";
import type { UserAccount } from "@/types/auth";

vi.mock("@/hooks/useAssessmentStatus", () => ({
  useAssessmentStatus: () => ({ completionCount: 0, isLoading: false }),
}));

vi.mock("@/components/common/ErrorMessage", () => ({
  default: ({ errorMessage }: { errorMessage: string }) => (
    <div data-testid="error-message">{errorMessage}</div>
  ),
}));

vi.mock("@/assets/mail-icon.svg", () => ({ default: "mail-icon.svg" }));
vi.mock("@/assets/file-check.svg", () => ({ default: "file-check.svg" }));
vi.mock("@/assets/fpo-hero-image.png", () => ({ default: "fpo-hero-image.png" }));

const mockUser: UserAccount = {
  id: "user-1",
  firstName: "Jane",
  lastName: "Doe",
  businessName: "Acme",
  phoneNumber: "+15551234567",
  industry: { id: 1, industry_name: "Tech", industry_code: "TECH" },
  zipCode: 94102,
  emailVerify: false,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
};

const createTestStore = (overrides?: { auth?: { user: UserAccount | null } }) =>
  configureStore({
    reducer: {
      auth: authReducer,
      profile: profileReducer,
      registrationForm: registrationFormReducer,
      user: userReducer,
      dashboard: dashboardReducer,
    },
    preloadedState: {
      auth: {
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
        authInitAttempted: true,
        tokens: { accessToken: "at", refreshToken: "rt" },
        ...overrides?.auth,
      },
      profile: {
        loading: false,
        error: null,
        passwordAttempts: 0,
        isAccountLocked: false,
        lockoutExpiry: null,
      },
      dashboard: { data: null, loading: false, error: null, lastFetched: null },
    },
  });

function renderDashboardPage(store = createTestStore()) {
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    </Provider>
  );
}

describe("DashboardPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: vi.fn(() =>
          JSON.stringify({
            auth: { user: mockUser, tokens: { accessToken: "at", refreshToken: "rt" } },
          })
        ),
        setItem: vi.fn(),
        removeItem: vi.fn(),
      },
      writable: true,
    });
  });

  it("should render welcome message when user is present", async () => {
    renderDashboardPage();

    await waitFor(() => {
      expect(screen.getByText("Welcome!")).toBeInTheDocument();
    });
  });

  it("should render assessment CTA when completionCount is not 4", async () => {
    renderDashboardPage();

    await waitFor(() => {
      expect(screen.getByText(/Take the Assessment/i)).toBeInTheDocument();
    });
  });

  it("should render verify email card when user has not verified email", async () => {
    renderDashboardPage();

    await waitFor(() => {
      expect(screen.getByText("Verify your email")).toBeInTheDocument();
    });
  });
});
