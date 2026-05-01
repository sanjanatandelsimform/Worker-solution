# Implementation Plan: Dashboard Tab Readiness, Skeletons & Shared "Did You Know" Content

**Branch**: `028-dashboard-tab-readiness` | **Date**: 2026-05-01 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/028-dashboard-tab-readiness/spec.md`

## Summary

Extract `didYouKnowSlides` into a shared constants module consumed by both the Recommendations carousel and the dashboard loading modal. Expose per-tab readiness flags (`isRecommendationTabReady`, `isWorkforceTabReady`, `isIndustryTabReady`) and a `hasExceededProcessingWindow` flag from `useDashboardStatusPolling`. Pass readiness flags as `isReady` props to each tab component so they show skeletons while pending. Display the `DynamicLoadingModal` only during the first 5 minutes (computed from `createdAt` in the polling response).

## Technical Context

**Language/Version**: TypeScript 5.x + React 19  
**Primary Dependencies**: React Router v7, Redux Toolkit, Tailwind CSS v4, React Aria Components  
**Storage**: N/A (consumes REST API via `getDashboardStatus`)  
**Testing**: Vitest + React Testing Library (co-located in `tests/`)  
**Target Platform**: Modern browsers (Vite SPA)  
**Project Type**: Single SPA  
**Performance Goals**: Tab switch < 100ms; skeleton replaces spinner for perceived speed  
**Constraints**: No new dependencies; no API changes; < 200KB gzipped bundle budget maintained  
**Scale/Scope**: 3 tab pages affected, 1 hook extended, 1 new constants file, 1 modal refactored

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle                       | Status  | Notes                                                               |
| ------------------------------- | ------- | ------------------------------------------------------------------- |
| I. Component-First Architecture | ✅ PASS | Readiness delivered as props; no prop drilling beyond one level     |
| II. User-Centric Design         | ✅ PASS | User stories mapped; each tab independently testable                |
| III. Test-Driven Development    | ✅ PASS | New hook logic testable in isolation; modal/tab tests already exist |
| IV. Type Safety & Code Quality  | ✅ PASS | All new exports typed; return interface extended                    |
| V. Performance & Accessibility  | ✅ PASS | Skeleton meets WCAG via aria-busy; no extra bundle weight           |
| VI. State Management Discipline | ✅ PASS | Derived state via `useMemo`; no new global slices                   |

No violations — no Complexity Tracking entries required.

## Project Structure

### Documentation (this feature)

```text
specs/028-dashboard-tab-readiness/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (via /speckit.tasks)
```

### Source Code (files changed or created)

```text
src/
├── constants/
│   └── didYouKnowSlides.tsx           # NEW — shared slides data (has JSX icons)
├── hooks/
│   └── useDashboardStatusPolling.ts   # MODIFIED — add readiness flags + processing window flag
├── types/
│   └── dashboardStatusTypes.ts        # MODIFIED — extend return type
├── components/
│   └── dashboard/
│       └── DynamicLoadingModal.tsx     # MODIFIED — consume shared slides, remove internal labels
├── pages/
│   ├── recommendations/
│   │   ├── Carousel.tsx               # MODIFIED — import slides from constants
│   │   └── RecommendationsFinchPage.tsx # MODIFIED — accept isReady prop
│   ├── benchmark/
│   │   └── BenchmarkFinchPage.tsx     # MODIFIED — accept isReady prop
│   ├── workforce/
│   │   └── WorkforcePage.tsx          # MODIFIED — accept isReady prop
│   └── dashboard/
│       └── DashboardPage.tsx          # MODIFIED — wire polling flags, pass isReady, show modal conditionally
tests/
├── hooks/
│   └── useDashboardStatusPolling.test.ts  # MODIFIED — cover new flags
└── components/
    └── dashboard/
        └── DynamicLoadingModal.test.tsx    # MODIFIED — verify shared slides usage
```

**Structure Decision**: Single SPA. New shared constants file in `src/constants/` (existing folder). All other changes modify existing files.

## Complexity Tracking

No constitution violations — table intentionally left empty.
