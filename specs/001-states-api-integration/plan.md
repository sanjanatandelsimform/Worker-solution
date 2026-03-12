# Implementation Plan: Replace Hardcoded State Options with Live API Integration

**Branch**: `001-states-api-integration` | **Date**: 11 March 2026 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-states-api-integration/spec.md`

## Summary

Replace the hardcoded 50-state options in `topWorkLocations` and `employeeLivingZipCodes` assessment questions with a live API call to `GET /api/v1/lookup/states`. The API is fetched once on `WorkforceTab` mount via a dedicated `useStatesLookup` custom hook. The response is transformed from `{ stateAbbreviation, stateName }` to `{ id, label }` at the hook layer. Modified questions are injected into `DynamicTab` via deep cloning — no changes to `DynamicTab`, `DynamicQuestionRenderer`, `questionData.json`, or existing types.

## Technical Context

**Language/Version**: TypeScript (strict mode) + React 19.2.0  
**Primary Dependencies**: axios 1.13.2 (HTTP), Vite/rolldown-vite (build), Tailwind CSS 4 (styling)  
**Storage**: N/A (no client-side persistence for state options)  
**Testing**: vitest 4.0 + @testing-library/react 16.3  
**Target Platform**: Web (SPA, all modern browsers)  
**Project Type**: Single web application (frontend-only — API already exists)  
**Performance Goals**: State options must render within 1 network round-trip; no visible delay beyond that  
**Constraints**: Single API call per WorkforceTab mount (FR-005); zero regressions on other questions (FR-006)  
**Scale/Scope**: 2 questions affected (topWorkLocations, employeeLivingZipCodes), 1 new hook, 1 new service function, 1 modified page component

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| **I. Component-First Architecture** | ✅ PASS | New `useStatesLookup` hook is self-contained with clear TypeScript interface. No component changes to `DynamicTab` or `DynamicQuestionRenderer`. Option injection is via question cloning in the owning component (`WorkforceTab`). |
| **II. User-Centric Design** | ✅ PASS | 3 prioritized user stories (P1–P3) with acceptance criteria and independent tests. Each story delivers standalone value. Loading/error states provide smooth UX. |
| **III. Test-Driven Development** | ✅ PASS | TDD is mandated: tests for `transformStates()`, `useStatesLookup`, and WorkforceTab integration are written BEFORE implementation. Red-Green-Refactor workflow enforced in tasks.md. |
| **IV. Type Safety & Code Quality** | ✅ PASS | `StateOptionApi` and `StatesLookupResponse` interfaces are explicitly typed. No `any` types. `transformStates()` has typed input/output. Existing `QuestionField.options` type (`Array<{ id: string; label: string }>`) reused unchanged. |
| **V. Performance & Accessibility** | ✅ PASS | Single fetch on mount — no redundant calls. Disabled select with "Loading states..." placeholder maintains accessible state. No new bundle size impact beyond one hook file. |
| **VI. State Management Discipline** | ✅ PASS | Local `useState` in `useStatesLookup` — no global state. Side effects contained in `useEffect` with empty deps. State updates are immutable (new arrays via `.filter().map()`). |
| **Technology Standards** | ✅ PASS | Uses existing axios instance, vitest, React 19, TypeScript strict mode. No new dependencies introduced. |

**Post-Phase 1 Re-check**: All gates remain PASS. The design adds `getStates()` to `assessmentApi.ts` (follows `getIndustries()` pattern in `authApi.ts`), creates one hook file, and modifies one page component. No architecture-level changes.

## Project Structure

### Documentation (this feature)

```text
specs/001-states-api-integration/
├── plan.md              # This file
├── research.md          # Phase 0: 10 architectural decisions
├── data-model.md        # Phase 1: entities, state transitions, injection paths
├── quickstart.md        # Phase 1: implementation guide with verification checklist
├── contracts/
│   └── states-lookup.md # Phase 1: API contract (request/response/transformation)
├── checklists/
│   └── requirements.md  # Requirements traceability
└── tasks.md             # Phase 2: 25 tasks organized by user story
```

### Source Code (repository root)

```text
src/
├── services/
│   └── api/
│       └── assessmentApi.ts              # MODIFIED: Add getStates() + StateOptionApi + StatesLookupResponse types
├── hooks/
│   └── useStatesLookup.ts               # NEW: Custom hook (useState + useEffect fetch pattern)
├── pages/
│   └── assessmentWorkforce/
│       └── WorkforceTab.tsx              # MODIFIED: Call useStatesLookup(), clone questions, inject options
├── components/
│   └── assessment/
│       ├── DynamicTab.tsx                # UNCHANGED: Receives questions as prop
│       └── DynamicQuestionRenderer.tsx   # UNCHANGED: Reads options from question.validationRules.fields[].options
├── data/
│   └── assessment/
│       └── questionData.json             # UNCHANGED: Structure preserved (FR-009)
└── types/
    └── questionTypes.ts                  # UNCHANGED: QuestionField.options type already fits

tests/
├── hooks/
│   └── useStatesLookup.test.ts          # NEW: Unit + hook tests (transformStates, lifecycle)
└── pages/
    └── WorkforceTab.test.tsx             # NEW: Integration tests (option injection, error/loading states)
```

**Structure Decision**: Single web application (frontend SPA). All changes are within `src/` and `tests/`. One new file created (`useStatesLookup.ts`), two files modified (`assessmentApi.ts`, `WorkforceTab.tsx`), one new test file per directory convention. No new directories needed.

## Complexity Tracking

> No constitution violations. No complexity justification needed.
