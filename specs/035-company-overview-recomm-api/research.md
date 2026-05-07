# Research: Company Overview Dual-Source Data

**Phase**: 0 — Outline & Research  
**Feature**: `035-company-overview-recomm-api`  
**Date**: 2026-05-07

## Research Questions Resolved

### Q1: Where does the new `companyOverview` object live in the recommendations API response?

**Decision**: The backend adds `companyOverview` as a sibling field to `strategicRecommendations`, `autoEnroll`, etc., **inside** the `recommendation` object. Full path: `response.recommendation.companyOverview`.

**Rationale**: Confirmed by the user requirement: "at the root level — In the recommendation object". The `recommendation` key already wraps all data sub-fields in the existing contract (`specs/014-fix-workforce-rec-api/contracts/recommendation-get.md`).

**Alternatives considered**: Top-level on `RecommendationsApiResponse` — rejected because all payload data lives inside `recommendation`; adding it at the top level would break the existing shape convention.

---

### Q2: What are the exact field names on `companyOverview`?

**Decision**: `totalWorkforce: number`, `avgHourlyRate: number`, `avgSalary: number` — exactly matching what the user specified and consistent with the naming already used in `Compensation.salaryBreakdown.avgHourlyRate` and `Compensation.salaryBreakdown.avgSalary`.

**Rationale**: Reusing the same field names across types reduces mapping layers.

**Alternatives considered**: Snake_case (`avg_hourly_rate`) — not used anywhere else in the frontend type system; all existing keys are camelCase.

---

### Q3: Should `companyOverview` be optional or required?

**Decision**: `companyOverview?: CompanyOverview` (optional). Each sub-field is `number` (not nullable at the type level, but guarded with `??` in the selector).

**Rationale**: The backend may not include this field in older API responses or for certain assessment states. The spec (FR-005) requires graceful null fallback when the field is absent. Making the field optional at the TypeScript level enforces that the access must be guarded.

**Alternatives considered**: `companyOverview: CompanyOverview | null` — would require an extra null-check layer; optional `?` is idiomatic for TypeScript object fields that may be absent.

---

### Q4: How does the Finch-connected vs. non-connected branching currently work for `healthcareAffordability`?

**Decision**: The identical pattern already exists in `RecommendationsFinchPage.tsx` for `healthcareAffordability`:

```ts
healthcareAffordability: isConnected
  ? workforceHealthcareFlag
  : recommProvenFlags.healthcareAffordability,
```

This feature applies the same conditional pattern to `totalWorkforce`, `averageHourlyWage`, and `averageSalary` in `companyGlanceData`.

**Rationale**: Using the established pattern avoids architectural inconsistency and is the lowest-risk change.

---

### Q5: Are there existing tests for the company overview mapping in `RecommendationsFinchPage`?

**Decision**: Yes — `tests/pages/RecommendationsFinchPage.test.tsx` already has a `"company at a glance data mapping"` describe block testing the Finch-connected path (workforce API values). New tests must be added to cover the non-connected path (recommendations API `companyOverview` values). The existing tests must NOT be modified in a breaking way.

**Rationale**: The test file uses `createTestStore()` with preloaded Redux state and `vi.mocked(useAssessmentStatus)` to set `isConnected`. Adding a non-connected test variant only requires overriding `isConnected: false` and providing `recommendation.companyOverview` in the store preload.

---

### Q6: Does `industryAverageWage` need to change?

**Decision**: No. `industryAverageWage` always comes from `useIndustry()` and is out of scope.

---

## Files to Change

| File                                                     | Change                                                                                           |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `src/types/recommendationsTypes.ts`                      | Add `CompanyOverview` interface; add `companyOverview?: CompanyOverview` to `RecommendationData` |
| `src/store/selectors/recommendationsSelectors.ts`        | Add `selectRecommCompanyOverview` selector                                                       |
| `src/pages/recommendations/RecommendationsFinchPage.tsx` | Conditionally source `companyGlanceData` company fields from selector when `!isConnected`        |
| `tests/store/recommendationsSelectors.test.ts`           | Add `selectRecommCompanyOverview` test suite                                                     |
| `tests/pages/RecommendationsFinchPage.test.tsx`          | Add non-connected describe block for company at a glance                                         |

## No-Touch Files

| File                                             | Reason                                                                 |
| ------------------------------------------------ | ---------------------------------------------------------------------- |
| `src/services/api/recommendationsApi.ts`         | No change to HTTP call; TypeScript will pick up the type automatically |
| `src/store/slices/recommendationsSlice.ts`       | Shape is unchanged; data passthrough only                              |
| `src/pages/recommendations/CompanyAtAGlance.tsx` | Props interface is unchanged; caller provides the same shape           |
| `src/store/selectors/workforceSelectors.ts`      | Workforce path unmodified                                              |

## Risk Assessment

- **Low risk**: Pure additive change — adding an optional field to an existing interface and a conditional data source in one component.
- **No regression risk** to Finch-connected users because the `isConnected` branch is unchanged.
- **Zero API change required** on the frontend; only the backend needs to add `companyOverview` to its response.
