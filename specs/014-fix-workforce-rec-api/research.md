# Research: Live APIs – Update Workforce & Recommendations Endpoints and Interfaces

**Branch**: `014-fix-workforce-rec-api`  
**Date**: 2026-04-17  
**Status**: Complete — all NEEDS CLARIFICATION items resolved

---

## Finding 1: Workforce Endpoint Change

**Decision**: Change `workforceApi.ts` call from `/api/v1/dashboard/workforce` to `/dashboard/workforce`.

**Rationale**: The backend has removed the `/api/v1` versioning prefix from the workforce route. The `apiClient` (Axios instance from `authApi.ts`) already has a `baseURL` configured, so only the path segment passed to `apiClient.get()` needs to change.

**Alternatives considered**: Updating the `baseURL` on the Axios instance — rejected because that would affect all other API calls and would break existing dashboard/assessment routes.

**Impact scope**: One string literal in `workforceApi.ts`. No other files reference the URL string.

---

## Finding 2: Workforce Response Shape — New Top-Level Envelope

**Decision**: The live API now wraps the workforce data in an outer envelope:

```json
{
  "assessmentType": "finch",
  "workforce": {
    "dataStatus": "available",
    "workforce": { ... },
    "participation": { ... },
    "demographics": { ... },
    "compensation": { ... }
  }
}
```

The existing `WorkforceResponse` type in `workforceTypes.ts` mapped the _old_ top-level shape (`{ workforce, participation, demographics, compensation }`). The new `workforce` key at the top level is now called `WorkforceEnvelope` for clarity and contains `dataStatus` plus the existing sub-sections.

**Decision**:

- Rename existing `WorkforceResponse` → `WorkforceEnvelope` and add `dataStatus: string` field
- Introduce `WorkforceApiResponse` as the new top-level type: `{ assessmentType: string; workforce: WorkforceEnvelope }`
- Update `WorkforceState.data` type from `WorkforceResponse | null` to `WorkforceApiResponse | null`
- Update `workforceApi.ts` return type accordingly

**Rationale**: Renaming `WorkforceResponse` to `WorkforceEnvelope` clarifies that it represents the nested envelope body, not the full API response. TypeScript consumers referencing the old type (`WorkforceResponse`) will get compile errors that lead them to the correct fix — this is intentional so no silent breakage occurs.

**Alternatives considered**: Keep `WorkforceResponse` name and add the outer wrapper as a new type — rejected because it creates ambiguity about which type represents the API response vs. the inner payload.

---

## Finding 3: Workforce Selector Accessor Path Change

**Decision**: All four data-section selectors in `workforceSelectors.ts` access one level too shallow under the new schema:

| Selector                     | Old path              | New path                        |
| ---------------------------- | --------------------- | ------------------------------- |
| `selectWorkforceSection`     | `data?.workforce`     | `data?.workforce.workforce`     |
| `selectParticipationSection` | `data?.participation` | `data?.workforce.participation` |
| `selectDemographicsSection`  | `data?.demographics`  | `data?.workforce.demographics`  |
| `selectCompensationSection`  | `data?.compensation`  | `data?.workforce.compensation`  |

`selectWorkforceData` return type annotation must also change from `WorkforceResponse | null` to `WorkforceApiResponse | null`.

**Rationale**: The new `WorkforceEnvelope` lives under `state.workforce.data.workforce`, so all sub-section reads gain one additional `.workforce` traversal step.

**Impact scope**: `workforceSelectors.ts` only. Consumer hooks (`useWorkforceOverviewConfig`, `useWorkforceParticipationConfig`, `useWorkforceDemographicsConfig`, `useWorkforceCompensationConfig`) already use typed selectors — once selectors are updated consumers require no code changes (the returned shape is identical).

---

## Finding 4: Workforce Slice — Remove Static Data, Enable Live API Call

**Decision**: In `workforceSlice.ts`:

1. Remove `STATIC_WORKFORCE_DATA` constant and the `return STATIC_WORKFORCE_DATA` line (plus the artificial `setTimeout` delay)
2. Remove the `TODO` comment block
3. Uncomment `import { getWorkforce } from "@/services/api/workforceApi"`
4. Uncomment `const response = await getWorkforce(); return response;`
5. Update type annotations in the thunk from `WorkforceResponse` to `WorkforceApiResponse`

**Rationale**: The `workforceSlice` was explicitly designed for this migration — the comments at the top describe the exact three steps to flip from static to live. We follow those instructions precisely.

**Static data `benefitsCost.table.employerCostPerPaycheck`**: The live API returns `null` for these fields; the static data had numeric values. The interface already types `employerCostPerPaycheck: number | null` so no type change needed, but the live API may render differently in UI. This is a visual delta that is acceptable — the spec explicitly acknowledges this.

---

## Finding 5: Recommendations Endpoint Change

**Decision**: Change `recommendationsApi.ts` call from `/api/v1/dashboard/recommendations` to `/dashboard/recommendation` (both the `/api/v1` prefix and the trailing `s` are removed).

**Rationale**: Backend route renamed. The `apiClient` base URL handles the host/version prefix. Only the path literal changes.

**Impact scope**: One string literal in `recommendationsApi.ts`.

---

## Finding 6: Recommendations Response Shape — New Top-Level Envelope

**Decision**: The live API wraps recommendations:

```json
{
  "assessmentType": "finch",
  "recommendation": { ... }
}
```

`RecommendationsApiResponse` gains an `assessmentType: string` field. The `recommendation` key name is unchanged.

**Decision**: Add `assessmentType: string` to `RecommendationsApiResponse` interface.

**Alternatives considered**: Making `assessmentType` optional (`assessmentType?: string`) — rejected because the backend consistently returns this field and optional would mask future API regressions.

---

## Finding 7: `companyAtGlance` Removal from `RecommendationData`

**Decision**: Remove `companyAtGlance: RecommendationCompanyAtGlance` from `RecommendationData` and remove the `RecommendationCompanyAtGlance` interface entirely from `recommendationsTypes.ts`.

**Rationale**: The live API no longer returns `companyAtGlance` inside the `recommendation` object. The `RecommendationsPage.tsx` component imports `selectCompanyAtGlance` from `dashboardSelectors.ts` (which reads `state.dashboard.data?.companyAtGlance`), NOT from the recommendations slice — so no component rendering logic is broken by this removal. The recommendations-specific `companyAtGlance` field was never consumed by any selector or component.

**Impact scope**: `recommendationsTypes.ts` (interface changes), `recommendationsSlice.ts` (remove from static data, update thunk), `recommendationsSlice.test.ts` and `recommendationsSelectors.test.ts` (remove `companyAtGlance` from mock data).

---

## Finding 8: Recommendations Slice — Remove Static Data, Enable Live API Call

**Decision**: In `recommendationsSlice.ts`:

1. Remove `STATIC_RECOMMENDATIONS_DATA` constant and `return STATIC_RECOMMENDATIONS_DATA;`
2. Uncomment `import { getRecommendations } from "@/services/api/recommendationsApi"`
3. Uncomment `const response = await getRecommendations(); return response;`

**Rationale**: Same pattern as workforce slice. The `TODO` migration instructions are already in the file.

---

## Finding 9: Test File Updates Required

The following test files contain mock objects that match the old type shapes and must be updated:

| Test file                                      | Required change                                                                                                                                                         |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tests/services/workforceApi.test.ts`          | Update mock URL assertion from `/api/v1/dashboard/workforce` → `/dashboard/workforce`; update `mockWorkforceResponse` type to `WorkforceApiResponse` with full envelope |
| `tests/store/workforceSlice.test.ts`           | Update `mockData` objects to `WorkforceApiResponse` envelope shape                                                                                                      |
| `tests/store/workforceSelectors.test.ts`       | Update `makeState` mock data to `WorkforceApiResponse` envelope shape; fix `selectWorkforceSection` test to assert on `workforce.workforce` path                        |
| `tests/store/recommendationsSlice.test.ts`     | Remove `companyAtGlance` from `mockData`; add `assessmentType` field where needed                                                                                       |
| `tests/store/recommendationsSelectors.test.ts` | Remove `companyAtGlance` from mock data                                                                                                                                 |

**No new test files need to be created** — all existing tests cover the changed code paths and just need updated mock shapes.

---

## Finding 10: `apiClient` baseURL — No Double-Prefix Risk

**Verification**: The `authApi.ts` Axios instance is created with a `baseURL` that does NOT already include `/api/v1`. Therefore changing from `/api/v1/dashboard/workforce` to `/dashboard/workforce` is the correct move and will not produce a double-prefix URL. This was confirmed by tracing the `authApi.ts` configuration.
