# Data Model: RecommendationsFinchPage Test Coverage

**Phase 1 — Test Data Shapes & Store Configuration**  
**Date**: 2026-04-27

---

## Overview

This document defines the typed data shapes used across all test cases in `RecommendationsFinchPage.test.tsx`. These are not API contracts — they are the preloaded Redux state shapes and hook mock return shapes that tests will use.

---

## 1. Redux Store Configuration

### 1.1 `createTestStore` helper

```typescript
import { configureStore } from '@reduxjs/toolkit';
import workforceReducer from '@/store/slices/workforceSlice';
import recommendationsReducer from '@/store/slices/recommendationsSlice';
import industryReducer from '@/store/slices/industrySlice';
import type { WorkforceState } from '@/types/workforceTypes';
import type { RecommendationsState } from '@/types/recommendationsTypes';
import type { IndustryState } from '@/types/industryTypes';

interface TestStoreState {
  workforce?: Partial<WorkforceState>;
  recommendations?: Partial<RecommendationsState>;
  industry?: Partial<IndustryState>;
}

function createTestStore(overrides: TestStoreState = {}) {
  return configureStore({
    reducer: {
      workforce: workforceReducer,
      recommendations: recommendationsReducer,
      industry: industryReducer,
    },
    preloadedState: {
      workforce: { ...defaultWorkforceState, ...overrides.workforce },
      recommendations: { ...defaultRecommendationsState, ...overrides.recommendations },
      industry: { ...defaultIndustryState, ...overrides.industry },
    },
  });
}
```

---

## 2. Default Slice States

### 2.1 `WorkforceState` — Default (all data, not loading)

```typescript
const defaultWorkforceState: WorkforceState = {
  data: {
    assessmentType: 'finch',
    workforce: {
      dataStatus: 'available',
      workforce: {
        totalWorkforce: 100,
        enrolledBenefits: 80,
        avgEmployeeCost: 5000,
        employerCostPerEmployee: 4500,
      },
      participation: {
        totalWorkforce: 100,
        enrolledBenefits: 80,
        retirementEnrollment: '64%',
        healthcareEnrollment: '92%',
        benefits: [],
        retirement: [],
        insurance: [],
      },
      demographics: {
        employmentType: [],
        gender: { men: '55%', women: '40%' },
        employmentBreakdownByAge: [],
      },
      compensation: {
        salaryBreakdown: {
          avgHourlyRate: 18.5,
          avgSalary: 52000,
          // other fields
        },
        // other fields
      },
    },
  },
  loading: false,
  error: null,
  lastFetched: Date.now(),
  isLoaded: true,
};
```

### 2.2 `RecommendationsState` — Default (flags all false, empty recommendations)

```typescript
const defaultRecommendationsState: RecommendationsState = {
  data: {
    assessmentType: 'finch',
    recommendation: {
      dataStatus: 'available',
      strategicRecommendations: [],
      autoEnroll: false,
      nonElectiveMatch: false,
      healthcareAffordability: false,
    },
  },
  loading: false,
  error: null,
  lastFetched: Date.now(),
  isLoaded: true,
};
```

### 2.3 `IndustryState` — Default (null data, not loading)

```typescript
const defaultIndustryState: IndustryState = {
  data: null,
  loading: false,
  error: null,
  isLoaded: true,
};
```

---

## 3. Hook Mock Return Shapes

### 3.1 `useAssessmentStatus` mock default

```typescript
// Default: assessment is complete (isFinchAssessmentIncomplete = false)
vi.mock('@/hooks/useAssessmentStatus', () => ({
  useAssessmentStatus: vi.fn(() => ({
    isFinchAssessmentIncomplete: false,
    isFinchCompleted: true,
    completionCount: 4,
    isLoading: false,
    error: null,
    assessmentData: null,
    sectionCompletion: {
      workforce: true,
      compensation: true,
      benefits: true,
      goals: true,
    },
    refetch: vi.fn(),
  })),
}));
```

### 3.2 `useIndustry` mock default

```typescript
// Default: no industry data, not loading
vi.mock('@/hooks/useIndustry', () => ({
  useIndustry: vi.fn(() => ({
    isLoading: false,
    data: null,
    error: null,
    isLoaded: true,
  })),
}));
```

### 3.3 `useFinchStatus` mock default

```typescript
// Default: connected (isConnected = true)
vi.mock('@/hooks/useFinchStatus', () => ({
  useFinchStatus: vi.fn(() => ({
    isConnected: true,
    connectionStatus: 'connected',
    syncJobStatus: null,
    isLoading: false,
    error: null,
  })),
}));
```

### 3.4 `useModalConfig` mock

```typescript
vi.mock('@/hooks/useModalConfig', () => ({
  useModalConfig: vi.fn(() => ({})),
}));
```

---

## 4. Test Variant Data Shapes

### 4.1 Workforce data — loading state

```typescript
// Used in: "loading state" tests
{ workforce: { loading: true, data: null, isLoaded: false } }
```

### 4.2 Recommendations data — with proven strategy flags

```typescript
// All three flags true
{
  recommendations: {
    data: {
      assessmentType: 'finch',
      recommendation: {
        dataStatus: 'available',
        strategicRecommendations: [],
        autoEnroll: true,
        nonElectiveMatch: true,
        healthcareAffordability: true,
      },
    },
  },
}

// One flag true (nonElectiveMatch only)
{
  recommendations: {
    data: {
      ...
      recommendation: { ..., autoEnroll: false, nonElectiveMatch: true, healthcareAffordability: false },
    },
  },
}
```

### 4.3 Workforce data — with known values for assertion

```typescript
// totalWorkforce = 1250, avgHourlyRate = 18.50
{
  workforce: {
    data: {
      assessmentType: 'finch',
      workforce: {
        dataStatus: 'available',
        workforce: { totalWorkforce: 1250, enrolledBenefits: 1000, avgEmployeeCost: 5000, employerCostPerEmployee: 4500 },
        participation: { totalWorkforce: 1250, enrolledBenefits: 1000, retirementEnrollment: '64%', healthcareEnrollment: '92%', benefits: [], retirement: [], insurance: [] },
        demographics: { employmentType: [], gender: { men: '55%', women: '40%' }, employmentBreakdownByAge: [] },
        compensation: {
          salaryBreakdown: { avgHourlyRate: 18.5, avgSalary: 52000 },
        },
      },
    },
  },
}
```

### 4.4 Industry data — `useIndustry` return with `industryAverageWage`

```typescript
// Used when asserting industry wage card
vi.mocked(useIndustry).mockReturnValue({
  isLoading: false,
  data: {
    industryOverview: {
      industryAverageWage: 45000,
      turnoverRate: { rate: '15%', month: 'Jan', year: 2025 },
      avgTurnover: { rate: 15, sinceYear: 2020 },
      industryWideCostOfTurnover: { amount: 50000, formatted: '$50,000', year: 2025 },
      rates: { hire: 10, seperation: 8 },
    },
    // other IndustryData fields omitted — use 'as unknown as IndustryData'
  } as unknown as IndustryData,
  error: null,
  isLoaded: true,
});
```

### 4.5 Recommendations data — with strategic recommendations

```typescript
const mockRecommendation: StrategicRecommendation = {
  order: 1,
  title: 'Emergency Savings',
  category: 'General',
  matchScore: 0.9,
  description: 'Help employees build financial resilience.',
  keyFeatures: ['No minimums', 'FDIC insured'],
  matchedGoals: ['retention'],
  providerName: 'Sunny Day Fund',
  workerRanking: 1,
  priorityLevelUsed: 1,
};

// Preloaded state override
{
  recommendations: {
    data: {
      assessmentType: 'finch',
      recommendation: {
        dataStatus: 'available',
        strategicRecommendations: [mockRecommendation],
        autoEnroll: false,
        nonElectiveMatch: false,
        healthcareAffordability: false,
      },
    },
  },
}
```

---

## 5. State Transitions (Conditional Rendering Gates)

| Condition | Component Visible | Data Source |
|-----------|-------------------|-------------|
| `isFinchAssessmentIncomplete = false` | `CoreBenefitsEnhancement`, `StrategicSolutions` | `useAssessmentStatus` mock |
| `isFinchAssessmentIncomplete = true` | Hidden | `useAssessmentStatus` mock |
| `workforceIsLoading = true` | Skeletons in `CompanyAtAGlance` | `workforce.loading` in store |
| `recommendationsIsLoading = true` | Skeletons in `CoreBenefitsEnhancement` | `recommendations.loading` in store |
| `isIndustryLoading = true` | Skeletons in `CompanyAtAGlance` | `useIndustry` mock |
| Always | `CarouselSection`, `Declarations` | N/A |

---

## 6. Computed Values Table

| Flags true | `provenStrategiesCount` | `provenStrategiesPercent` |
|-----------|------------------------|--------------------------|
| 0 | 0 | 0 |
| 1 | 1 | 33 |
| 2 | 2 | 67 |
| 3 | 3 | 100 |

Math: `Math.round((count / 3) * 100)` — matches source code in `RecommendationsFinchPage.tsx`.
