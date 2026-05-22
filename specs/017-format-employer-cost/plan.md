# Implementation Plan: Format Employer Cost Display

**Branch**: `017-format-employer-cost` | **Date**: 2026-04-20 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/017-format-employer-cost/spec.md`

## Summary

`BenefitsCost.employerCost` is changing from a pre-formatted `string` to a raw `number | null` in the workforce API response. The FE must update the interface, add a `formatEmployerCostPerYear` utility (handling null/undefined/negative → `"--"`, zero → `"$0/yr"`, positive → `"$X,XXX/yr"`), update the compensation hook to call the formatter, and update four test fixtures. No user-visible change when data is valid; edge cases now degrade gracefully to `"--"` instead of showing raw numbers or crashing.

## Technical Context

**Language/Version**: TypeScript 5 + React 19  
**Primary Dependencies**: Redux Toolkit (state), Vitest + RTL (testing), Tailwind v4 (styling), Vite (build)  
**Storage**: N/A — pure FE display change  
**Testing**: Vitest unit tests + React Testing Library  
**Target Platform**: Web browser SPA  
**Project Type**: Single web application (`src/`)  
**Performance Goals**: N/A — no new async operations  
**Constraints**: No new dependencies; no routing or Redux state shape changes  
**Scale/Scope**: 6 files modified, 1 file created; ~50 LOC total

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle                       | Status  | Notes                                                                                                                                      |
| ------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| I. Component-First Architecture | ✅ Pass | No new components. The formatter is a pure utility function with a clear, typed signature.                                                 |
| II. User-Centric Design         | ✅ Pass | Spec has 2 user stories with acceptance criteria and edge cases.                                                                           |
| III. Test-Driven Development    | ✅ Pass | New `tests/utils/formatters.test.ts` written before implementation. Four existing fixture files updated concurrently with the type change. |
| IV. Type Safety & Code Quality  | ✅ Pass | `employerCost: number \| null` eliminates the `string` escape hatch. No `any` types introduced.                                            |
| V. Performance & Accessibility  | ✅ Pass | No UI changes; no new DOM output. `Intl.NumberFormat`/`toLocaleString` are native browser APIs — negligible cost.                          |
| VI. State Management Discipline | ✅ Pass | No state shape changes. The Redux slice and selectors are untouched.                                                                       |

**Post-design re-check**: All gates pass. No violations to track.

## Project Structure

### Documentation (this feature)

```text
specs/017-format-employer-cost/
├── plan.md          ← this file
├── spec.md
├── research.md      ← Phase 0 (complete)
├── data-model.md    ← Phase 1 (complete)
├── quickstart.md    ← Phase 1 (complete)
└── checklists/
    └── requirements.md
```

### Source Code (affected files)

```text
src/
├── types/
│   └── workforceTypes.ts          ← change BenefitsCost.employerCost: string → number | null
├── utils/
│   └── formatters.ts              ← add formatEmployerCostPerYear()
└── hooks/
    └── useWorkforceCompensationConfig.ts  ← import + call formatEmployerCostPerYear

tests/
├── utils/
│   └── formatters.test.ts         ← NEW: 6 unit tests for formatEmployerCostPerYear
├── services/
│   └── workforceApi.test.ts       ← update mock: employerCost string → number
└── store/
    ├── workforceSlice.test.ts     ← update 2 mock occurrences
    └── workforceSelectors.test.ts ← update 1 mock occurrence
```

**Structure Decision**: Single web application. All changes are within the existing `src/` and `tests/` tree. No new directories or barrel files required.

## Complexity Tracking

> No constitution violations. Table omitted.
