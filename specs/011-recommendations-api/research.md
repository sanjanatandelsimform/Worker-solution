# Research: Recommendations Finch Tab API Integration

**Feature**: 011-recommendations-api  
**Phase**: 0 — Outline & Research  
**Date**: 2026-04-16

---

## Decision 1: What data sources replace the dashboard selectors?

**Question**: The current `RecommendationsFinchPage` uses `selectCompanyAtGlance` and `selectStrategicRecommendations` from `dashboardSelectors`. Which slices should replace each usage?

**Decision**:

- **Company Overview cards** (`totalWorkforce`, `averageHourlyWage`, `averageSalary`, `industryAverageWage`) → **workforce slice** (`selectWorkforceSection` + `selectCompensationSection`)
- **Benefits Overview cards** (`eligibleEmployees`, `enrolledEmployees`, `enrolledInRetirement`, `enrolledInHealthcare`) → **workforce slice** (`selectParticipationSection`)
- **Proven Strategies** (flags: `nonElectiveMatch`, `autoEnroll`, `healthcareAffordability`) → **new recommendations slice**
- **Strategic Solutions** (`strategicRecommendations` array) → **new recommendations slice**

**Rationale**: The workforce slice already contains the Company Overview and participation data (available from the `workforceSlice` static stub: `totalWorkforce: 3120`, `avgHourlyRate: 30`, `retirementEnrollment: "64%"`, etc.). Routing these cards through a dedicated slice avoids coupling to the dashboard API, which serves a different page. The new recommendations endpoint (`GET /api/v1/dashboard/recommendations`) is purpose-built for the Recommendations tab and owns the strategic recommendation and strategy flag data.

**Alternatives considered**: Using the `companyAtGlance` object from the recommendations API response (which has `totalWorkforce: null, averageHourlyWage: null, averageSalary: null`) — rejected because all three fields are `null` in the sample response and the workforce slice already provides this data with real values.

---

## Decision 2: How to map workforce slice fields to the existing card format functions?

**Question**: The existing `overviewCardsConfig` format functions expect data shaped like the old `companyAtGlance` object (e.g., `.totalWorkforce`, `.averageHourlyWage`, `.industryAverageWage`). The workforce slice has a different structure (`workforce.totalWorkforce`, `compensation.salaryBreakdown.avgHourlyRate`). How do we bridge this?

**Decision**: Create a **synthetic shape object** in `RecommendationsFinchPage` that maps workforce slice fields to the shape expected by the existing format functions. This eliminates changes to the format functions and keeps them pristine.

```ts
// Company Overview synthetic shape
const companyGlanceData = {
  totalWorkforce: workforceSection?.totalWorkforce ?? null,
  averageHourlyWage: compensationSection?.salaryBreakdown?.avgHourlyRate ?? null,
  averageSalary: compensationSection?.salaryBreakdown?.avgSalary ?? null,
  industryAverageWage: null, // no equivalent in workforce slice yet
};
```

For Benefits Overview, replace the static `count` strings in `overviewCardsConfigR2` with dynamic values derived from `participationSection`:

```ts
const benefitsGlanceData = {
  eligibleEmployees: participationSection?.totalWorkforce ?? null,
  enrolledEmployees: participationSection?.enrolledBenefits ?? null,
  enrolledInRetirement: participationSection?.retirementEnrollment ?? null,
  enrolledInHealthcare: participationSection?.healthcareEnrollment ?? null,
};
```

The `count` prop on these cards will be set from this object instead of hardcoded strings.

**Rationale**: Minimises changes to existing card configuration; the mapping logic is visible and centralized in one place; it's easy to extend when the workforce API adds new fields.

**Alternatives considered**: Updating the format functions directly — rejected because it would require changing typed config objects and is more invasive than warranted for a data-source swap.

---

## Decision 3: Stub strategy for the new recommendations API

**Question**: The backend is not live yet. How should the stub be implemented?

**Decision**: Exactly mirror `workforceSlice.ts`:

1. Declare a `STATIC_RECOMMENDATIONS_DATA` constant with the provided sample response.
2. In the `fetchRecommendations` thunk, return the static constant directly.
3. Add the live API call as a commented-out block with a TODO comment matching the `workforceSlice.ts` format.
4. Add a JSDoc header block that describes the migration path.

**Rationale**: Consistency with the existing codebase pattern means any developer familiar with the workforce slice immediately understands how to migrate the recommendations slice to a live API. It also ensures the migration risk is low (remove 2 lines, uncomment 2 lines).

**Alternatives considered**: Using MSW mock handlers — rejected as over-engineering for a feature-level stub that already has a clear migration plan.

---

## Decision 4: Naming the new recommendations selectors to avoid collisions

**Question**: `dashboardSelectors.ts` already exports `selectStrategicRecommendations`. If we name the new selector the same in `recommendationsSelectors.ts`, there will be a naming collision at import sites.

**Decision**: Export from `recommendationsSelectors.ts` as:

- `selectRecommendationsData` — full API response
- `selectRecommendationItem` — the inner `recommendation` object
- `selectRecommStrategicRecommendations` — strategic recommendations array (sorted by `order`)
- `selectProvenStrategiesFlags` — the three boolean flags as an object
- `selectRecommendationsLoading` — loading flag
- `selectRecommendationsError` — error string
- `selectRecommendationsIsLoaded` — isLoaded flag

In `RecommendationsFinchPage`, import selectors from `recommendationsSelectors` under clear names. Do NOT import `selectStrategicRecommendations` from `dashboardSelectors` at all.

**Rationale**: Clear, non-colliding names prevent accidental use of the wrong selector. Using a `Recomm` prefix for the strategic recommendations selector makes it unambiguous where the data comes from.

**Alternatives considered**: Renaming the dashboard selector — rejected as out-of-scope and would break other consumers.

---

## Decision 5: When to dispatch `fetchRecommendations`

**Question**: The workforce thunk is dispatched from `DashboardPage` when the dashboard mounts. Where should `fetchRecommendations` be dispatched?

**Decision**: Dispatch `fetchRecommendations` from inside `RecommendationsFinchPage` on mount via a `useEffect`, guarded by `isLoaded`:

```ts
useEffect(() => {
  if (!recommendationsIsLoaded) {
    dispatch(fetchRecommendations());
  }
}, [dispatch, recommendationsIsLoaded]);
```

**Rationale**: The Recommendations tab is specific to the finch flow; its data is only needed when this page renders. Dispatching from the page itself follows the "fetch on demand" pattern and avoids loading unnecessary data on the dashboard.

**Alternatives considered**: Dispatching from `DashboardPage` alongside `fetchWorkforce` — rejected because the workforce data serves multiple tabs (Dashboard + Recommendations), while recommendations data is only needed on the Recommendations tab.

---

## Decision 6: Loading state strategy

**Question**: There are currently two `useState` timers (`isPreparingCard`, `isLoadingCards`) with hardcoded 5s and 8s timeouts. Should these be replaced with real loading state from Redux?

**Decision**: Keep the existing timer-based `isLoadingCards` / `isPreparingCard` states for the skeleton transitions (they appear to be intentional UX delay). Wire the Redux `loading` flags from both the workforce slice and recommendations slice as **additional** guards:

- Show skeletons if EITHER `isLoadingCards === true` OR the relevant slice `loading === true`.
- This way, real slow API calls will also trigger the skeleton correctly even after the timers expire.

**Rationale**: Doesn't break existing UX behavior; adds correctness for when the actual API is live. Preserves the "preparing dashboard" animation that was a deliberate design decision.

---

## Decision 7: Structure of `recommendationsTypes.ts`

**Decision**: Define types to mirror the API response exactly, following `workforceTypes.ts` conventions (JSDoc on every interface, named exports, no default exports).

Key interfaces:

- `StrategicRecommendation` — individual recommendation item
- `RecommendationData` — the inner `recommendation` object with flags + array + companyAtGlance
- `RecommendationsApiResponse` — top-level wrapper `{ recommendation: RecommendationData }`
- `RecommendationsState` — Redux slice state (follows `WorkforceState` shape)
