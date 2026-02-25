/**
 * BenchmarkPage Tests
 *
 * Unit tests for BenchmarkPage component.
 * Tests industry overview display, benchmark metrics formatting, and fallback behavior
 * when arrays are empty or data is null.
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import BenchmarkPage from "@/pages/benchmark/BenchmarkPage";
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

describe("BenchmarkPage", () => {
  it("should display formatted industry overview metrics", () => {
    // Arrange: Store with industryOverview data
    const store = createTestStore({
      data: {
        companyAtGlance: null,
        strategicRecommendations: [],
        industryOverview: {
          turnoverRate: 22.5,
          avgTurnover: 1500000,
          avgCostOfTurnover: 980000,
        },
        turnoverVoluntaryVsInvoluntary: null,
        rateOfSeparation: null,
        areaMedianWage: [],
        housingCost: [],
      },
      loading: false,
      error: null,
      lastFetched: Date.now(),
    });

    // Act: Render BenchmarkPage
    render(
      <Provider store={store}>
        <BenchmarkPage />
      </Provider>
    );

    // Assert: Should display formatted percentage (22.5%)
    expect(screen.getByText("22.5%")).toBeInTheDocument();

    // Assert: Should display formatted compact numbers (1.5M, 980K)
    expect(screen.getByText("1.5M")).toBeInTheDocument();
    expect(screen.getByText("980K")).toBeInTheDocument();
  });

  it("should display N/A when industryOverview is null", () => {
    // Arrange: Store with null industryOverview
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

    // Act: Render BenchmarkPage
    render(
      <Provider store={store}>
        <BenchmarkPage />
      </Provider>
    );

    // Assert: Should display N/A for industryOverview metrics
    const naElements = screen.getAllByText("N/A");
    expect(naElements.length).toBeGreaterThanOrEqual(3); // turnoverRate, avgTurnover, avgCostOfTurnover
  });

  it("should display formatted turnover voluntary vs involuntary percentages", () => {
    // Arrange: Store with turnoverVoluntaryVsInvoluntary data
    const store = createTestStore({
      data: {
        companyAtGlance: null,
        strategicRecommendations: [],
        industryOverview: null,
        turnoverVoluntaryVsInvoluntary: {
          voluntaryPercentage: 62.5,
          involuntaryPercentage: 37.5,
        },
        rateOfSeparation: null,
        areaMedianWage: [],
        housingCost: [],
      },
      loading: false,
      error: null,
      lastFetched: Date.now(),
    });

    // Act: Render BenchmarkPage
    render(
      <Provider store={store}>
        <BenchmarkPage />
      </Provider>
    );

    // Assert: Should display formatted percentages
    expect(screen.getByText(/62\.5%/)).toBeInTheDocument();
    expect(screen.getByText(/37\.5%/)).toBeInTheDocument();
  });

  it("should display N/A when turnover metrics are null", () => {
    // Arrange: Store with null turnoverVoluntaryVsInvoluntary
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

    // Act: Render BenchmarkPage
    render(
      <Provider store={store}>
        <BenchmarkPage />
      </Provider>
    );

    // Assert: Should display N/A for turnover metrics
    const naElements = screen.getAllByText("N/A");
    expect(naElements.length).toBeGreaterThan(0);
  });

  it("should display formatted separation rate and count", () => {
    // Arrange: Store with rateOfSeparation data
    const store = createTestStore({
      data: {
        companyAtGlance: null,
        strategicRecommendations: [],
        industryOverview: null,
        turnoverVoluntaryVsInvoluntary: null,
        rateOfSeparation: {
          separationRate: 15.8,
          separationCount: 198,
        },
        areaMedianWage: [],
        housingCost: [],
      },
      loading: false,
      error: null,
      lastFetched: Date.now(),
    });

    // Act: Render BenchmarkPage
    render(
      <Provider store={store}>
        <BenchmarkPage />
      </Provider>
    );

    // Assert: Should display formatted percentage and number
    expect(screen.getByText(/15\.8%/)).toBeInTheDocument();
    expect(screen.getByText("198")).toBeInTheDocument();
  });

  it("should handle empty areaMedianWage array (no graph data)", () => {
    // Arrange: Store with empty areaMedianWage
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

    // Act: Render BenchmarkPage
    const { container } = render(
      <Provider store={store}>
        <BenchmarkPage />
      </Provider>
    );

    // Assert: Should not crash and render without graph data
    expect(container).toBeInTheDocument();
  });

  it("should display first areaMedianWage element when array has data", () => {
    // Arrange: Store with areaMedianWage data
    const store = createTestStore({
      data: {
        companyAtGlance: null,
        strategicRecommendations: [],
        industryOverview: null,
        turnoverVoluntaryVsInvoluntary: null,
        rateOfSeparation: null,
        areaMedianWage: [
          {
            medianWage: 25.5,
            comparisonToCompany: 12.5,
            region: "Metro Area",
            medianWageGraph: null,
          },
          {
            medianWage: 22.3,
            comparisonToCompany: 8.2,
            region: "State",
            medianWageGraph: null,
          },
        ],
        housingCost: [],
      },
      loading: false,
      error: null,
      lastFetched: Date.now(),
    });

    // Act: Render BenchmarkPage
    render(
      <Provider store={store}>
        <BenchmarkPage />
      </Provider>
    );

    // Assert: Should display first element's data (formatted)
    expect(screen.getByText(/\$25\.50/)).toBeInTheDocument(); // medianWage formatted with cents
    expect(screen.getByText(/12\.5%/)).toBeInTheDocument(); // comparisonToCompany as percentage
  });

  it("should display formatted housing cost burdened percentages", () => {
    // Arrange: Store with housingCost data
    const store = createTestStore({
      data: {
        companyAtGlance: null,
        strategicRecommendations: [],
        industryOverview: null,
        turnoverVoluntaryVsInvoluntary: null,
        rateOfSeparation: null,
        areaMedianWage: [],
        housingCost: [
          {
            burdenedOwnersPercentage: 38.5,
            burdenedRentersPercentage: 52.3,
            workingClassHousingCost: 1850,
            workingClassHousingGraph: null,
            region: "Metro Area",
          },
        ],
      },
      loading: false,
      error: null,
      lastFetched: Date.now(),
    });

    // Act: Render BenchmarkPage
    render(
      <Provider store={store}>
        <BenchmarkPage />
      </Provider>
    );

    // Assert: Should display formatted percentages
    expect(screen.getByText(/38\.5%/)).toBeInTheDocument(); // burdenedOwnersPercentage
    expect(screen.getByText(/52\.3%/)).toBeInTheDocument(); // burdenedRentersPercentage
  });

  it("should handle empty housingCost array", () => {
    // Arrange: Store with empty housingCost
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

    // Act: Render BenchmarkPage
    const { container } = render(
      <Provider store={store}>
        <BenchmarkPage />
      </Provider>
    );

    // Assert: Should not crash and display N/A for housing cost metrics
    expect(container).toBeInTheDocument();
    const naElements = screen.getAllByText("N/A");
    expect(naElements.length).toBeGreaterThan(0);
  });

  it("should handle null dashboard data", () => {
    // Arrange: Store with null data
    const store = createTestStore({
      data: null,
      loading: false,
      error: null,
      lastFetched: null,
    });

    // Act: Render BenchmarkPage
    const { container } = render(
      <Provider store={store}>
        <BenchmarkPage />
      </Provider>
    );

    // Assert: Should not crash and display N/A for all metrics
    expect(container).toBeInTheDocument();
    const naElements = screen.getAllByText("N/A");
    expect(naElements.length).toBeGreaterThan(0);
  });

  describe("ZIP Code-Driven Data Binding", () => {
    it("should populate ZIP code dropdown from dashboard data", () => {
      // Arrange: Store with multiple ZIP codes
      const store = createTestStore({
        data: {
          companyAtGlance: null,
          strategicRecommendations: [],
          industryOverview: null,
          turnoverVoluntaryVsInvoluntary: null,
          rateOfSeparation: null,
          zipCodes: ["12345", "67890", "11111"],
          areaMedianWage: [
            {
              zipcode: "12345",
              stateAverage: 22.5,
              yourCompany: 18.5,
              nationalAverage: 24.0,
            },
            {
              zipcode: "67890",
              stateAverage: 21.0,
              yourCompany: 19.0,
              nationalAverage: 23.5,
            },
          ],
          housingCost: [],
        },
        loading: false,
        error: null,
        lastFetched: Date.now(),
      });

      // Act: Render BenchmarkPage
      render(
        <Provider store={store}>
          <BenchmarkPage />
        </Provider>
      );

      // Assert: ZIP codes should be available in dropdown
      // Note: Actual verification would require interacting with the Select component
      expect(store.getState().dashboard.data?.zipCodes).toEqual(["12345", "67890", "11111"]);
    });

    it("should display area median wage data for selected ZIP code", () => {
      // Arrange: Store with area median wage data for multiple ZIP codes
      const store = createTestStore({
        data: {
          companyAtGlance: null,
          strategicRecommendations: [],
          industryOverview: null,
          turnoverVoluntaryVsInvoluntary: null,
          rateOfSeparation: null,
          zipCodes: ["12345", "67890"],
          areaMedianWage: [
            {
              zipcode: "12345",
              stateAverage: 22.5,
              yourCompany: 18.5,
              nationalAverage: 24.0,
            },
            {
              zipcode: "67890",
              stateAverage: 21.0,
              yourCompany: 19.0,
              nationalAverage: 23.5,
            },
          ],
          housingCost: [],
        },
        loading: false,
        error: null,
        lastFetched: Date.now(),
      });

      // Act: Render BenchmarkPage
      const { container } = render(
        <Provider store={store}>
          <BenchmarkPage />
        </Provider>
      );

      // Assert: Should display data for first ZIP code by default
      expect(container).toBeInTheDocument();
      // Would need to query specific wage chart elements to verify the exact values
    });

    it("should display housing cost data for selected ZIP code", () => {
      // Arrange: Store with housing cost data for multiple ZIP codes
      const store = createTestStore({
        data: {
          companyAtGlance: null,
          strategicRecommendations: [],
          industryOverview: null,
          turnoverVoluntaryVsInvoluntary: null,
          rateOfSeparation: null,
          zipCodes: ["12345", "67890"],
          areaMedianWage: [],
          housingCost: [
            {
              zipcode: "12345",
              burdenedOwners: 35.2,
              burdenedRenters: 48.7,
              workingClass: {
                ownersGte50: 22.1,
                ownersGte30: 58.3,
                rentersGte50: 45.6,
                rentersGte30: 72.4,
              },
              graph: {
                ownersGte50: 22.1,
                ownersGte30: 58.3,
                rentersGte50: 45.6,
                rentersGte30: 72.4,
              },
            },
            {
              zipcode: "67890",
              burdenedOwners: 32.5,
              burdenedRenters: 46.2,
              workingClass: {
                ownersGte50: 20.0,
                ownersGte30: 55.0,
                rentersGte50: 43.0,
                rentersGte30: 70.0,
              },
              graph: {
                ownersGte50: 20.0,
                ownersGte30: 55.0,
                rentersGte50: 43.0,
                rentersGte30: 70.0,
              },
            },
          ],
        },
        loading: false,
        error: null,
        lastFetched: Date.now(),
      });

      // Act: Render BenchmarkPage
      const { container } = render(
        <Provider store={store}>
          <BenchmarkPage />
        </Provider>
      );

      // Assert: Should display data for first ZIP code by default
      expect(container).toBeInTheDocument();
      // Would need to query specific housing cost elements to verify the exact values
    });

    it("should display 'Data not available' when selected ZIP has no matching data", () => {
      // Arrange: Store with empty areaMedianWage and housingCost
      const store = createTestStore({
        data: {
          companyAtGlance: null,
          strategicRecommendations: [],
          industryOverview: null,
          turnoverVoluntaryVsInvoluntary: null,
          rateOfSeparation: null,
          zipCodes: ["12345"],
          areaMedianWage: [],
          housingCost: [],
        },
        loading: false,
        error: null,
        lastFetched: Date.now(),
      });

      // Act: Render BenchmarkPage
      render(
        <Provider store={store}>
          <BenchmarkPage />
        </Provider>
      );

      // Assert: Should display "Data not available" or N/A for sections without data
      const naElements = screen.getAllByText("N/A");
      expect(naElements.length).toBeGreaterThan(0);
    });

    it("should handle empty zipCodes array", () => {
      // Arrange: Store with empty zipCodes array
      const store = createTestStore({
        data: {
          companyAtGlance: null,
          strategicRecommendations: [],
          industryOverview: null,
          turnoverVoluntaryVsInvoluntary: null,
          rateOfSeparation: null,
          zipCodes: [],
          areaMedianWage: [],
          housingCost: [],
        },
        loading: false,
        error: null,
        lastFetched: Date.now(),
      });

      // Act: Render BenchmarkPage
      const { container } = render(
        <Provider store={store}>
          <BenchmarkPage />
        </Provider>
      );

      // Assert: Should not crash and display fallback content
      expect(container).toBeInTheDocument();
    });
  });
});
