# Implementation Plan: Update `industryAverageWage` to Object Type

**Branch**: `036-industry-average-wage` | **Date**: 2026-05-12 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/036-industry-average-wage/spec.md`

## Summary

The backend changed the `industryAverageWage` field in `IndustryOverview` from a flat `number` to an object `{ hourly: number; salary: number }`. This plan covers: (1) updating the TypeScript type in `industryTypes.ts`, (2) fixing the extraction in `RecommendationsFinchPage.tsx` to read `.salary`, and (3) updating the one test fixture that mocks the old flat-number shape. No new components or files are introduced.

## Technical Context

**Language/Version**: TypeScript 5.x, React 19  
**Primary Dependencies**: Redux Toolkit (state), Vitest + React Testing Library (tests)  
**Storage**: N/A (in-memory Redux state, no persistence layer touched)  
**Testing**: Vitest (`pnpm run test`), type-check via `tsc --noEmit`  
**Target Platform**: Web (Vite SPA)  
**Project Type**: Single web application (`src/` + `tests/` at repo root)  
**Performance Goals**: N/A — no runtime-critical paths touched  
**Constraints**: `pnpm run type-check` must pass with 0 errors; `pnpm run test` must pass with 0 failures  
**Scale/Scope**: 3 files modified, 1 type definition changed, 1 line of extraction logic changed, 1 test fixture updated

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Gate                            | Status  | Notes                                                             |
| ------------------------------- | ------- | ----------------------------------------------------------------- |
| I. Component-First Architecture | ✅ PASS | No new components; only type and extraction change                |
| II. User-Centric Design         | ✅ PASS | Spec has P1/P2 user stories with acceptance criteria              |
| III. Test-Driven Development    | ✅ PASS | Test fixtures updated; all tests must pass before merge           |
| IV. Type Safety & Code Quality  | ✅ PASS | `strict` mode maintained; `any` not used; explicit types enforced |
| V. Performance & Accessibility  | ✅ PASS | No UI changes; N/A for performance budgets                        |
| VI. State Management Discipline | ✅ PASS | Redux state shape change is additive (type only); no mutations    |

**Pre-Phase-0 Gate Result**: PASS — no violations. Proceed to research.

**Post-Phase-1 Re-check**: PASS — design confirmed no violations:

- Type change reuses existing `SalaryHourly` interface (no new types invented).
- No `any` types introduced; `as unknown as IndustryData` cast in tests was pre-existing.
- All tests continue to pass; fixture updated to exact new shape.
- No component API changes; `CompanyAtGlance` prop type unchanged.

## Project Structure

### Documentation (this feature)

```text
specs/036-industry-average-wage/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (type contract)
└── tasks.md             # Phase 2 output (speckit.tasks — NOT created here)
```

### Source Code (files modified by this feature)

```text
src/
└── types/
    └── industryTypes.ts           # MODIFY: IndustryOverview.industryAverageWage type

src/
└── pages/
    └── recommendations/
        └── RecommendationsFinchPage.tsx  # MODIFY: extract .salary from industryAverageWage

tests/
└── pages/
    └── RecommendationsFinchPage.test.tsx # MODIFY: update fixture industryAverageWage shape
```

**Structure Decision**: Single web application (Vite + React). Changes confined to existing files — no new files created in `src/`.

## Complexity Tracking

No constitution violations — complexity tracking not required.
