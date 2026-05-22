# Implementation Plan: Live APIs – Update Workforce & Recommendations Endpoints and Interfaces

**Branch**: `014-fix-workforce-rec-api` | **Date**: 2026-04-17 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `specs/014-fix-workforce-rec-api/spec.md`

---

## Summary

Switch the Workforce and Recommendations tabs from returning static/hardcoded data to calling live backend endpoints. Two changes drive a cascade of updates:

1. **Workforce**: endpoint path changes from `/api/v1/dashboard/workforce` → `/dashboard/workforce`, and the API response now has an outer envelope (`{ assessmentType, workforce: { dataStatus, ...sections } }`). A new `WorkforceApiResponse` top-level type replaces the existing `WorkforceResponse`, which is renamed `WorkforceEnvelope`. Four Redux selectors need their access paths deepened by one level. Static mock data in the slice is removed.

2. **Recommendations**: endpoint path changes from `/api/v1/dashboard/recommendations` → `/dashboard/recommendation`. The response gains a root `assessmentType` field and drops the `companyAtGlance` sub-object. The `RecommendationsApiResponse` interface gains `assessmentType`; `RecommendationData` loses `companyAtGlance`. Static mock data in the slice is removed.

No new UI components are created. No visual changes occur. The affected surface is type interfaces → API services → Redux slices → Redux selectors → test mock objects.

---

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)  
**Primary Dependencies**: React 19, Redux Toolkit, Axios (`apiClient` from `authApi.ts`)  
**Storage**: N/A (state lives in Redux store; no persistent local storage for this data)  
**Testing**: Vitest + React Testing Library (`pnpm test`)  
**Target Platform**: Web — Vite SPA  
**Project Type**: Single web application (`src/` monolith)  
**Performance Goals**: API timeout 600 000 ms (inherited unchanged)  
**Constraints**: Zero TypeScript errors (`pnpm run type-check`). No visual regression. No new UI components.  
**Scale/Scope**: ~10 files modified, ~400 lines of static mock data deleted

---

## Constitution Check

### Pre-Design Gates

| #   | Principle                    | Status  | Notes                                                               |
| --- | ---------------------------- | ------- | ------------------------------------------------------------------- |
| I   | Component-First Architecture | ✅ Pass | No new components introduced; existing component tree unchanged     |
| II  | User-Centric Design          | ✅ Pass | User stories and acceptance criteria are documented in spec.md      |
| III | Test-Driven Development      | ✅ Pass | Existing test files will be updated alongside implementation files  |
| IV  | Type Safety & Code Quality   | ✅ Pass | All type changes use explicit interfaces; no `any` introduced       |
| V   | Performance & Accessibility  | ✅ Pass | No UI changes; timeout and loading state patterns unchanged         |
| VI  | State Management Discipline  | ✅ Pass | Redux Toolkit patterns preserved; immutable state updates unchanged |

**Gate result**: PASS — no violations, no justification table required.

### Post-Design Re-evaluation

| #   | Principle                    | Status  | Notes                                                                                              |
| --- | ---------------------------- | ------- | -------------------------------------------------------------------------------------------------- |
| I   | Component-First Architecture | ✅ Pass | Selector interfaces maintain same typed sub-object shapes for consumers                            |
| III | TDD                          | ✅ Pass | Test files in scope are updated to match new shapes; no tests deleted                              |
| IV  | Type Safety                  | ✅ Pass | `WorkforceApiResponse`, `WorkforceEnvelope`, updated `RecommendationsApiResponse` use strict types |
| VI  | State Management             | ✅ Pass | `fetchWorkforce` and `fetchRecommendations` thunks follow existing RTK async thunk pattern         |

---

## Project Structure

### Documentation (this feature)

```text
specs/014-fix-workforce-rec-api/
├── plan.md              ← this file
├── spec.md              ← user stories and functional requirements
├── research.md          ← Phase 0 findings (all unknowns resolved)
├── data-model.md        ← Phase 1 type contracts
├── quickstart.md        ← Phase 1 step-by-step implementation guide
├── contracts/
│   ├── workforce-get.md         ← GET /dashboard/workforce contract
│   └── recommendation-get.md   ← GET /dashboard/recommendation contract
└── checklists/
    └── requirements.md
```

### Source Code (files to change)

```text
src/
├── types/
│   ├── workforceTypes.ts          MODIFY — rename WorkforceResponse→WorkforceEnvelope; add WorkforceApiResponse; add dataStatus; update WorkforceState.data type
│   └── recommendationsTypes.ts   MODIFY — add assessmentType to RecommendationsApiResponse; remove companyAtGlance + RecommendationCompanyAtGlance
├── services/api/
│   ├── workforceApi.ts            MODIFY — update endpoint path; update return type to WorkforceApiResponse
│   └── recommendationsApi.ts     (no change — endpoint already correct; only slice needs updating)
└── store/
    ├── slices/
    │   ├── workforceSlice.ts      MODIFY — remove static data; uncomment live API call; update types
    │   └── recommendationsSlice.ts  MODIFY — remove static data; uncomment live API call; remove companyAtGlance from static
    └── selectors/
        └── workforceSelectors.ts  MODIFY — update 4 selector access paths; update selectWorkforceData return type

tests/
├── services/
│   └── workforceApi.test.ts       MODIFY — update mock type + URL assertion
└── store/
    ├── workforceSlice.test.ts     MODIFY — update mock data to WorkforceApiResponse envelope
    ├── workforceSelectors.test.ts MODIFY — update mock type + access path assertions
    ├── recommendationsSlice.test.ts   MODIFY — remove companyAtGlance from mock; add assessmentType
    └── recommendationsSelectors.test.ts  MODIFY — remove companyAtGlance from mock
```

**Files NOT changed** (selectors are updated; consumers just work):

- `src/hooks/useWorkforceOverviewConfig.ts`
- `src/hooks/useWorkforceParticipationConfig.tsx`
- `src/hooks/useWorkforceDemographicsConfig.ts`
- `src/hooks/useWorkforceCompensationConfig.ts`
- `src/pages/workforce/WorkforcePage.tsx` (and its sub-components)
- `src/pages/recommendations/RecommendationsPage.tsx`
- `src/pages/recommendations/RecommendationsFinchPage.tsx`
- `src/store/selectors/recommendationsSelectors.ts` (no path change needed; `companyAtGlance` accessor in comment only)

---

## Implementation Phases

### Phase A — Type Layer (Zero-breakage foundation)

**Order**: Types must be updated first so all downstream file changes can reference the new types without transient compile errors.

1. **`src/types/workforceTypes.ts`**
   - Rename `WorkforceResponse` → `WorkforceEnvelope`
   - Add `dataStatus: string` to `WorkforceEnvelope`
   - Add new interface `WorkforceApiResponse { assessmentType: string; workforce: WorkforceEnvelope }`
   - Update `WorkforceState.data: WorkforceApiResponse | null`

2. **`src/types/recommendationsTypes.ts`**
   - Add `assessmentType: string` to `RecommendationsApiResponse`
   - Remove `companyAtGlance: RecommendationCompanyAtGlance` from `RecommendationData`
   - Delete `RecommendationCompanyAtGlance` interface

### Phase B — API Service Layer

3. **`src/services/api/workforceApi.ts`**
   - Update import: `WorkforceResponse` → `WorkforceApiResponse`
   - Update endpoint: `/api/v1/dashboard/workforce` → `/dashboard/workforce`
   - Update function signature / generic type

### Phase C — Redux Slices (remove static, enable live)

4. **`src/store/slices/workforceSlice.ts`**
   - Uncomment `import { getWorkforce }`
   - Update import: `WorkforceResponse` → `WorkforceApiResponse`
   - Delete `STATIC_WORKFORCE_DATA` constant and all static-mode comments
   - Replace thunk body with live API call
   - Update `PayloadAction` type annotation

5. **`src/store/slices/recommendationsSlice.ts`**
   - Uncomment `import { getRecommendations }`
   - Delete `STATIC_RECOMMENDATIONS_DATA` constant
   - Replace thunk body with live API call

### Phase D — Redux Selectors

6. **`src/store/selectors/workforceSelectors.ts`**
   - Update import: `WorkforceResponse` → `WorkforceApiResponse`
   - Update `selectWorkforceData` return type
   - Update four data-section selector access paths (add `.workforce.` level)

### Phase E — Tests

7. **`tests/services/workforceApi.test.ts`** — update mock + URL assertion
8. **`tests/store/workforceSlice.test.ts`** — wrap mock in `WorkforceApiResponse` envelope
9. **`tests/store/workforceSelectors.test.ts`** — wrap mock + fix assertion paths
10. **`tests/store/recommendationsSlice.test.ts`** — remove `companyAtGlance`; add `assessmentType`
11. **`tests/store/recommendationsSelectors.test.ts`** — remove `companyAtGlance` from mocks

---

## Key Decisions

| Decision                                                 | Rationale                                                                                     |
| -------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Rename `WorkforceResponse` → `WorkforceEnvelope`         | Distinguishes inner payload from top-level API response type; prevents naming confusion       |
| Keep `recommendationsApi.ts` endpoint unchanged          | File already uses `/dashboard/recommendation`; only the slice needed the live-call enablement |
| No changes to consumer hooks or page components          | Selectors return the same typed sub-objects; consumers are insulated                          |
| Update selector comment in `recommendationsSelectors.ts` | Remove stale reference to `companyAtGlance` in `selectRecommendationItem` JSDoc only          |

---

## Verification Checklist

- [ ] `pnpm run type-check` — zero errors
- [ ] `pnpm test` — all tests pass (no deleted tests)
- [ ] Browser: Workforce tab network request hits `/dashboard/workforce`
- [ ] Browser: Recommendations tab network request hits `/dashboard/recommendation`
- [ ] No console errors on either page with live data
- [ ] Static data `setTimeout` delay removed (page loads immediately)
