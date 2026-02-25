/**
 * RecommendationsPage Tests
 *
 * Unit tests for RecommendationsPage component.
 * Tests number formatting, strategic recommendations sort order, and fallback behavior.
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import RecommendationsPage from "@/pages/recommendations/RecommendationsPage";
import dashboardReducer from "@/store/slices/dashboardSlice";
import type { DashboardState } from "@/types/dashboardTypes";

// Helper to create a test store
const createTestStore = (dashboardState: DashboardState) => {
  return configureStore({
    reducer: {
      dashboard: dashboardReducer,
      // Add other required reducers here if needed
    },
    preloadedState: {
      dashboard: dashboardState,
    },
  });
};

describe("RecommendationsPage", () => {
  it("should display formatted number for totalWorkforce", () => {
    // Arrange: Store with companyAtGlance data
    const store = createTestStore({
      data: {
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
      },
      loading: false,
      error: null,
      lastFetched: Date.now(),
    });

    // Act: Render RecommendationsPage
    render(
      <Provider store={store}>
        <RecommendationsPage />
      </Provider>
    );

    // Assert: Should display formatted number with comma (1,250)
    expect(screen.getByText("1,250")).toBeInTheDocument();
  });

  it("should display formatted currency for averageHourlyWage with cents", () => {
    // Arrange: Store with companyAtGlance data
    const store = createTestStore({
      data: {
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
      },
      loading: false,
      error: null,
      lastFetched: Date.now(),
    });

    // Act: Render RecommendationsPage
    render(
      <Provider store={store}>
        <RecommendationsPage />
      </Provider>
    );

    // Assert: Should display formatted currency with cents ($18.50)
    expect(screen.getByText("$18.50")).toBeInTheDocument();
  });

  it("should display formatted currency for averageSalary without cents", () => {
    // Arrange: Store with companyAtGlance data
    const store = createTestStore({
      data: {
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
      },
      loading: false,
      error: null,
      lastFetched: Date.now(),
    });

    // Act: Render RecommendationsPage
    render(
      <Provider store={store}>
        <RecommendationsPage />
      </Provider>
    );

    // Assert: Should display formatted currency without cents ($52,000)
    expect(screen.getByText("$52,000")).toBeInTheDocument();
  });

  it("should sort strategic recommendations by order ascending", () => {
    // Arrange: Store with unsorted strategic recommendations
    const store = createTestStore({
      data: {
        companyAtGlance: {
          totalWorkforce: 1250,
          averageHourlyWage: 18.5,
          averageSalary: 52000,
        },
        strategicRecommendations: [
          {
            title: "Third Recommendation",
            description: "This should appear third",
            impactLevel: "medium",
            category: "retention",
            order: 3,
          },
          {
            title: "First Recommendation",
            description: "This should appear first",
            impactLevel: "high",
            category: "compensation",
            order: 1,
          },
          {
            title: "Second Recommendation",
            description: "This should appear second",
            impactLevel: "high",
            category: "benefits",
            order: 2,
          },
        ],
        industryOverview: null,
        turnoverVoluntaryVsInvoluntary: null,
        rateOfSeparation: null,
        areaMedianWage: [],
        housingCost: [],
      },
      loading: false,
      error: null,
      lastFetched: Date.now(),
    });

    // Act: Render RecommendationsPage
    const { container } = render(
      <Provider store={store}>
        <RecommendationsPage />
      </Provider>
    );

    // Assert: Should render recommendations in order (1, 2, 3)
    const recommendations = container.querySelectorAll("[data-recommendation]");
    expect(recommendations).toHaveLength(3);
    expect(recommendations[0]).toHaveTextContent("First Recommendation");
    expect(recommendations[1]).toHaveTextContent("Second Recommendation");
    expect(recommendations[2]).toHaveTextContent("Third Recommendation");
  });

  it("should display N/A when companyAtGlance data is null", () => {
    // Arrange: Store with null companyAtGlance
    const store = createTestStore({
      data: {
        companyAtGlance: null,
        strategicRecommendations: [],
        industryOverview: null,
        turnoverVoluntaryVsInvoluntary: null,
        rateOfSeparation: null,
        areaMedianWage: [],
        housingCost: [],
      },
      loading: false,
      error: null,
      lastFetched: Date.now(),
    });

    // Act: Render RecommendationsPage
    render(
      <Provider store={store}>
        <RecommendationsPage />
      </Provider>
    );

    // Assert: Should display N/A for all metrics
    const naElements = screen.getAllByText("N/A");
    expect(naElements.length).toBeGreaterThanOrEqual(3); // At least 3 metrics (totalWorkforce, averageHourlyWage, averageSalary)
  });

  it("should handle empty strategic recommendations array", () => {
    // Arrange: Store with empty strategicRecommendations
    const store = createTestStore({
      data: {
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
      },
      loading: false,
      error: null,
      lastFetched: Date.now(),
    });

    // Act: Render RecommendationsPage
    const { container } = render(
      <Provider store={store}>
        <RecommendationsPage />
      </Provider>
    );

    // Assert: Should not crash and render companyAtGlance metrics
    expect(screen.getByText("1,250")).toBeInTheDocument();

    // Assert: Should not render any recommendation cards
    const recommendations = container.querySelectorAll("[data-recommendation]");
    expect(recommendations).toHaveLength(0);
  });

  it("should handle null individual companyAtGlance fields", () => {
    // Arrange: Store with partial companyAtGlance data
    const store = createTestStore({
      data: {
        companyAtGlance: {
          totalWorkforce: 1250,
          averageHourlyWage: null,
          averageSalary: null,
        },
        strategicRecommendations: [],
        industryOverview: null,
        turnoverVoluntaryVsInvoluntary: null,
        rateOfSeparation: null,
        areaMedianWage: [],
        housingCost: [],
      },
      loading: false,
      error: null,
      lastFetched: Date.now(),
    });

    // Act: Render RecommendationsPage
    render(
      <Provider store={store}>
        <RecommendationsPage />
      </Provider>
    );

    // Assert: Should display formatted totalWorkforce
    expect(screen.getByText("1,250")).toBeInTheDocument();

    // Assert: Should display N/A for null fields
    const naElements = screen.getAllByText("N/A");
    expect(naElements.length).toBeGreaterThanOrEqual(2); // averageHourlyWage and averageSalary
  });
});
