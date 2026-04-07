/**
 * Dashboard Page Tests
 *
 * Unit tests for DashboardPage: render with user, welcome message, and assessment CTA.
 */

import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter } from "react-router-dom";
import DashboardPage from "@/pages/dashboard/DashboardPage";
import authReducer from "@/store/slices/authSlice";
import profileReducer from "@/store/slices/profileSlice";
import registrationFormReducer from "@/store/slices/registrationFormSlice";
import userReducer from "@/store/slices/userSlice";
import dashboardReducer from "@/store/slices/dashboardSlice";
import finchStatusReducer from "@/store/slices/finchStatusSlice";
import type { UserAccount } from "@/types/auth";
import { useAssessmentStatus } from "@/hooks/useAssessmentStatus";

vi.mock("@/hooks/useAssessmentStatus", () => ({
  useAssessmentStatus: vi.fn(() => ({ completionCount: 0, isLoading: false })),
}));

const mockConnectWithFinch = vi.fn();
const mockClearFinchError = vi.fn();
const mockUseFinchConnect = vi.fn(() => ({
  connectWithFinch: mockConnectWithFinch,
  isLoading: false,
  error: null,
  clearError: mockClearFinchError,
}));
vi.mock("@/hooks/useFinchConnect", () => ({
  useFinchConnect: (...args: unknown[]) => mockUseFinchConnect(...args),
}));

const mockUseFinchStatus = vi.fn(() => ({
  isConnected: false,
  connectionStatus: null,
  syncJobStatus: null,
  isLoading: false,
  error: null,
}));
vi.mock("@/hooks/useFinchStatus", () => ({
  useFinchStatus: () => mockUseFinchStatus(),
}));

vi.mock("@/components/common/ErrorMessage", () => ({
  default: ({ errorMessage }: { errorMessage: string }) => (
    <div data-testid="error-message">{errorMessage}</div>
  ),
}));

vi.mock("@/components/modals/InProgressModal", () => ({
  InProgressModal: () => null,
}));

vi.mock("@/components/modals/BaseModalWithIcon", () => ({
  BaseModalWithIcon: () => null,
}));

vi.mock("@/assets/mail-icon.svg", () => ({ default: "mail-icon.svg" }));
vi.mock("@/assets/file-check.svg", () => ({ default: "file-check.svg" }));
vi.mock("@/assets/fpo-hero-image.png", () => ({ default: "fpo-hero-image.png" }));
vi.mock("@/assets/finch-logo.svg", () => ({ default: "finch-logo.svg" }));

vi.mock("react-loader-spinner", () => ({
  Oval: () => null,
}));

vi.mock("@/components/dashboard/DashboardSidebar", () => ({
  DashboardSidebar: () => null,
}));

vi.mock("@/pages/recommendations/RecommendationsPage", () => ({
  default: () => null,
}));

vi.mock("@/pages/benchmark/BenchmarkPage", () => ({
  default: () => null,
}));

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
      finchStatus: finchStatusReducer,
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
    vi.mocked(useAssessmentStatus).mockReturnValue({
      completionCount: 0,
      isLoading: false,
    } as ReturnType<typeof useAssessmentStatus>);
    mockUseFinchConnect.mockReturnValue({
      connectWithFinch: mockConnectWithFinch,
      isLoading: false,
      error: null,
      clearError: mockClearFinchError,
    });
    mockUseFinchStatus.mockReturnValue({
      isConnected: false,
      connectionStatus: null,
      syncJobStatus: null,
      isLoading: false,
      error: null,
    });
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
      expect(screen.getByText(/Welcome,/)).toBeInTheDocument();
    });
  });

  it("should render assessment CTA when completionCount is not 4", async () => {
    renderDashboardPage(createTestStore({ auth: { user: { ...mockUser, emailVerify: true } } }));

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

  // T018 — clicking "Start with Finch" calls connectWithFinch
  it("clicking 'Start with Finch' button calls connectWithFinch", async () => {
    renderDashboardPage(createTestStore({ auth: { user: { ...mockUser, emailVerify: true } } }));

    await waitFor(() => {
      expect(screen.getByText("Start with Finch")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Start with Finch"));

    expect(mockConnectWithFinch).toHaveBeenCalledTimes(1);
  });

  // T017 — "Start with Finch" button is disabled when isLoading is true
  it("'Start with Finch' button is disabled when isFinchLoading is true", async () => {
    mockUseFinchConnect.mockReturnValue({
      connectWithFinch: mockConnectWithFinch,
      isLoading: true,
      error: null,
      clearError: mockClearFinchError,
    });
    renderDashboardPage(createTestStore({ auth: { user: { ...mockUser, emailVerify: true } } }));

    await waitFor(() => {
      expect(screen.getByText("Start with Finch")).toBeInTheDocument();
    });

    // React Aria Button with isDisabled sets data-disabled attribute
    const btn = screen.getByRole("button", { name: /Start with Finch/i });
    expect(btn).toHaveAttribute("data-disabled");
  });
});

// ── T011/T014/T015: Finch status visibility & Connect button ──────────────

/**
 * Helper to render with a verified email user so we can reach the cards.
 * useAssessmentStatus is globally mocked to return { completionCount: 0, isLoading: false }.
 */
const mockVerifiedUser: UserAccount = {
  id: "user-2",
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

function renderVerifiedDashboard() {
  const store = createTestStore({ auth: { user: mockVerifiedUser } });
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    </Provider>
  );
}

describe("DashboardPage — Finch status card visibility (T011/T014)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseFinchConnect.mockReturnValue({
      connectWithFinch: mockConnectWithFinch,
      isLoading: false,
      error: null,
      clearError: mockClearFinchError,
    });
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: vi.fn(() =>
          JSON.stringify({
            auth: { user: mockVerifiedUser, tokens: { accessToken: "at", refreshToken: "rt" } },
          })
        ),
        setItem: vi.fn(),
        removeItem: vi.fn(),
      },
      writable: true,
    });
  });

  // T011 — connected state hides cards
  it("hides Basic Plan and Connect with Finch choice cards when isConnected is true", async () => {
    mockUseFinchStatus.mockReturnValue({
      isConnected: true,
      connectionStatus: "connected",
      syncJobStatus: null,
      isLoading: false,
      error: null,
    });
    renderVerifiedDashboard();
    await waitFor(() => {
      expect(screen.queryByText("Basic Plan")).not.toBeInTheDocument();
    });
    expect(screen.queryByText(/Start with Finch/i)).not.toBeInTheDocument();
  });

  it("hides Take the Assessment card when isConnected is true", async () => {
    mockUseFinchStatus.mockReturnValue({
      isConnected: true,
      connectionStatus: "connected",
      syncJobStatus: null,
      isLoading: false,
      error: null,
    });
    renderVerifiedDashboard();
    await waitFor(() => {
      expect(screen.queryByText(/Take the Assessment/i)).not.toBeInTheDocument();
    });
  });

  // T014 — non-connected states show cards (backward compat)
  it("shows choice cards when connection status is disconnected", async () => {
    mockUseFinchStatus.mockReturnValue({
      isConnected: false,
      connectionStatus: "disconnected",
      syncJobStatus: null,
      isLoading: false,
      error: null,
    });
    renderVerifiedDashboard();
    await waitFor(() => {
      expect(screen.getByText(/Take the Assessment/i)).toBeInTheDocument();
    });
    expect(screen.getByText("Basic Plan")).toBeInTheDocument();
  });

  it("shows choice cards when connection status is reauth_required", async () => {
    mockUseFinchStatus.mockReturnValue({
      isConnected: false,
      connectionStatus: "reauth_required",
      syncJobStatus: null,
      isLoading: false,
      error: null,
    });
    renderVerifiedDashboard();
    await waitFor(() => {
      expect(screen.getByText("Basic Plan")).toBeInTheDocument();
    });
  });

  it("shows choice cards when connection is null (initial state)", async () => {
    mockUseFinchStatus.mockReturnValue({
      isConnected: false,
      connectionStatus: null,
      syncJobStatus: null,
      isLoading: false,
      error: null,
    });
    renderVerifiedDashboard();
    await waitFor(() => {
      expect(screen.getByText("Basic Plan")).toBeInTheDocument();
    });
  });

  it("shows choice cards when Finch status returns an error", async () => {
    mockUseFinchStatus.mockReturnValue({
      isConnected: false,
      connectionStatus: null,
      syncJobStatus: null,
      isLoading: false,
      error: "Network error",
    });
    renderVerifiedDashboard();
    await waitFor(() => {
      expect(screen.getByText("Basic Plan")).toBeInTheDocument();
    });
  });

  // does not crash when status API errors
  it("does not crash when Finch status returns an error", async () => {
    mockUseFinchStatus.mockReturnValue({
      isConnected: false,
      connectionStatus: null,
      syncJobStatus: null,
      isLoading: false,
      error: "Timeout",
    });
    expect(() => renderVerifiedDashboard()).not.toThrow();
  });
});

describe("DashboardPage — Connect to Finch button wiring (T015)", () => {
  const completedAssessmentMock = {
    completionCount: 4,
    assessmentData: { status: "completed", sections: {} } as ReturnType<
      typeof useAssessmentStatus
    >["assessmentData"],
    isLoading: false,
    error: null,
    sectionCompletion: { workforce: true, compensation: true, benefits: true, goals: true },
    refetch: vi.fn(),
  } as ReturnType<typeof useAssessmentStatus>;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAssessmentStatus).mockReturnValue(completedAssessmentMock);
    mockUseFinchConnect.mockReturnValue({
      connectWithFinch: mockConnectWithFinch,
      isLoading: false,
      error: null,
      clearError: mockClearFinchError,
    });
    mockUseFinchStatus.mockReturnValue({
      isConnected: false,
      connectionStatus: null,
      syncJobStatus: null,
      isLoading: false,
      error: null,
    });
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: vi.fn(() =>
          JSON.stringify({
            auth: { user: mockVerifiedUser, tokens: { accessToken: "at", refreshToken: "rt" } },
          })
        ),
        setItem: vi.fn(),
        removeItem: vi.fn(),
      },
      writable: true,
    });
  });

  it("Connect button on the 'Connect to Finch' banner calls connectWithFinch when assessment is completed", async () => {
    renderVerifiedDashboard();
    await waitFor(() => {
      expect(screen.getByText("Connect to Finch")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole("button", { name: /Connect/i }));
    expect(mockConnectWithFinch).toHaveBeenCalledTimes(1);
  });

  it("Connect button on the banner is disabled when isFinchLoading is true", async () => {
    mockUseFinchConnect.mockReturnValue({
      connectWithFinch: mockConnectWithFinch,
      isLoading: true,
      error: null,
      clearError: mockClearFinchError,
    });
    renderVerifiedDashboard();
    await waitFor(() => {
      expect(screen.getByText("Connect to Finch")).toBeInTheDocument();
    });
    const btn = screen.getByRole("button", { name: /Connect/i });
    expect(btn).toHaveAttribute("data-disabled");
  });
});

// ── Finch error inline display ────────────────────────────────────────────

describe("DashboardPage — Finch error display", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAssessmentStatus).mockReturnValue({
      completionCount: 0,
      isLoading: false,
    } as ReturnType<typeof useAssessmentStatus>);
    mockUseFinchStatus.mockReturnValue({
      isConnected: false,
      connectionStatus: null,
      syncJobStatus: null,
      isLoading: false,
      error: null,
    });
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: vi.fn(() =>
          JSON.stringify({
            auth: { user: mockVerifiedUser, tokens: { accessToken: "at", refreshToken: "rt" } },
          })
        ),
        setItem: vi.fn(),
        removeItem: vi.fn(),
      },
      writable: true,
    });
  });

  it("shows inline ErrorMessage when finchError is set (choice section)", async () => {
    mockUseFinchConnect.mockReturnValue({
      connectWithFinch: mockConnectWithFinch,
      isLoading: false,
      error: "Failed to start Finch Connect. Please try again.",
      clearError: mockClearFinchError,
    });
    render(
      <Provider store={createTestStore({ auth: { user: mockVerifiedUser } })}>
        <MemoryRouter>
          <DashboardPage />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("error-message")).toBeInTheDocument();
    });
    expect(screen.getByTestId("error-message")).toHaveTextContent(
      "Failed to start Finch Connect. Please try again."
    );
  });

  it("does not show ErrorMessage when finchError is null", async () => {
    mockUseFinchConnect.mockReturnValue({
      connectWithFinch: mockConnectWithFinch,
      isLoading: false,
      error: null,
      clearError: mockClearFinchError,
    });
    render(
      <Provider store={createTestStore({ auth: { user: mockVerifiedUser } })}>
        <MemoryRouter>
          <DashboardPage />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId("error-message")).not.toBeInTheDocument();
    });
  });
});
