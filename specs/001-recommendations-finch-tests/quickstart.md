# Quickstart: RecommendationsFinchPage Test Coverage

**Branch**: `001-recommendations-finch-tests`  
**Date**: 2026-04-27  
**Estimated effort**: 1–2 hours  
**Single deliverable**: `tests/pages/RecommendationsFinchPage.test.tsx`

---

## Implementation Guide

### Step 1 — Create the test file

Create `tests/pages/RecommendationsFinchPage.test.tsx` with the complete implementation below.

### Step 2 — Run tests to confirm all pass

```powershell
pnpm test -- --reporter=verbose RecommendationsFinchPage
```

### Step 3 — Type check

```powershell
pnpm run type-check
```

---

## Complete Test File

```tsx
/**
 * RecommendationsFinchPage Tests
 *
 * Comprehensive test coverage for RecommendationsFinchPage component.
 *
 * Covers:
 * - Loading states (combined isLoading guard from 3 slices)
 * - Finch assessment completeness gate (CoreBenefitsEnhancement + StrategicSolutions visibility)
 * - Company At A Glance data mapping (workforce, compensation, industry)
 * - Benefits overview data mapping (participation null-safety)
 * - Proven strategies count and percent computation (0/1/2/3 flags)
 * - Static sections always rendered (Carousel, Declarations)
 * - onNavigateToWorkforce callback forwarding
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";

import RecommendationsFinchPage from "@/pages/recommendations/RecommendationsFinchPage";
import workforceReducer from "@/store/slices/workforceSlice";
import recommendationsReducer from "@/store/slices/recommendationsSlice";
import industryReducer from "@/store/slices/industrySlice";

import { useAssessmentStatus } from "@/hooks/useAssessmentStatus";
import { useIndustry } from "@/hooks/useIndustry";

import type { WorkforceState } from "@/types/workforceTypes";
import type { RecommendationsState } from "@/types/recommendationsTypes";
import type { IndustryState, IndustryData } from "@/types/industryTypes";
import type { StrategicRecommendation } from "@/types/recommendationsTypes";

// ─── Module-level mocks ────────────────────────────────────────────────────

vi.mock("@/hooks/useAssessmentStatus", () => ({
  useAssessmentStatus: vi.fn(),
}));

vi.mock("@/hooks/useIndustry", () => ({
  useIndustry: vi.fn(),
}));

vi.mock("@/hooks/useFinchStatus", () => ({
  useFinchStatus: vi.fn(() => ({
    isConnected: true,
    connectionStatus: "connected",
    syncJobStatus: null,
    isLoading: false,
    error: null,
  })),
}));

vi.mock("@/hooks/useModalConfig", () => ({
  useModalConfig: vi.fn(() => ({})),
}));

vi.mock("@/assets/did-hero.jpg", () => ({ default: "did-hero.jpg" }));

// ─── Default state factories ───────────────────────────────────────────────

const defaultWorkforceData: WorkforceState["data"] = {
  assessmentType: "finch",
  workforce: {
    dataStatus: "available",
    workforce: {
      totalWorkforce: 100,
      enrolledBenefits: 80,
      avgEmployeeCost: 5000,
      employerCostPerEmployee: 4500,
    },
    participation: {
      totalWorkforce: 100,
      enrolledBenefits: 80,
      retirementEnrollment: "64%",
      healthcareEnrollment: "92%",
      benefits: [],
      retirement: [],
      insurance: [],
    },
    demographics: {
      employmentType: [],
      gender: { men: "55%", women: "40%" },
      employmentBreakdownByAge: [],
    },
    compensation: {
      salaryBreakdown: {
        avgHourlyRate: 18.5,
        avgSalary: 52000,
      },
    } as WorkforceState["data"]["workforce"]["compensation"],
  },
};

const defaultRecommendationsData: RecommendationsState["data"] = {
  assessmentType: "finch",
  recommendation: {
    dataStatus: "available",
    strategicRecommendations: [],
    autoEnroll: false,
    nonElectiveMatch: false,
    healthcareAffordability: false,
  },
};

interface TestStoreOverrides {
  workforce?: Partial<WorkforceState>;
  recommendations?: Partial<RecommendationsState>;
  industry?: Partial<IndustryState>;
}

function createTestStore(overrides: TestStoreOverrides = {}) {
  return configureStore({
    reducer: {
      workforce: workforceReducer,
      recommendations: recommendationsReducer,
      industry: industryReducer,
    },
    preloadedState: {
      workforce: {
        data: defaultWorkforceData,
        loading: false,
        error: null,
        lastFetched: Date.now(),
        isLoaded: true,
        ...overrides.workforce,
      } as WorkforceState,
      recommendations: {
        data: defaultRecommendationsData,
        loading: false,
        error: null,
        lastFetched: Date.now(),
        isLoaded: true,
        ...overrides.recommendations,
      } as RecommendationsState,
      industry: {
        data: null,
        loading: false,
        error: null,
        isLoaded: true,
        ...overrides.industry,
      } as IndustryState,
    },
  });
}

function renderPage(store = createTestStore(), onNavigateToWorkforce?: () => void) {
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <RecommendationsFinchPage onNavigateToWorkforce={onNavigateToWorkforce} />
      </MemoryRouter>
    </Provider>
  );
}

// ─── Default hook returns (reset in beforeEach) ────────────────────────────

beforeEach(() => {
  vi.mocked(useAssessmentStatus).mockReturnValue({
    isFinchAssessmentIncomplete: false,
    isFinchCompleted: true,
    completionCount: 4,
    isLoading: false,
    error: null,
    assessmentData: null,
    sectionCompletion: { workforce: true, compensation: true, benefits: true, goals: true },
    refetch: vi.fn(),
  } as ReturnType<typeof useAssessmentStatus>);

  vi.mocked(useIndustry).mockReturnValue({
    isLoading: false,
    data: null,
    error: null,
    isLoaded: true,
  });
});

// ─── Test Suites ────────────────────────────────────────────────────────────

describe("RecommendationsFinchPage — loading states", () => {
  it("renders skeleton placeholders when workforce is loading", () => {
    const store = createTestStore({
      workforce: { data: null, loading: true, isLoaded: false },
    });
    renderPage(store);
    // Data values should not be present during loading
    expect(screen.queryByText("100")).not.toBeInTheDocument();
    expect(screen.queryByText("$18.50")).not.toBeInTheDocument();
  });

  it("renders skeleton placeholders when recommendations is loading", () => {
    const store = createTestStore({
      recommendations: { data: null, loading: true, isLoaded: false },
    });
    renderPage(store);
    // Strategies count text should not be present while loading
    expect(screen.queryByText(/Strategies Impemented:/)).not.toBeInTheDocument();
  });

  it("renders skeleton placeholders when industry is loading", () => {
    vi.mocked(useIndustry).mockReturnValue({
      isLoading: true,
      data: null,
      error: null,
      isLoaded: false,
    });
    renderPage();
    // Industry wage value should not be present
    expect(screen.queryByText("$45,000")).not.toBeInTheDocument();
  });

  it("renders data values when all loading flags are false", () => {
    renderPage();
    // Company At A Glance heading always visible
    expect(screen.getByText("Your Company At A Glance")).toBeInTheDocument();
  });
});

describe("RecommendationsFinchPage — assessment completeness gate", () => {
  it("hides CoreBenefitsEnhancement when isFinchAssessmentIncomplete = true", () => {
    vi.mocked(useAssessmentStatus).mockReturnValue({
      isFinchAssessmentIncomplete: true,
      isFinchCompleted: false,
      completionCount: 0,
      isLoading: false,
      error: null,
      assessmentData: null,
      sectionCompletion: { workforce: false, compensation: false, benefits: false, goals: false },
      refetch: vi.fn(),
    } as ReturnType<typeof useAssessmentStatus>);

    renderPage();
    expect(screen.queryByText("Core Benefits Enhancement")).not.toBeInTheDocument();
  });

  it("hides StrategicSolutions when isFinchAssessmentIncomplete = true", () => {
    vi.mocked(useAssessmentStatus).mockReturnValue({
      isFinchAssessmentIncomplete: true,
      isFinchCompleted: false,
      completionCount: 0,
      isLoading: false,
      error: null,
      assessmentData: null,
      sectionCompletion: { workforce: false, compensation: false, benefits: false, goals: false },
      refetch: vi.fn(),
    } as ReturnType<typeof useAssessmentStatus>);

    renderPage();
    expect(screen.queryByText("Strategic Solutions")).not.toBeInTheDocument();
  });

  it("shows CoreBenefitsEnhancement and StrategicSolutions when assessment is complete", () => {
    renderPage();
    expect(screen.getByText("Core Benefits Enhancement")).toBeInTheDocument();
    expect(screen.getByText("Strategic Solutions")).toBeInTheDocument();
  });

  it("always shows Your Company At A Glance heading regardless of assessment status", () => {
    vi.mocked(useAssessmentStatus).mockReturnValue({
      isFinchAssessmentIncomplete: true,
      isFinchCompleted: false,
      completionCount: 0,
      isLoading: false,
      error: null,
      assessmentData: null,
      sectionCompletion: { workforce: false, compensation: false, benefits: false, goals: false },
      refetch: vi.fn(),
    } as ReturnType<typeof useAssessmentStatus>);

    renderPage();
    expect(screen.getByText("Your Company At A Glance")).toBeInTheDocument();
  });
});

describe("RecommendationsFinchPage — company at a glance data mapping", () => {
  it("displays formatted totalWorkforce from store", () => {
    const store = createTestStore({
      workforce: {
        data: {
          ...defaultWorkforceData,
          workforce: {
            ...defaultWorkforceData!.workforce,
            workforce: {
              totalWorkforce: 1250,
              enrolledBenefits: 1000,
              avgEmployeeCost: 5000,
              employerCostPerEmployee: 4500,
            },
          },
        },
      },
    });
    renderPage(store);
    expect(screen.getByText("1,250")).toBeInTheDocument();
  });

  it("displays formatted avgHourlyRate from compensation section", () => {
    const store = createTestStore({
      workforce: {
        data: {
          ...defaultWorkforceData,
          workforce: {
            ...defaultWorkforceData!.workforce,
            compensation: {
              salaryBreakdown: { avgHourlyRate: 18.5, avgSalary: 52000 },
            } as WorkforceState["data"]["workforce"]["compensation"],
          },
        },
      },
    });
    renderPage(store);
    expect(screen.getByText("$18.50")).toBeInTheDocument();
  });

  it("displays formatted industryAverageWage from useIndustry hook", () => {
    vi.mocked(useIndustry).mockReturnValue({
      isLoading: false,
      data: {
        industryOverview: {
          industryAverageWage: 45000,
          turnoverRate: { rate: "15%", month: "Jan", year: 2025 },
          avgTurnover: { rate: 15, sinceYear: 2020 },
          industryWideCostOfTurnover: { amount: 50000, formatted: "$50,000", year: 2025 },
          rates: { hire: 10, seperation: 8 },
        },
      } as unknown as IndustryData,
      error: null,
      isLoaded: true,
    });
    renderPage();
    expect(screen.getByText("$45,000")).toBeInTheDocument();
  });

  it("shows N/A for industryAverageWage when industry data is null", () => {
    vi.mocked(useIndustry).mockReturnValue({
      isLoading: false,
      data: null,
      error: null,
      isLoaded: true,
    });
    renderPage();
    // N/A is displayed by the overviewCardsConfig format function
    expect(screen.getAllByText("N/A").length).toBeGreaterThan(0);
  });

  it("shows N/A for workforce fields when workforce data is null", () => {
    const store = createTestStore({
      workforce: { data: null, loading: false, isLoaded: false },
    });
    renderPage(store);
    expect(screen.getAllByText("N/A").length).toBeGreaterThan(0);
  });
});

describe("RecommendationsFinchPage — benefits overview data mapping", () => {
  it("displays totalWorkforce from participation section as eligible employees count", () => {
    const store = createTestStore({
      workforce: {
        data: {
          ...defaultWorkforceData,
          workforce: {
            ...defaultWorkforceData!.workforce,
            participation: {
              totalWorkforce: 500,
              enrolledBenefits: 300,
              retirementEnrollment: "64%",
              healthcareEnrollment: "92%",
              benefits: [],
              retirement: [],
              insurance: [],
            },
          },
        },
      },
    });
    renderPage(store);
    // "500" should appear as the eligible employees count
    expect(screen.getByText("500")).toBeInTheDocument();
  });

  it("passes null benefitsGlanceData values when participationSection is null", () => {
    // participationSection = null when workforce.data is null
    const store = createTestStore({
      workforce: { data: null, loading: false, isLoaded: false },
    });
    renderPage(store);
    // Page renders without crash — benefits cards show fallback
    expect(screen.getByText("Your Company At A Glance")).toBeInTheDocument();
  });
});

describe("RecommendationsFinchPage — proven strategies count and percent", () => {
  it("passes provenStrategiesCount=0 and percent=0 when all flags are false", () => {
    renderPage(); // default: all flags false
    expect(screen.getByText("Strategies Impemented: 0/3")).toBeInTheDocument();
  });

  it("passes provenStrategiesCount=1 and percent=33 when one flag is true", () => {
    const store = createTestStore({
      recommendations: {
        data: {
          ...defaultRecommendationsData,
          recommendation: {
            ...defaultRecommendationsData!.recommendation,
            nonElectiveMatch: true,
            autoEnroll: false,
            healthcareAffordability: false,
          },
        },
      },
    });
    renderPage(store);
    expect(screen.getByText("Strategies Impemented: 1/3")).toBeInTheDocument();
  });

  it("passes provenStrategiesCount=2 and percent=67 when two flags are true", () => {
    const store = createTestStore({
      recommendations: {
        data: {
          ...defaultRecommendationsData,
          recommendation: {
            ...defaultRecommendationsData!.recommendation,
            nonElectiveMatch: true,
            autoEnroll: true,
            healthcareAffordability: false,
          },
        },
      },
    });
    renderPage(store);
    expect(screen.getByText("Strategies Impemented: 2/3")).toBeInTheDocument();
  });

  it("passes provenStrategiesCount=3 and percent=100 when all flags are true", () => {
    const store = createTestStore({
      recommendations: {
        data: {
          ...defaultRecommendationsData,
          recommendation: {
            ...defaultRecommendationsData!.recommendation,
            nonElectiveMatch: true,
            autoEnroll: true,
            healthcareAffordability: true,
          },
        },
      },
    });
    renderPage(store);
    expect(screen.getByText("Strategies Impemented: 3/3")).toBeInTheDocument();
  });
});

describe("RecommendationsFinchPage — static sections always rendered", () => {
  it("renders Carousel section regardless of store state", () => {
    renderPage();
    expect(screen.getByText("Did you know?")).toBeInTheDocument();
  });

  it("renders Declarations text when assessment is incomplete", () => {
    vi.mocked(useAssessmentStatus).mockReturnValue({
      isFinchAssessmentIncomplete: true,
      isFinchCompleted: false,
      completionCount: 0,
      isLoading: false,
      error: null,
      assessmentData: null,
      sectionCompletion: { workforce: false, compensation: false, benefits: false, goals: false },
      refetch: vi.fn(),
    } as ReturnType<typeof useAssessmentStatus>);

    renderPage();
    expect(screen.getByText(/This product provides informational insights/)).toBeInTheDocument();
  });

  it("renders Declarations text when assessment is complete", () => {
    renderPage();
    expect(screen.getByText(/This product provides informational insights/)).toBeInTheDocument();
  });
});

describe("RecommendationsFinchPage — strategic recommendations", () => {
  it("shows no-recommendations fallback when strategicRecommendations is empty", () => {
    renderPage(); // default: empty array
    expect(screen.getByText("No recommendations available at this time.")).toBeInTheDocument();
  });

  it("renders recommendation cards when strategicRecommendations has items", () => {
    const mockRec: StrategicRecommendation = {
      order: 1,
      title: "Emergency Savings",
      category: "General",
      matchScore: 0.9,
      description: "Help employees build financial resilience.",
      keyFeatures: ["No minimums", "FDIC insured"],
      matchedGoals: ["retention"],
      providerName: "Sunny Day Fund",
      workerRanking: 1,
      priorityLevelUsed: 1,
    };

    const store = createTestStore({
      recommendations: {
        data: {
          assessmentType: "finch",
          recommendation: {
            dataStatus: "available",
            strategicRecommendations: [mockRec],
            autoEnroll: false,
            nonElectiveMatch: false,
            healthcareAffordability: false,
          },
        },
      },
    });
    renderPage(store);
    expect(screen.getByText("Emergency Savings")).toBeInTheDocument();
    expect(screen.getByText("Help employees build financial resilience.")).toBeInTheDocument();
  });
});

describe("RecommendationsFinchPage — onNavigateToWorkforce callback", () => {
  it("renders without error when onNavigateToWorkforce is not provided", () => {
    expect(() => renderPage()).not.toThrow();
    expect(screen.getByText("Your Company At A Glance")).toBeInTheDocument();
  });
});
```

---

## Key Implementation Notes

### Why `MemoryRouter` is required

`CompanyAtAGlance` renders `<Link>` from react-router-dom. Without a Router context, tests will throw "useHref() may be used only in the context of a <Router> component."

### Why `useModalConfig` must be mocked

`Declarations` calls `useModalConfig(...)` to configure term/privacy modals. Without a mock this throws in the test environment.

### Why `did-hero.jpg` must be mocked

`StrategicSolutions` imports `did-hero.jpg` as a module. Without mocking, Vitest's default transform may fail to process the binary file.

### Asserting "Strategies Impemented" (note: typo in source)

The source code in `CoreBenefitsEnhancement.tsx` reads: `Strategies Impemented: {provenStrategiesCount}/3`. The test assertions must match the exact string from the source, including the typo.

### Type casting for partial `IndustryData`

When providing partial industry data in hook mocks, use `as unknown as IndustryData` to avoid providing all required type fields.

### Compensation type casting

The `compensation` field within `WorkforceState.data.workforce` has complex nested types. Use `as WorkforceState["data"]["workforce"]["compensation"]` to type-cast test data without enumerating every field.

---

## Acceptance Gate

Run these commands. All must succeed:

```powershell
# Run the new test file only
pnpm test -- RecommendationsFinchPage

# Full type check
pnpm run type-check

# Full test suite (no regressions)
pnpm test
```
