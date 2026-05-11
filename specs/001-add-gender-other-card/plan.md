# Implementation Plan: Add "Other" Gender Card with Tooltip

**Branch**: `001-add-gender-other-card` | **Date**: 2026-05-07 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/001-add-gender-other-card/spec.md`

## Summary

Add a third "Other" gender breakdown card to the Workforce Demographics section. The card reads `gender.other` from the backend response (optional field), displays it with a `--` fallback when absent, and shows a tooltip: "Other includes individuals that choose not to identify or do not identify as man or woman." Two source files change (`workforceTypes.ts`, `useWorkforceDemographicsConfig.ts`) and one test file is updated (`useWorkforceDemographicsConfig.test.ts`). No new components, no layout changes, no API changes.

## Technical Context

**Language/Version**: TypeScript 5 + React 19  
**Primary Dependencies**: Redux Toolkit (store/selectors), Vitest + React Testing Library (tests)  
**Storage**: N/A (read-only display of backend data already in Redux store)  
**Testing**: Vitest — `pnpm run test`; type-check — `pnpm run type-check`; lint — `pnpm lint:fix`  
**Target Platform**: Web browser (Vite SPA)  
**Project Type**: Single web application  
**Performance Goals**: No measurable delta — card renders synchronously from existing selector output  
**Constraints**: `GenderBreakdown.other` must be optional (`other?: string`) so the change is backwards-compatible with API responses that omit the field  
**Scale/Scope**: 3 files modified (1 type, 1 hook, 1 test file); ~20 lines net added

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Gate                                                           | Status  | Notes                                                                        |
| -------------------------------------------------------------- | ------- | ---------------------------------------------------------------------------- |
| I. Component-First — self-contained component with typed props | ✅ Pass | No new component needed; existing `StaticCard` already accepts `tooltipText` |
| II. User-Centric — user stories with acceptance criteria       | ✅ Pass | P1 + P2 stories defined in spec with acceptance scenarios                    |
| III. TDD — tests written, all tests pass                       | ✅ Pass | Existing test file updated; no new test infrastructure needed                |
| IV. Type Safety — no `any`, strict TS                          | ✅ Pass | `other?: string` added to `GenderBreakdown`; no type widening                |
| V. Accessibility — WCAG 2.1 AA                                 | ✅ Pass | `StaticCard` tooltip already uses accessible primitives; no new patterns     |
| VI. State Management — typed selectors, no direct mutation     | ✅ Pass | Uses existing `selectDemographicsSection` selector; no store changes         |

**No violations — no complexity justification required.**

## Project Structure

### Documentation (this feature)

```text
specs/001-add-gender-other-card/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output — step-by-step implementation guide
├── contracts/
│   └── gender-breakdown.md   # Phase 1 output — data contract change
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code (changed files)

```text
src/
├── types/
│   └── workforceTypes.ts          # MODIFY: add other?: string to GenderBreakdown
└── hooks/
    └── useWorkforceDemographicsConfig.ts  # MODIFY: add "other" card config

tests/
└── hooks/
    └── useWorkforceDemographicsConfig.test.ts  # MODIFY: update sampleDemographics + new test cases
```

**Structure Decision**: Single web application; only modifies existing files within established directories. No new files, no new directories.
