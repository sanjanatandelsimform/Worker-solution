# Implementation Plan: RecommendationsFinchPage Test Coverage

**Branch**: `001-recommendations-finch-tests` | **Date**: 2026-04-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-recommendations-finch-tests/spec.md`

## Summary

Create a comprehensive test file `tests/pages/RecommendationsFinchPage.test.tsx` for the `RecommendationsFinchPage` component. The component reads from three Redux slices (workforce, recommendations, industry), computes derived values, and conditionally renders sections based on Finch assessment completeness. All three hook dependencies (`useAssessmentStatus`, `useIndustry`, `useFinchStatus`) will be mocked; Redux state will be preloaded via a `createTestStore` helper following the established `DashboardPage.test.tsx` pattern.

## Technical Context

**Language/Version**: TypeScript 5.x, React 19  
**Primary Dependencies**: Vitest 3.x, @testing-library/react 16.x, Redux Toolkit 2.x, react-router-dom 7.x  
**Storage**: N/A (tests only — no persistence layer)  
**Testing**: Vitest + jsdom + @testing-library/react + @testing-library/jest-dom  
**Target Platform**: Node.js (jsdom test environment via `vitest.config.ts`)  
**Project Type**: Web (single-repo React SPA)  
**Performance Goals**: Tests must complete in <10s total  
**Constraints**: No arbitrary `setTimeout`/`waitFor` delays; no real network calls; all external hooks mocked  
**Scale/Scope**: 1 new test file, ~25–30 test cases covering 7 user stories

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Component-First Architecture | ✅ PASS | No new components added; tests validate existing component boundaries |
| II. User-Centric Design | ✅ PASS | All 7 user stories from spec are independently testable |
| III. Test-Driven Development | ✅ PASS | This feature IS the test-writing task; tests will be added before any code changes |
| IV. Type Safety & Code Quality | ✅ PASS | No `any` types; test store uses typed preloadedState; all mocks typed |
| V. Performance & Accessibility | ✅ PASS | No UI changes; tests verify existing rendered output |
| VI. State Management Discipline | ✅ PASS | Redux state preloaded via `configureStore`; hooks mocked to avoid side effects |

**Post-design re-check**: No violations found. No complexity tracking entries needed.

## Project Structure

### Documentation (this feature)

```text
specs/001-recommendations-finch-tests/
├── plan.md              ✅ This file
├── research.md          ✅ Phase 0 output
├── data-model.md        ✅ Phase 1 output
├── quickstart.md        ✅ Phase 1 output
├── contracts/           N/A (no new API contracts)
└── tasks.md             Phase 2 output (via /speckit.tasks)
```

### Source Code (repository root)

```text
tests/
└── pages/
    └── RecommendationsFinchPage.test.tsx   ← NEW (only file changed)

src/
└── pages/recommendations/
    └── RecommendationsFinchPage.tsx         ← READ-ONLY (no modifications)
```

## Complexity Tracking

No constitution violations. No complexity tracking entries required.
