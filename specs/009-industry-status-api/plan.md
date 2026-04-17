# Implementation Plan: Conditional Industry API Call Based on Status Response

**Branch**: `009-industry-status-api` | **Date**: 2026-04-15 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `specs/009-industry-status-api/spec.md`

## Summary

Add conditional industry data fetching to the Dashboard's Industry and Finch Industry tabs. The existing `/finch/status` endpoint is being extended with a `connection.industry` field (`"fetch"` | `null`). When the user activates either tab and `industry === "fetch"`, a new Industry API call is dispatched. Skeleton loaders display during loading; data is cached session-scoped (survives tab switches, only re-fetched on page reload). The implementation follows the established Redux Toolkit pattern: **service → slice → selector → hook → component**.

## Technical Context

**Language/Version**: TypeScript 5.x + React 19  
**Primary Dependencies**: React Router v7, Redux Toolkit (createAsyncThunk, createSlice), Axios (via `apiClient`), Tailwind CSS v4  
**Storage**: Redux store (session-scoped, not persisted to localStorage)  
**Testing**: Vitest + React Testing Library  
**Target Platform**: Web (SPA, all modern browsers)  
**Project Type**: Single web frontend (Vite + React)  
**Performance Goals**: Industry data renders within 3s of tab click under standard network conditions  
**Constraints**: No UI/design changes; skeleton loaders already exist in `BenchmarkPage.tsx`; must follow existing Profile Settings API pattern  
**Scale/Scope**: 3 files modified, 4-6 new files created

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Component-First Architecture | PASS | No new UI components created; existing skeleton components reused. New hook (`useIndustry`) is self-contained with clear TypeScript interface. |
| II. User-Centric Design | PASS | User stories documented with P1/P2 priorities and acceptance criteria in spec. |
| III. Test-Driven Development | PASS | Unit tests planned for: slice, selectors, hook, and API service. Component tests for loading/data states. |
| IV. Type Safety & Code Quality | PASS | All new types use TypeScript interfaces; no `any` types. New types in `industryTypes.ts`. |
| V. Performance & Accessibility | PASS | Lazy-loading preserved; skeleton loaders prevent CLS; conditional fetch avoids unnecessary network calls. |
| VI. State Management Discipline | PASS | Industry data managed via Redux Toolkit slice with typed actions/selectors. Immutable updates via Immer (RTK default). Session-scoped caching via `isLoaded` flag. |
| Technology Standards | PASS | All mandated technology used: React 19, TypeScript strict, Redux Toolkit, Vitest, ESLint/Prettier. |

**Gate Result**: PASS — no violations. Complexity Tracking section not needed.

## Project Structure

### Documentation (this feature)

```text
specs/009-industry-status-api/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── industry-api.yaml
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── types/
│   └── industryTypes.ts           # NEW: Industry API response types + slice state
├── services/api/
│   └── industryApi.ts             # NEW: getIndustry() service function
├── store/
│   ├── slices/
│   │   └── industrySlice.ts       # NEW: Redux slice + fetchIndustry thunk
│   ├── selectors/
│   │   └── industrySelectors.ts   # NEW: typed selectors for industry state
│   └── store.ts                   # MODIFIED: register industryReducer
├── hooks/
│   └── useIndustry.ts             # NEW: hook encapsulating conditional fetch logic
├── pages/
│   ├── dashboard/
│   │   └── DashboardPage.tsx      # MODIFIED: pass industry status to tab panels
│   └── benchmark/
│       ├── BenchmarkPage.tsx       # MODIFIED: use useIndustry hook for loading/data
│       └── BenchmarkFinchPage.tsx  # MODIFIED: use useIndustry hook for loading/data
└── types/
    └── finchStatusTypes.ts        # MODIFIED: add `industry` field to FinchConnection

tests/
├── hooks/
│   └── useIndustry.test.ts        # NEW
├── store/
│   ├── slices/
│   │   └── industrySlice.test.ts  # NEW
│   └── selectors/
│       └── industrySelectors.test.ts # NEW
└── services/
    └── industryApi.test.ts        # NEW
```

**Structure Decision**: Single frontend project. All new files follow the existing patterns established by `dashboardSlice.ts`, `finchStatusSlice.ts`, `dashboardApi.ts`, and `useFinchStatus.ts`. No new directories created — all files placed within existing folder structure.
