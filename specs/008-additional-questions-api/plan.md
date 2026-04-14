# Implementation Plan: API Integration for the Additional Questions Form

**Branch**: `008-additional-questions-api` | **Date**: 2026-04-13 | **Spec**: [spec.md](./spec.md)

## Summary

Wire the "Next" button on `AdditionalQuestions.tsx` to submit a four-section payload (`workforce`, `compensation`, `benefits`, `goals`) to `POST /api/v1/assessment/finch`. On success show a success banner (`ErrorMessage errorType="success"`) and navigate to `/dashboard`. On failure show a danger banner and keep the form intact. Option IDs in the static form data are updated to directly equal API values, eliminating a runtime mapping layer. A pure `buildFinchAssessmentPayload` util handles payload assembly; a `useSubmitFinchAssessment` hook manages async state. `workforceGoalsRanking` is static for this release.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode) + React 19.2
**Primary Dependencies**: axios 1.13.2 (`apiClient` from `authApi.ts`), react-router-dom 7, Vitest + React Testing Library
**Storage**: Local component state only (no Redux persistence for this feature)
**Testing**: Vitest unit tests + React Testing Library; TDD (tests before implementation)
**Target Platform**: Web (Vite SPA)
**Project Type**: Web application (single frontend)
**Performance Goals**: API call within 10-second timeout; navigate to `/dashboard` within 1 second of success response
**Constraints**: No new Redux slice; reuse `apiClient`; reuse `ErrorMessage` component; no sonner/toast
**Scale/Scope**: Single page, one API call per submission

## Constitution Check

| Principle                        | Status | Notes                                                                                                                                |
| -------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| I. Component-First Architecture  | PASS   | `buildFinchAssessmentPayload` is a pure util; `useSubmitFinchAssessment` is a self-contained hook with explicit TypeScript interface |
| II. User-Centric Design          | PASS   | Spec has P1/P2/P3 stories with independent acceptance criteria                                                                       |
| III. Test-Driven Development     | PASS   | Tests written before implementation for all three new files                                                                          |
| IV. Type Safety                  | PASS   | New `finchAssessmentTypes.ts`; no `any` types; strict mode                                                                           |
| V. Performance and Accessibility | PASS   | Button disabled during submission; ARIA state via `isDisabled`; form structure otherwise unchanged                                   |
| VI. State Management Discipline  | PASS   | Local state only; side effects in hook; no global state introduced                                                                   |

## Project Structure

### Documentation (this feature)

```text
specs/008-additional-questions-api/
├── spec.md
├── research.md                          (Phase 0 complete)
├── data-model.md                        (Phase 1 complete)
├── quickstart.md                        (Phase 1 complete)
├── plan.md                              (this file)
├── contracts/
|   └── finch-assessment-post.md         (Phase 1 complete)
└── checklists/
    └── requirements.md
```

### Source Code Changes

```text
src/
├── types/
|   └── finchAssessmentTypes.ts          NEW  payload + response interfaces
├── utils/
|   └── finchAssessmentPayload.ts        NEW  pure payload builder
├── hooks/
|   └── useSubmitFinchAssessment.ts      NEW  isSubmitting/error/success hook
├── services/api/
|   └── assessmentApi.ts                 EDIT add submitFinchAssessment()
└── pages/additionalQuestions/
    └── AdditionalQuestions.tsx          EDIT update IDs, wire selects, connect hook

tests/
├── utils/
|   └── finchAssessmentPayload.test.ts   NEW  payload builder unit tests
├── hooks/
|   └── useSubmitFinchAssessment.test.ts NEW  hook unit tests
└── services/
    └── finchAssessmentApi.test.ts       NEW  service function unit tests
```

**Structure Decision**: Web single-project. All changes inside `src/` following the existing feature-based layout. No backend changes in this repo.

## Phase 0: Research (Complete)

See [research.md](./research.md) for full findings. Key decisions:

- **HTTP client**: `apiClient` from `authApi.ts` (token-refresh interceptor; the codebase standard for all new services)
- **Service location**: `assessmentApi.ts` (endpoint is `/assessment/finch`; belongs with other assessment calls)
- **Month handling**: `capitalise(id)` converts `"january"` to `"January"`. Do NOT use `mapMonthToApiValue` (produces 3-letter abbreviations incompatible with this endpoint)
- **Option IDs**: Updated to equal API values directly; no runtime mapping object needed
- **Payload builder**: Pure function `buildFinchAssessmentPayload` in `src/utils/`
- **Hook**: `useSubmitFinchAssessment` exposes `isSubmitting`, `error`, `success`, `submit`, `clearError`
- **Goal IDs**: Updated to equal API value strings directly in `goalsData`; sent as-is in the payload — no label lookup needed
- **Static ranking**: `["Retain Talent", "Attract Talent", "Reduce Absenteeism"]`
- **Validation**: Four synchronous required-field checks before the API call

## Phase 1: Design Artifacts (Complete)

- [x] [data-model.md](./data-model.md) -- TypeScript types, state shape, option ID map, goal ID → API value mapping
- [x] [contracts/finch-assessment-post.md](./contracts/finch-assessment-post.md) -- Full API contract with request/response shapes and error handling table
- [x] [quickstart.md](./quickstart.md) -- Step-by-step implementation guide with code snippets

## Implementation Phases

### Phase A -- Foundation (Types + TDD scaffolding)

**Goal**: All new test files created in TDD Red state before any production code is written.

**Tasks**:

- **A1**: Create `src/types/finchAssessmentTypes.ts` with `FinchAssessmentPayload`, `WorkforcePayload`, `CompensationPayload`, `BenefitsPayload`, `GoalsPayload`, `FinchAssessmentResponse`
- **A2**: Create `tests/utils/finchAssessmentPayload.test.ts` with 8 test cases (TDD Red)
- **A3**: Create `tests/hooks/useSubmitFinchAssessment.test.ts` with 5 test cases (TDD Red)
- **A4**: Create `tests/services/finchAssessmentApi.test.ts` with 4 test cases (TDD Red)

**Gate**: `pnpm run type-check` passes. New test files exist and all new tests fail (expected Red state).

---

### Phase B -- Core Logic (Utils + Hook + Service)

**Goal**: All three new test files turn Green.

**Tasks**:

- **B1**: Create `src/utils/finchAssessmentPayload.ts` -- tests/utils/finchAssessmentPayload.test.ts Green
- **B2**: Create `src/hooks/useSubmitFinchAssessment.ts` -- tests/hooks/useSubmitFinchAssessment.test.ts Green
- **B3**: Edit `src/services/api/assessmentApi.ts` -- add `submitFinchAssessment()` at the bottom of the file using `apiClient` -- tests/services/finchAssessmentApi.test.ts Green

**Gate**: `pnpm test` -- all Phase A test files pass. `pnpm run type-check` passes.

---

### Phase C -- Component Integration

**Goal**: `AdditionalQuestions.tsx` fully wired; smoke test passes.

**Tasks**:

- **C1**: Update 18 option IDs in `questions`, `compensationQuestions`, `retirementQuestions` and update 14 goal IDs in `goalsData` to API value strings (see data-model.md for the full table)
- **C2**: Add `annualRaiseMonth`, `payrollProvider`, `benefitsEnrollmentMonth` state variables
- **C3**: Verify the `Select` component controlled props by reading `src/components/base/select/select.tsx` -- then wire all three `Select` components with the correct prop names
- **C4**: Import `useSubmitFinchAssessment` and `buildFinchAssessmentPayload`; add `validationError` state
- **C5**: Add `handleSubmit` with 4 required-field validation checks, then payload build and `submit()` call
- **C6**: Add `useEffect` to navigate to `/dashboard` after `success === true`
- **C7**: Render `ErrorMessage` banners at the top of the form content area (danger for error/validation, success for success)
- **C8**: Wire "Next" button with `onPress={handleSubmit}`, `isDisabled={isSubmitting}`, conditional "Submitting..." label

**Gate**: `pnpm run type-check` passes. `pnpm dev` smoke test: form submits correctly, success banner shown, navigates to `/dashboard`.

---

### Phase D -- Quality Gate

**Tasks**:

- **D1**: `pnpm run type-check` -- zero errors
- **D2**: `pnpm lint:fix` + `pnpm format`
- **D3**: `pnpm test` -- full suite passes (new + existing tests)
- **D4**: Smoke test error path (mock 500 response -- verify danger banner, all answers intact)
- **D5**: Smoke test validation path (leave required field empty -- verify validation error shown, no API call made)

---

## Risk Notes

1. **`Select` component prop API**: The component at `src/components/base/select/select.tsx` may use `onSelectionChange`/`selectedKey` (React Aria) or `onChange`/`value` (HTML-style). Must verify before Phase C task C3.

2. **`apiClient` coexistence in `assessmentApi.ts`**: This file currently uses its own local `api` Axios instance. The new `submitFinchAssessment` function uses `apiClient` from `authApi.ts`. Both coexist in the file intentionally. Do NOT refactor existing functions in this PR.

3. **Goal IDs updated to API values**: The `id` fields in `goalsData` now equal API value strings. Checkbox labels on the Goals section are unchanged (the `label` field is display-only). Confirm acceptable before merge.

4. **Button `isDisabled` prop name**: The `Button` may use `isDisabled` (React Aria) or `disabled` (HTML). Verify against `src/components/base/buttons/button.tsx` before Phase C task C8.
