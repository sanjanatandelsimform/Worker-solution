# Implementation Plan: Company Overview Dual-Source Data

**Branch**: `035-company-overview-recomm-api` | **Date**: 2026-05-07 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `specs/035-company-overview-recomm-api/spec.md`

## Summary

When a user is Finch-connected (`isConnected === true`), the Recommendations page "Company at a Glance" section sources `totalWorkforce`, `averageHourlyWage`, and `averageSalary` from the existing Workforce API. When not connected (`isConnected === false`), those three values must instead come from the new `companyOverview` object now returned inside `recommendation` by the Recommendations API.

**Technical approach**: Additive change only — add a `CompanyOverview` interface to `recommendationsTypes.ts`, add an `companyOverview?: CompanyOverview` field to `RecommendationData`, expose a `selectRecommCompanyOverview` selector, and conditionally swap the data source in `RecommendationsFinchPage.tsx` using the existing `isConnected` flag. No new files, no new components, no reducer changes.

## Technical Context

**Language/Version**: TypeScript 5 / React 19  
**Primary Dependencies**: Redux Toolkit (selectors), React Testing Library, Vitest  
**Storage**: N/A (client-side Redux store only)  
**Testing**: Vitest + React Testing Library (`pnpm run test`)  
**Target Platform**: Web (Vite SPA)  
**Project Type**: Single-project web application  
**Performance Goals**: No new async operations; purely synchronous selector/render change  
**Constraints**: `pnpm run type-check` and `pnpm run test` must pass with 0 errors  
**Scale/Scope**: 5 files modified, ~40 lines changed

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle                       | Status  | Notes                                                               |
| ------------------------------- | ------- | ------------------------------------------------------------------- |
| I. Component-First Architecture | ✅ PASS | No new components; existing `CompanyAtAGlance` props unchanged      |
| II. User-Centric Design         | ✅ PASS | User stories defined in spec with acceptance criteria               |
| III. Test-Driven Development    | ✅ PASS | Tests written alongside implementation; existing test file extended |
| IV. Type Safety & Code Quality  | ✅ PASS | New `CompanyOverview` interface added; no `any` types               |
| V. Performance & Accessibility  | ✅ PASS | No new renders, no layout changes                                   |
| VI. State Management Discipline | ✅ PASS | Selector added; slice state shape is immutable passthrough          |

No violations.

## Project Structure

### Documentation (this feature)

```text
specs/035-company-overview-recomm-api/
├── plan.md              # This file
├── spec.md
├── research.md          # Phase 0 — all unknowns resolved
├── data-model.md        # Phase 1 — entity definitions
├── quickstart.md        # Phase 1 — implementation guide
├── contracts/
│   └── recommendation-get.md   # Updated API contract with companyOverview
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code (modified files only)

```text
src/
├── types/
│   └── recommendationsTypes.ts          # +CompanyOverview interface, +companyOverview? field
├── store/
│   └── selectors/
│       └── recommendationsSelectors.ts  # +selectRecommCompanyOverview selector
└── pages/
    └── recommendations/
        └── RecommendationsFinchPage.tsx # Conditional data source for companyGlanceData

tests/
├── store/
│   └── recommendationsSelectors.test.ts # +selectRecommCompanyOverview test suite
└── pages/
    └── RecommendationsFinchPage.test.tsx # +non-connected company overview describe block
```

**Structure Decision**: Single-project web application. All changes are within `src/` and `tests/` at the repository root. No new directories needed.
