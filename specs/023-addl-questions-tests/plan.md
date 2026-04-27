# Implementation Plan: Additional Questions Test Coverage Update

**Branch**: `023-addl-questions-tests` | **Date**: 2026-04-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/023-addl-questions-tests/spec.md`

## Summary

Update and extend the Vitest + React Testing Library test suite for `AdditionalQuestions.tsx` to match the current section-component architecture (WorkforceSection, CompensationSection, BenefitsRetirementSection, GoalsSection) and cover all untested scenarios: full form validation (11 required fields + 2 conditional checks), inline error clearing, submission payload construction, error/success display, and guard/redirect behaviour. No production code is modified — all changes are confined to `tests/pages/`.

## Technical Context

**Language/Version**: TypeScript 5.x, React 19  
**Primary Dependencies**: Vitest 2.x, React Testing Library (@testing-library/react + @testing-library/jest-dom), react-router-dom (MemoryRouter for tests)  
**Storage**: N/A — test-only feature, no storage changes  
**Testing**: Vitest with jsdom environment; setup file at `tests/setup.ts`; coverage via v8 provider targeting `src/**/*.{ts,tsx}`  
**Target Platform**: Node.js (test environment); jsdom simulates browser DOM  
**Project Type**: Web — single Vite app; tests live in `tests/pages/`  
**Performance Goals**: Test suite completes in under 10 seconds; no async timer overhead  
**Constraints**: No production code changes; no new npm dependencies; all mocks must be co-located in the test file or in `tests/setup.ts`  
**Scale/Scope**: 2 existing test files updated + 1 new comprehensive test file added; ~40–60 new test cases

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle                       | Status  | Notes                                                                           |
| ------------------------------- | ------- | ------------------------------------------------------------------------------- |
| I. Component-First Architecture | ✅ PASS | No components created; tests only                                               |
| II. User-Centric Design         | ✅ PASS | All 6 user stories have acceptance criteria                                     |
| III. Test-Driven Development    | ✅ PASS | This feature IS the test-writing task                                           |
| IV. Type Safety & Code Quality  | ✅ PASS | Test mocks must use correct TypeScript types from `additionalQuestionsTypes.ts` |
| V. Performance & Accessibility  | ✅ PASS | No UI changes; test runtime budget <10s                                         |
| VI. State Management Discipline | ✅ PASS | Tests validate immutable state updates in handlers                              |

**Gate Result**: All principles pass. No violations to justify. Proceeding to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/023-addl-questions-tests/
├── plan.md              # This file
├── research.md          # Phase 0 output — mock strategy decisions
├── data-model.md        # Phase 1 output — state shapes and validation matrix
├── quickstart.md        # Phase 1 output — implementation guide
└── tasks.md             # Phase 2 output (/speckit.tasks — NOT created here)
```

### Source Code (no production changes)

```text
tests/
└── pages/
    ├── AdditionalQuestions.test.tsx          # EXISTING — update redirect/guard tests
    ├── AdditionalQuestionsHealthPremium.test.tsx  # EXISTING — align mocks to current structure
    └── AdditionalQuestionsValidation.test.tsx     # NEW — validation, submission, error/success
```

**Structure Decision**: Single web application. Tests live under `tests/pages/` matching the existing pattern for page-level tests. No `contracts/` subdirectory needed — this feature has no API or data-model changes.

## Complexity Tracking

> No constitution violations — section left blank per instructions.

## Complexity Tracking

> No constitution violations — section left blank per instructions.

## Post-Design Constitution Check

_Re-evaluated after Phase 1 design artifacts._

| Principle                       | Status  | Notes                                             |
| ------------------------------- | ------- | ------------------------------------------------- |
| I. Component-First Architecture | ✅ PASS | Section mocks follow clear props interfaces       |
| II. User-Centric Design         | ✅ PASS | All 13 FR map to acceptance scenarios             |
| III. Test-Driven Development    | ✅ PASS | Full test coverage for all validation branches    |
| IV. Type Safety                 | ✅ PASS | Mocks typed via `vi.mocked()` with correct shapes |
| V. Performance & Accessibility  | ✅ PASS | No UI impact                                      |
| VI. State Management            | ✅ PASS | State transitions validated in tests              |

**Gate Result**: All checks pass post-design. Ready for `/speckit.tasks`.
