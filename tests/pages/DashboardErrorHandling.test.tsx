/**
 * Dashboard Error Handling Tests
 *
 * Integration tests for DashboardPage error handling flows.
 * Tests timeout, 500 error, network failure scenarios and retry behavior.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import DashboardPage from "@/pages/dashboard/DashboardPage";
import dashboardReducer from "@/store/slices/dashboardSlice";
import * as dashboardApi from "@/services/api/dashboardApi";
import type { DashboardState } from "@/types/dashboardTypes";

// Mock the API module
vi.mock("@/services/api/dashboardApi");

// Mock other dependencies
vi.mock("@/components/common/LoadingSpinner", () => ({
  default: () => <div>Loading...</div>,
}));

vi.mock("@/components/common/ErrorMessage", () => ({
  default: ({
    message,
    actionLabel,
    onAction,
  }: {
    message: string;
    actionLabel?: string;
    onAction?: () => void;
  }) => (
    <div>
      <div data-testid="error-message">{message}</div>
      {onAction && (
        <button data-testid="error-action-button" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  ),
}));

// Helper to create a test store
// const createTestStore = (initialState?: any) => {
const createTestStore = (initialState?: { dashboard: DashboardState }) => {
  return configureStore({
    reducer: {
      dashboard: dashboardReducer,
      // Add other required reducers here if needed
    },
    preloadedState: initialState,
  });
};

describe("DashboardPage Error Handling", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should display timeout error with retry button", async () => {
    // Arrange: Mock timeout error
    const timeoutError = new Error("Request timed out. Please try again.");
    vi.spyOn(dashboardApi, "getDashboard").mockRejectedValueOnce(timeoutError);

    const store = createTestStore({
      dashboard: {
        data: null,
        loading: false,
        error: "Request timed out. Please try again.",
        lastFetched: null,
      },
    });

    // Act: Render DashboardPage with error state
    render(
      <Provider store={store}>
        <DashboardPage />
      </Provider>
    );

    // Assert: Should show error message
    await waitFor(() => {
      expect(screen.getByTestId("error-message")).toHaveTextContent(
        "Request timed out. Please try again."
      );
    });

    // Assert: Should show retry button
    expect(screen.getByTestId("error-action-button")).toBeInTheDocument();
  });

  it("should display 500 server error with retry button", async () => {
    // Arrange: Mock 500 error
    const serverError = new Error("Internal server error. Please try again later.");
    vi.spyOn(dashboardApi, "getDashboard").mockRejectedValueOnce(serverError);

    const store = createTestStore({
      dashboard: {
        data: null,
        loading: false,
        error: "Internal server error. Please try again later.",
        lastFetched: null,
      },
    });

    // Act: Render DashboardPage with error state
    render(
      <Provider store={store}>
        <DashboardPage />
      </Provider>
    );

    // Assert: Should show error message
    await waitFor(() => {
      expect(screen.getByTestId("error-message")).toHaveTextContent(
        "Internal server error. Please try again later."
      );
    });

    // Assert: Should show retry button
    expect(screen.getByTestId("error-action-button")).toBeInTheDocument();
  });

  it("should display network error with retry button", async () => {
    // Arrange: Mock network error
    const networkError = new Error("Network Error");
    vi.spyOn(dashboardApi, "getDashboard").mockRejectedValueOnce(networkError);

    const store = createTestStore({
      dashboard: {
        data: null,
        loading: false,
        error: "Network Error",
        lastFetched: null,
      },
    });

    // Act: Render DashboardPage with error state
    render(
      <Provider store={store}>
        <DashboardPage />
      </Provider>
    );

    // Assert: Should show error message
    await waitFor(() => {
      expect(screen.getByTestId("error-message")).toHaveTextContent("Network Error");
    });

    // Assert: Should show retry button
    expect(screen.getByTestId("error-action-button")).toBeInTheDocument();
  });

  it("should call getDashboard again when retry button is clicked", async () => {
    // Arrange: Mock initial error then success
    const mockData = {
      companyAtGlance: {
        totalWorkforce: 1250,
        averageHourlyWage: 18.5,
        averageSalary: 52000,
      },
      strategicRecommendations: [],
      industryOverview: null,
      turnoverVoluntaryVsInvoluntary: null,
      rateOfSeparation: null,
      areaMedianWage: [],
      housingCost: [],
    };

    const getDashboardSpy = vi.spyOn(dashboardApi, "getDashboard").mockResolvedValueOnce(mockData);

    const store = createTestStore({
      dashboard: {
        data: null,
        loading: false,
        error: "Request timed out. Please try again.",
        lastFetched: null,
      },
    });

    // Act: Render DashboardPage with error state
    render(
      <Provider store={store}>
        <DashboardPage />
      </Provider>
    );

    // Get retry button
    const retryButton = await screen.findByTestId("error-action-button");

    // Act: Click retry button
    fireEvent.click(retryButton);

    // Assert: Should call getDashboard again
    await waitFor(() => {
      expect(getDashboardSpy).toHaveBeenCalledTimes(1);
    });
  });

  it("should show loading state during retry", async () => {
    // Arrange: Mock delayed success
    const mockData = {
      companyAtGlance: {
        totalWorkforce: 1250,
        averageHourlyWage: 18.5,
        averageSalary: 52000,
      },
      strategicRecommendations: [],
      industryOverview: null,
      turnoverVoluntaryVsInvoluntary: null,
      rateOfSeparation: null,
      areaMedianWage: [],
      housingCost: [],
    };

    vi.spyOn(dashboardApi, "getDashboard").mockImplementation(
      () =>
        new Promise(resolve => {
          setTimeout(() => resolve(mockData), 100);
        })
    );

    const store = createTestStore({
      dashboard: {
        data: null,
        loading: false,
        error: "Request timed out. Please try again.",
        lastFetched: null,
      },
    });

    // Act: Render DashboardPage with error state
    render(
      <Provider store={store}>
        <DashboardPage />
      </Provider>
    );

    // Get retry button
    const retryButton = await screen.findByTestId("error-action-button");

    // Act: Click retry button
    fireEvent.click(retryButton);

    // Assert: Should show "Retrying..." text on button
    await waitFor(() => {
      expect(retryButton).toHaveTextContent("Retrying...");
    });
  });
});
