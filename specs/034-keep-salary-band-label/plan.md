# Implementation Plan: Keep Salary Band Label When No Data

**Branch**: `034-keep-salary-band-label` | **Date**: 2026-05-07 | **Spec**: [spec.md](spec.md)  
**Input**: Feature specification from `specs/034-keep-salary-band-label/spec.md`

## Summary

In the Salary Range Chart (workforce page), salary band labels are currently hidden along with their bars when data is absent. This plan extracts the label rendering from inside the null guard in `drawBars()` so it always fires regardless of data availability, while keeping bar/whisker/value-label suppression unchanged. Two new test cases validate the new behavior; all existing tests remain unmodified.

## Technical Context

**Language/Version**: TypeScript 5.x, React 19  
**Primary Dependencies**: HTML Canvas API (native browser), React hooks (`useEffect`, `useRef`)  
**Storage**: N/A — pure client-side rendering, no state or persistence changes  
**Testing**: Vitest + React Testing Library — `pnpm run test`  
**Target Platform**: Browser (Vite web app, client-side routing)  
**Project Type**: Web application (single frontend)  
**Performance Goals**: No change — same canvas draw call count (label renders for null items now)  
**Constraints**: Canvas-based rendering; change must not affect pixel output for bands with full data  
**Scale/Scope**: Single component change (`SalaryChart.tsx`) + one test file

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle                       | Pre-Design | Post-Design | Notes                                                                   |
| ------------------------------- | ---------- | ----------- | ----------------------------------------------------------------------- |
| I. Component-First Architecture | ✅ PASS    | ✅ PASS     | No new components; `SalaryChart` props interface unchanged              |
| II. User-Centric Design         | ✅ PASS    | ✅ PASS     | User stories defined, priorities assigned, acceptance criteria complete |
| III. Test-Driven Development    | ✅ PASS    | ✅ PASS     | 2 new tests cover new behavior; TDD workflow applied                    |
| IV. Type Safety & Code Quality  | ✅ PASS    | ✅ PASS     | No `any`; no type changes; `ChartItem` unchanged                        |
| V. Performance & Accessibility  | ✅ PASS    | ✅ PASS     | Canvas rendering; no a11y/bundle impact                                 |
| VI. State Management Discipline | ✅ PASS    | ✅ PASS     | No state involved; pure rendering function                              |

**Result: No gate violations. No complexity justification required.**

## Project Structure

### Documentation (this feature)

```text
specs/034-keep-salary-band-label/
├── plan.md          ← this file
├── spec.md          ← feature specification
├── research.md      ← Phase 0 output
├── data-model.md    ← Phase 1 output
├── quickstart.md    ← Phase 1 output (implementation guide)
└── checklists/
    └── requirements.md
```

### Source Code (files changed)

```text
src/
└── pages/
    └── workforce/
        └── SalaryChart.tsx   ← MODIFIED: label extracted from null guard

tests/
└── pages/
    └── SalaryChart.test.tsx  ← MODIFIED: 2 new it() blocks added
```

**Structure Decision**: Single web application. Only `src/pages/workforce/SalaryChart.tsx` and `tests/pages/SalaryChart.test.tsx` are modified.

## Complexity Tracking

> No constitution violations. This section is intentionally blank.
