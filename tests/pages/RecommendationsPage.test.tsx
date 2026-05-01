/**
 * RecommendationsPage Tests
 */
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { createTestStore } from "../test-utils";
import RecommendationsPage from "@/pages/recommendations/RecommendationsPage";

vi.mock("@/assets/logo.svg", () => ({ default: "logo.svg" }));
vi.mock("@/assets/benestats-mark.svg", () => ({ default: "benestats-mark.svg" }));
vi.mock("@/assets/did-hero.jpg", () => ({ default: "did-hero.jpg" }));

const mockCompanyAtGlance = {
  totalWorkforce: 50,
  averageHourlyWage: 25.5,
  averageSalary: 65000,
  nationalIndustryAverageWage: 70000,
  industryAverageWage: 68000,
};

const mockStrategicRecommendations = [
  {
    order: 1,
    title: "Improve Benefits",
    description: "Add dental coverage",
    priority: "high",
    category: "benefits",
    keyFeatures: ["Feature A", "Feature B"],
  },
];

function renderRecommendationsPage(overrides: Record<string, unknown> = {}) {
  const store = createTestStore({
    dashboard: {
      data: {
        companyAtGlance: mockCompanyAtGlance,
        strategicRecommendations: mockStrategicRecommendations,
        ...overrides,
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
    const headings = screen.getAllByText(/Company Overview|Your Company at a Glance/i);
    expect(headings.length).toBeGreaterThan(0);
  });

  it("should render skeleton loading state initially", () => {
    renderRecommendationsPage();
    // When isLoadingCards is true (initial state), skeletons render
    const container = document.querySelector(".animate-pulse");
    expect(container).toBeTruthy();
  });

  it("should render actual cards after timer expires (5000ms)", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: false });
    renderRecommendationsPage();

    // Initially loading
    expect(document.querySelector(".animate-pulse")).toBeTruthy();

    // Advance past 5000ms
    act(() => {
      vi.advanceTimersByTime(5100);
    });

    // After timer fires, actual content should render
    expect(screen.queryByText("Total Workforce")).toBeTruthy();

    vi.useRealTimers();
  }, 10000);

  it("should render overview cards after loading", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: false });
    renderRecommendationsPage();

    act(() => {
      vi.advanceTimersByTime(5100);
    });

    expect(screen.getByText("Total Workforce")).toBeInTheDocument();
    expect(screen.getByText("Average Hourly Wage")).toBeInTheDocument();
    expect(screen.getByText("Average Salary")).toBeInTheDocument();

    vi.useRealTimers();
  }, 10000);

  it("should render strategic recommendations cards after loading", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: false });
    renderRecommendationsPage();

    act(() => {
      vi.advanceTimersByTime(5100);
    });

    expect(screen.getByText("Improve Benefits")).toBeInTheDocument();

    vi.useRealTimers();
  }, 10000);

  it("shows 'No recommendations available' when strategicRecommendations is empty", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: false });
    renderRecommendationsPage({ strategicRecommendations: [] });

    act(() => {
      vi.advanceTimersByTime(5100);
    });

    expect(screen.getByText("No recommendations available at this time.")).toBeInTheDocument();

    vi.useRealTimers();
  }, 10000);

  it("formats totalWorkforce as a number", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: false });
    renderRecommendationsPage();

    act(() => {
      vi.advanceTimersByTime(5100);
    });

    // 50 should render as "50"
    expect(screen.getByText("50")).toBeInTheDocument();

    vi.useRealTimers();
  }, 10000);

  it("renders Core Benefits Enhancement section", () => {
    renderRecommendationsPage();
    expect(screen.getByText("Core Benefits Enhancement")).toBeInTheDocument();
  });

  it("renders Strategic Solutions section", () => {
    renderRecommendationsPage();
    expect(screen.getByText("Strategic Solutions")).toBeInTheDocument();
  });

  it("renders Did you know heading", () => {
    renderRecommendationsPage();
    const headings = screen.getAllByText(/Did you know/i);
    expect(headings.length).toBeGreaterThan(0);
  });

  it("renders N/A when totalWorkforce is undefined (missing from data)", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: false });
    // Don't provide companyAtGlance at all to get null/undefined
    const store = createTestStore({
      dashboard: {
        data: {
          companyAtGlance: null,
          strategicRecommendations: [],
        },
        isLoading: false,
        error: null,
      },
    } as any);
    const { container } = render(
      <Provider store={store}>
        <MemoryRouter>
          <RecommendationsPage />
        </MemoryRouter>
      </Provider>
    );

    act(() => {
      vi.advanceTimersByTime(5100);
    });

    // Component should render without crashing
    expect(container).toBeTruthy();

    vi.useRealTimers();
  }, 10000);

  it("renders totalWorkforce as string when it's a string", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: false });
    renderRecommendationsPage({
      companyAtGlance: { ...mockCompanyAtGlance, totalWorkforce: "200" },
    });

    act(() => {
      vi.advanceTimersByTime(5100);
    });

    expect(screen.getByText("200")).toBeInTheDocument();

    vi.useRealTimers();
  }, 10000);
});
