# Research: RecommendationsFinchPage Test Coverage

**Phase 0 — All NEEDS CLARIFICATION items resolved**  
**Date**: 2026-04-27

---

## R-001: Which hooks require mocking?

**Decision**: Four hooks must be mocked at module level:

| Hook | Import Path | Mock Reason |
|------|------------|-------------|
| `useAssessmentStatus` | `@/hooks/useAssessmentStatus` | Makes real API call to `getAssessment()`; controls `isFinchAssessmentIncomplete` |
| `useIndustry` | `@/hooks/useIndustry` | Dispatches `fetchIndustry` thunk; controls `isLoading` and `industryData` independently from Redux store |
| `useFinchStatus` | `@/hooks/useFinchStatus` | Used inside `CompanyAtAGlance`; controls `isConnected` — affects conditional link rendering |
| `useModalConfig` | `@/hooks/useModalConfig` | Used inside `Declarations` → `TermsModal`; prevents runtime errors from missing modal registry |

**Rationale**: All four hooks either make real network calls, dispatch thunks, or depend on external context unavailable in jsdom. Mocking prevents flakiness and keeps tests isolated.

**Alternatives considered**: Mocking only `useAssessmentStatus` — rejected because `useIndustry` dispatches side effects in its `useEffect` even with a loaded Redux store, causing noise in tests.

---

## R-002: Which Redux slices are required in `createTestStore`?

**Decision**: The minimum required slice set is:

```typescript
{
  workforce: workforceReducer,
  recommendations: recommendationsReducer,
  industry: industryReducer,
}
```

**Rationale**: These three slices feed the three selector groups used directly in `RecommendationsFinchPage`:
- `selectWorkforceSection`, `selectCompensationSection`, `selectParticipationSection`, `selectWorkforceLoading` → `workforce` slice  
- `selectRecommStrategicRecommendations`, `selectProvenStrategiesFlags`, `selectRecommendationsLoading` → `recommendations` slice  
- Industry loading state → handled via mocked `useIndustry` (not a Redux selector in the component)

The `industry` slice itself is NOT used via Redux selectors in `RecommendationsFinchPage.tsx` — industry data comes from the mocked `useIndustry` hook. Therefore only `workforce` and `recommendations` slices need preloaded state in the store. The `industry` slice reducer can still be included for completeness but its preloaded state is irrelevant.

**Alternatives considered**: Including all 9 root store slices — rejected because it creates unnecessary boilerplate and couples tests to unrelated slices.

---

## R-003: Does `MemoryRouter` suffice, or is `RouterProvider` needed?

**Decision**: `MemoryRouter` from `react-router-dom` is sufficient.

**Rationale**: `CompanyAtAGlance` renders a `<Link>` component (React Router Link). `MemoryRouter` provides the required Router context without needing a full route configuration. This is consistent with the pattern used in `DashboardPage.test.tsx`.

**Alternatives considered**: `createMemoryRouter` + `RouterProvider` — rejected as overkill for component-level tests that do not need route matching or navigation assertions.

---

## R-004: Are there asset/SVG imports that need mocking?

**Decision**: Two asset mocks are needed:

| Asset | Used In | Mock |
|-------|---------|------|
| `@/assets/did-hero.jpg` | `StrategicSolutions.tsx` | `vi.mock('@/assets/did-hero.jpg', () => ({ default: 'did-hero.jpg' }))` |
| All icon components (`@/assets/icons/*`) | `CompanyAtAGlance.tsx`, `CoreBenefitsEnhancement.tsx` | Already handled by `@untitledui/icons` proxy mock in `tests/setup.ts`; local icon components render as React components and do not need explicit mocks |

**Rationale**: The `did-hero.jpg` is imported in `StrategicSolutions.tsx` via `import didHeroImg from "@/assets/did-hero.jpg"`. Without a mock, Vitest/jsdom may throw an error when trying to process the binary file. The `@untitledui/icons` mock in `tests/setup.ts` already handles the icon library; local SVG icon files (in `@/assets/icons/`) are React components and render fine in jsdom.

**Alternatives considered**: Using `assets` transform in `vitest.config.ts` — rejected because the `did-hero.jpg` mock is a simpler, scoped solution that does not affect other tests.

---

## R-005: How to assert "skeleton is showing" vs "data is showing"?

**Decision**: Use `container.querySelectorAll('[data-testid="skeleton"]')` or count-based assertions on skeleton element counts, falling back to `getByText` / `queryByText` for data labels.

**Finding from codebase**: `RecommendationsSkeletons.tsx` exports `OverviewCardSkeleton`, `ProvenStrategiesSkeleton`, `ProvenStrategiesCardsSkeleton`, `StrategicSolutionsCardsSkeleton`. These are rendered when `isLoading = true` in `CompanyAtAGlance` and `CoreBenefitsEnhancement`. The skeletons use Tailwind `animate-pulse` classes and do not have dedicated `data-testid` attributes.

**Strategy**: 
1. When loading: assert that known data text (e.g., "1,250", "$18.50") is NOT in the document.
2. When not loading: assert that known data text IS in the document.
3. For section presence/absence (assessment gate): use `queryByText('Core Benefits Enhancement')` and `queryByText('Strategic Solutions')`.

**Alternatives considered**: Adding `data-testid` to skeletons — rejected because it would require modifying source files outside the scope of this feature.

---

## R-006: How does `useIndustry` return industry data for test assertions?

**Decision**: Mock `useIndustry` to return a typed `UseIndustryReturn` shape:

```typescript
vi.mock('@/hooks/useIndustry', () => ({
  useIndustry: vi.fn(() => ({
    isLoading: false,
    data: null,
    error: null,
    isLoaded: true,
  })),
}));
```

For tests that need industry data:
```typescript
vi.mocked(useIndustry).mockReturnValue({
  isLoading: false,
  data: {
    industryOverview: { industryAverageWage: 45000, /* other fields */ },
    // other IndustryData fields
  },
  error: null,
  isLoaded: true,
});
```

**Rationale**: `useIndustry` is a Redux-dispatching hook and is already mocked in `DashboardPage.test.tsx`. The component reads `industryData?.industryOverview?.industryAverageWage`, so only `industryOverview.industryAverageWage` matters for assertions.

---

## R-007: What is the minimum `IndustryData` type shape needed for mocks?

**Decision**: Only `industryOverview.industryAverageWage` is accessed by the component. The mock only needs to satisfy TypeScript — use `as unknown as IndustryData` casting for partial shapes, or provide the full type.

**Rationale**: The component reads: `industryData?.industryOverview?.industryAverageWage`. Optional chaining means all other fields are safe to omit from the test mock if using type casting.

---

## R-008: How to handle `useModalConfig` used by `Declarations`?

**Decision**: Mock `useModalConfig` to return an empty object:

```typescript
vi.mock('@/hooks/useModalConfig', () => ({
  useModalConfig: vi.fn(() => ({})),
}));
```

**Rationale**: `Declarations` calls `useModalConfig("updateDeclarationTerms", ...)` and `useModalConfig("updateDeclarationPrivacy", ...)`. Without a mock, it may attempt to look up modal configurations that don't exist in the test environment, causing errors. Returning `{}` satisfies the spread operator usage in `TermsModal` props.

**Alternatives considered**: Mocking `Declarations` entirely — rejected because testing that it renders unconditionally is a goal of User Story 6.

---

## Summary of Decisions

| # | Unknown | Resolution |
|---|---------|------------|
| R-001 | Which hooks to mock | `useAssessmentStatus`, `useIndustry`, `useFinchStatus`, `useModalConfig` |
| R-002 | Which Redux slices needed | `workforce` + `recommendations` in store; industry via hook mock |
| R-003 | Router wrapper | `MemoryRouter` suffices |
| R-004 | Asset mocks | `did-hero.jpg` mock + existing `@untitledui/icons` proxy |
| R-005 | Skeleton assertions | Absence/presence of known data text |
| R-006 | `useIndustry` mock shape | `{ isLoading, data, error, isLoaded }` |
| R-007 | `IndustryData` minimum shape | Only `industryOverview.industryAverageWage` needed |
| R-008 | `useModalConfig` | Mock returning `{}` |
