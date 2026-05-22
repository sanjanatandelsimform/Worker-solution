# Implementation Plan: Rename Seasonal → Other in Workforce Demographics

**Branch**: `034-rename-seasonal-to-other` | **Date**: 2026-05-07 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/034-rename-seasonal-to-other/spec.md`

## Summary

Rename the third employment type option across the workforce demographics feature from `"seasonal"` / `"Seasonal"` to `"other"` / `"Other"` to align with the backend API key. The change touches the TypeScript types, the hook that builds chart config, the page component, the UI component, and all associated test fixtures. No new components or files are required.

## Technical Context

**Language/Version**: TypeScript 5 / React 19  
**Primary Dependencies**: Vitest, React Testing Library, Redux Toolkit  
**Storage**: N/A  
**Testing**: Vitest + React Testing Library (`pnpm run test`)  
**Target Platform**: Web (SPA, Vite)  
**Project Type**: Single web application — `src/` + `tests/`  
**Performance Goals**: N/A — label/key rename, no runtime perf impact  
**Constraints**: `pnpm run type-check` and `pnpm run test` must pass; no external API calls needed  
**Scale/Scope**: 6 files touched, ~20 string occurrences changed

## Constitution Check

| Gate                            | Status  | Notes                                                                           |
| ------------------------------- | ------- | ------------------------------------------------------------------------------- |
| I. Component-First Architecture | ✅ PASS | No new components; editing existing self-contained component                    |
| II. User-Centric Design         | ✅ PASS | Change is spec-driven with documented acceptance criteria                       |
| III. Test-Driven Development    | ✅ PASS | Tests updated in same commit; all must pass before merge                        |
| IV. Type Safety & Code Quality  | ✅ PASS | `EmploymentType` union and interface fields updated; no `any` introduced        |
| V. Performance & Accessibility  | ✅ PASS | No bundle size or accessibility impact                                          |
| VI. State Management Discipline | ✅ PASS | React local state type updated; no Redux shape changes beyond type field rename |

**Verdict**: All gates pass. No violations to justify.

## Project Structure

### Documentation (this feature)

```text
specs/034-rename-seasonal-to-other/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output — implementation guide
└── checklists/
    └── requirements.md  # Pre-plan quality gate (completed)
```

### Source Code Affected

```text
src/
├── types/
│   └── workforceTypes.ts            # EmploymentTypeEntry.seasonal → other; AgeBreakdownEntry.seasonal → other
├── hooks/
│   └── useWorkforceDemographicsConfig.ts  # param type + donut config id/label/key
└── pages/
    └── workforce/
        ├── WorkforcePage.tsx        # selectedEmploymentType state type
        └── WorkforceDemographics.tsx # employmentTypeItems array + EmploymentType type + cast

tests/
├── hooks/
│   └── useWorkforceDemographicsConfig.test.ts  # all fixture seasonal → other + assertions
└── store/
    └── workforceSelectors.test.ts   # mockWorkforceData fixture seasonal → other
```

**Structure Decision**: Single web app structure (Option 1). All changes are within `src/` and `tests/`.
