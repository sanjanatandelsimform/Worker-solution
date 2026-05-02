/**
 * DashboardPage - User Fetch Optimization Tests
 * Verify that /users/{id} API is NOT called unnecessarily after assessment completion
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import * as userSliceModule from "@/store/slices/userSlice";
import * as workforceSliceModule from "@/store/slices/workforceSlice";
import * as recommendationsSliceModule from "@/store/slices/recommendationsSlice";
import * as industrySliceModule from "@/store/slices/industrySlice";
import { renderWithProviders } from "../test-utils";
import DashboardPage from "@/pages/dashboard/DashboardPage";

vi.mock("@/hooks/useAssessmentStatus", () => ({
  useAssessmentStatus: () => ({
    completionCount: 4,
    assessmentData: { data: { status: "completed" } },
    isConnected: false,
    isLoading: false,
    isFinchCompleted: false,
    isFinchAssessmentIncomplete: false,
    refetch: vi.fn(),
    sectionCompletion: { workforce: true, compensation: true, benefits: true, goals: true },
  }),
}));

vi.mock("@/hooks/useFinchConnect", () => ({
  useFinchConnect: () => ({
    connectWithFinch: vi.fn(),
    reconnectWithFinch: vi.fn(),
    isLoading: false,
    isPageLoading: false,
    error: null,
    clearError: vi.fn(),
  }),
}));

vi.mock("@/hooks/useDashboardStatusPolling", () => ({
  useDashboardStatusPolling: () => ({
    isRecommendationTabReady: true,
    isWorkforceTabReady: true,
    isIndustryTabReady: true,
    hasExceededProcessingWindow: false,
    isRecommendationTabStale: false,
    isWorkforceTabStale: false,
    isIndustryTabStale: false,
    isAutomatedProvider: false,
    isReauthRequired: false,
  }),
}));

vi.mock("@/pages/benchmark/BenchmarkPage", () => ({
  default: () => <div>BenchmarkPage</div>,
}));

vi.mock("@/components/dashboard/DashboardSidebar", () => ({
  DashboardSidebar: () => <div>Sidebar</div>,
}));

vi.mock("@/pages/recommendations/RecommendationsFinchPage", () => ({
  default: () => <div>RecommendationsFinchPage</div>,
}));

vi.mock("@/pages/benchmark/BenchmarkFinchPage", () => ({
  default: () => <div>BenchmarkFinchPage</div>,
}));

vi.mock("@/pages/workforce/WorkforcePage", () => ({
  default: () => <div>WorkforcePage</div>,
}));

const mockFetchUserById = vi.fn();
vi.spyOn(userSliceModule, "fetchUserById").mockImplementation(mockFetchUserById as any);
vi.spyOn(workforceSliceModule, "fetchWorkforce").mockReturnValue({
  type: "workforce/fetch",
} as any);
vi.spyOn(recommendationsSliceModule, "fetchRecommendations").mockReturnValue({
  type: "recommendations/fetch",
} as any);
vi.spyOn(industrySliceModule, "fetchIndustry").mockReturnValue({ type: "industry/fetch" } as any);

describe("DashboardPage - User Fetch Optimization", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    localStorage.setItem(
      "userDetail",
      JSON.stringify({
        auth: {
          user: {
            id: "user-123",
            firstName: "John",
            lastName: "Doe",
            businessEmail: "john@example.com",
            emailVerify: true,
          },
          tokens: { accessToken: "test-token" },
        },
      })
    );
  });

  it("should NOT call fetchUserById when detailed user data already exists in Redux", async () => {
    const preloadedState = {
      auth: {
        user: {
          id: "user-123",
          firstName: "John",
          lastName: "Doe",
          businessEmail: "john@example.com",
          emailVerify: true,
        },
        isAuthenticated: true,
        loading: false,
        error: null,
      },
      user: {
        data: {
          id: "user-123",
          firstName: "John",
          lastName: "Doe",
          businessEmail: "john@example.com",
          emailVerify: true,
          createdAt: "2024-01-01",
          updatedAt: "2024-01-01",
        },
        loading: false,
        error: null,
      },
    };

    renderWithProviders(<DashboardPage />, { preloadedState });

    await waitFor(() => {
      expect(screen.getByText(/Hi, John!/i)).toBeInTheDocument();
    });

    // Verify fetchUserById was NOT called because user data already exists
    expect(mockFetchUserById).not.toHaveBeenCalled();
  });

  it("should call fetchUserById when detailed user data is missing from Redux", async () => {
    mockFetchUserById.mockResolvedValue({
      unwrap: () =>
        Promise.resolve({
          id: "user-123",
          firstName: "John",
          lastName: "Doe",
          businessEmail: "john@example.com",
          emailVerify: true,
          createdAt: "2024-01-01",
          updatedAt: "2024-01-01",
        }),
    });

    const preloadedState = {
      auth: {
        user: {
          id: "user-123",
          firstName: "John",
          lastName: "Doe",
          businessEmail: "john@example.com",
          emailVerify: true,
        },
        isAuthenticated: true,
        loading: false,
        error: null,
      },
      user: {
        data: null, // No detailed user data
        loading: false,
        error: null,
      },
    };

    renderWithProviders(<DashboardPage />, { preloadedState });

    await waitFor(() => {
      expect(mockFetchUserById).toHaveBeenCalledWith({
        userId: "user-123",
        token: "test-token",
      });
    });

    expect(mockFetchUserById).toHaveBeenCalledTimes(1);
  });

  it("should call fetchUserById when user ID changes", async () => {
    mockFetchUserById.mockResolvedValue({
      unwrap: () =>
        Promise.resolve({
          id: "user-456",
          firstName: "Jane",
          lastName: "Smith",
          businessEmail: "jane@example.com",
          emailVerify: true,
          createdAt: "2024-01-01",
          updatedAt: "2024-01-01",
        }),
    });

    const preloadedState = {
      auth: {
        user: {
          id: "user-456", // Different user ID
          firstName: "Jane",
          lastName: "Smith",
          businessEmail: "jane@example.com",
          emailVerify: true,
        },
        isAuthenticated: true,
        loading: false,
        error: null,
      },
      user: {
        data: {
          id: "user-123", // Old user data
          firstName: "John",
          lastName: "Doe",
          businessEmail: "john@example.com",
          emailVerify: true,
          createdAt: "2024-01-01",
          updatedAt: "2024-01-01",
        },
        loading: false,
        error: null,
      },
    };

    renderWithProviders(<DashboardPage />, { preloadedState });

    await waitFor(() => {
      expect(mockFetchUserById).toHaveBeenCalledWith({
        userId: "user-456",
        token: "test-token",
      });
    });

    expect(mockFetchUserById).toHaveBeenCalledTimes(1);
  });
});
