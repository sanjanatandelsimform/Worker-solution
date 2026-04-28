/**
 * RecommendationsPage Tests
 */
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { createTestStore } from "../test-utils";
import RecommendationsPage from "@/pages/recommendations/RecommendationsPage";

vi.mock("@/assets/logo.svg", () => ({ default: "logo.svg" }));
vi.mock("@/assets/benestats-mark.svg", () => ({ default: "benestats-mark.svg" }));

function renderRecommendationsPage(dashboardData = {}) {
  const store = createTestStore({
    dashboard: {
      data: {
        companyAtGlance: {
          totalWorkforce: 50,
          averageHourlyWage: 25.5,
          averageSalary: 65000,
          nationalIndustryAverageWage: 70000,
        },
        strategicRecommendations: [
          {
            id: 1,
            title: "Improve Benefits",
            description: "Add dental coverage",
            priority: "high",
            category: "benefits",
          },
        ],
        ...dashboardData,
      },
      isLoading: false,
      error: null,
    },
  } as any);
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <RecommendationsPage />
      </MemoryRouter>
    </Provider>
  );
}

describe("RecommendationsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render company at a glance heading", async () => {
    renderRecommendationsPage();
    await waitFor(() => {
      const headings = screen.getAllByText(/Company Overview|Your Company at a Glance/i);
      expect(headings.length).toBeGreaterThan(0);
    });
  });

  it("should render with dashboard data", async () => {
    renderRecommendationsPage();
    await waitFor(() => {
      const container = document.querySelector(".flex");
      expect(container).toBeInTheDocument();
    });
  });
});
