# Implementation Plan: Recommendations Finch Tab API Integration

**Branch**: `011-recommendations-api` | **Date**: 2026-04-16 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/011-recommendations-api/spec.md`

## Summary

Migrate `RecommendationsFinchPage` from two deprecated dashboard selectors to two correct data sources: (1) the existing **workforce Redux slice** for the "Company at a Glance" (Company Overview + Benefits Overview) section, and (2) a **new `recommendations` Redux slice** for the Core Benefits Enhancement section (Proven Strategies progress flags + Strategic Solutions benefit cards). While the backend endpoint is not yet live, the new slice returns static stub data following the identical stub pattern used in `workforceSlice.ts`.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)  
**Primary Dependencies**: React 19, Redux Toolkit, React Router v7, Tailwind CSS v4, shadcn/ui  
**Storage**: Redux in-memory store (no database; localStorage persists auth/registrationForm only)  
**Testing**: Vitest + React Testing Library  
**Target Platform**: Web (Vite SPA, React 19)  
**Project Type**: Single-project web frontend (`src/`)  
**Performance Goals**: N/A for data-source swap; no new bundle size impact  
**Constraints**: Zero visual changes; backward-compatible stub pattern; no breaking changes to existing slices  
**Scale/Scope**: 1 page component refactored; 4 new files created; 2 existing files modified (store.ts + RecommendationsFinchPage.tsx)

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle                       | Status  | Notes                                                                                                                      |
| ------------------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------- |
| I. Component-First Architecture | ✅ PASS | `RecommendationsFinchPage` remains self-contained; new slice/selector files are single-responsibility                      |
| II. User-Centric Design         | ✅ PASS | All 4 user stories have acceptance criteria in spec; P1-P3 priorities assigned                                             |
| III. Test-Driven Development    | ✅ PASS | Unit tests required for selectors and slice (see Tasks); component tests for dynamic proven-strategies values              |
| IV. Type Safety & Code Quality  | ✅ PASS | Strict TypeScript interfaces defined in `recommendationsTypes.ts`; no `any` usage                                          |
| V. Performance & Accessibility  | ✅ PASS | No new bundle; existing skeleton/loading patterns reused                                                                   |
| VI. State Management Discipline | ✅ PASS | Follows RTK `createSlice` + `createAsyncThunk` pattern; state is immutable; selectors use `createSelector` for memoisation |

**Post-design re-check**: No violations introduced by Phase 1 design decisions.

## Project Structure

### Documentation (this feature)

```text
specs/011-recommendations-api/
├── plan.md                           # This file
├── spec.md                           # Feature specification
├── research.md                       # Phase 0 output — 7 decisions documented
├── data-model.md                     # Phase 1 output — types, selectors, synthetic shapes
├── quickstart.md                     # Phase 1 output — step-by-step implementation guide
├── contracts/
│   └── recommendations-get.md        # API contract for GET /api/v1/dashboard/recommendations
└── checklists/
    └── requirements.md               # Spec quality checklist
```

### Source Code Changes (repository root)

```text
src/
├── types/
│   └── recommendationsTypes.ts       # NEW — TypeScript interfaces (RecommendationsApiResponse, RecommendationsState, ...)
├── services/
│   └── api/
│       └── recommendationsApi.ts     # NEW — getRecommendations() service function (stub mode)
├── store/
│   ├── slices/
│   │   └── recommendationsSlice.ts   # NEW — Redux slice with static stub
│   ├── selectors/
│   │   └── recommendationsSelectors.ts  # NEW — selectRecommStrategicRecommendations, selectProvenStrategiesFlags, ...
│   └── store.ts                      # MODIFY — add recommendations reducer + RootState type
└── pages/
    └── recommendations/
        └── RecommendationsFinchPage.tsx  # MODIFY — remove dashboardSelectors, wire workforce + recommendations selectors

tests/
├── store/
│   ├── slices/
│   │   └── recommendationsSlice.test.ts  # NEW — unit tests for thunk + reducers
│   └── selectors/
│       └── recommendationsSelectors.test.ts  # NEW — unit tests for all selectors
└── pages/
    └── recommendations/
        └── RecommendationsFinchPage.test.tsx  # NEW or UPDATE — component tests for dynamic proven-strategies values
```

**Structure Decision**: Single-project web frontend. All new files placed alongside existing workforce analogues to maintain discoverability by convention.

## Complexity Tracking

No constitution violations require justification.

## Phase 0: Research Summary

All NEEDS CLARIFICATION items resolved. See [research.md](./research.md) for full details.

| Decision                                                   | Resolved As                                                                                                         |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Which slice for Company/Benefits Overview                  | Workforce slice (`selectWorkforceSection`, `selectParticipationSection`, `selectCompensationSection`)               |
| How to map workforce fields to existing format fns         | Synthetic shape object; no changes to existing config formats                                                       |
| Stub strategy                                              | Mirror `workforceSlice.ts` exactly — static constant + TODO comment                                                 |
| Selector naming to avoid collision with dashboardSelectors | New selectors prefixed: `selectRecommStrategicRecommendations`, `selectProvenStrategiesFlags`                       |
| When to dispatch `fetchRecommendations`                    | Inside `RecommendationsFinchPage` on mount, guarded by `isLoaded`                                                   |
| Loading state strategy                                     | Combine existing timer flags with Redux slice `loading` flag via `isAnyLoading`                                     |
| Type structure                                             | 4 interfaces: `StrategicRecommendation`, `RecommendationData`, `RecommendationsApiResponse`, `RecommendationsState` |

## Phase 1: Design Summary

See individual artifacts:

- [data-model.md](./data-model.md) — TypeScript interfaces, selector map, computed values, static stub data
- [contracts/recommendations-get.md](./contracts/recommendations-get.md) — OpenAPI schema for the API endpoint
- [quickstart.md](./quickstart.md) — 7-step ordered implementation guide with exact code snippets

### Key design decisions

1. **No changes to existing card config objects** — `overviewCardsConfig` and `provenStrategiesCardsConfig` remain untouched. Data mapping happens via synthetic shapes built from selectors.
2. **`overviewCardsConfigR2` Benefits cards** — static `count` strings in the config serve as fallback; participation data overrides at render time.
3. **Proven Strategies score** = count of `true` among `[nonElectiveMatch, autoEnroll, healthcareAffordability]`; percent = `Math.round(count / 3 * 100)`.
4. **Static stub flags** `autoEnroll: true, nonElectiveMatch: false, healthcareAffordability: false` → score renders as **1/3 | 33%** during development.
5. **`strategicRecommendations` selector** sorts by `order` ascending via `createSelector` — no sort logic in the component.
