# Tasks: Add Health Premium Question to Benefits Section

**Feature**: `001-add-health-premium-question`  
**Branch**: `001-add-health-premium-question`  
**Input**: Design documents from `/specs/001-add-health-premium-question/`  
**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | quickstart.md ✅

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[US1]** / **[US2]**: User story label (maps to spec.md priorities P1 / P2)
- Include exact file paths in all descriptions

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Type definitions that both user stories depend on. Must be complete before any section component or payload work.

**⚠ CRITICAL**: US1 (render) depends on T001. US2 (payload) depends on T002. Both tasks are independent of each other.

- [x] T001 [P] Add `isNumericInput?: boolean` to `QuestionDefinition` interface in `src/types/additionalQuestionsTypes.ts`
- [x] T002 [P] Add `healthPremiumMonthly?: number` to `BenefitsPayload` interface in `src/types/finchAssessmentTypes.ts`

**Checkpoint**: Type definitions in place — US1 and US2 implementation can now proceed.

---

## Phase 3: User Story 1 — Employer Enters Health Premium Amount (Priority: P1) 🎯 MVP

**Goal**: Benefits section displays a third required question with a numeric dollar-amount input, placeholder "Enter amount", helper text "i.e. $300", and inline validation when left empty on submit.

**Independent Test**: Load the Additional Questions page → scroll to Benefits section → verify question #3 appears with numeric input, placeholder, helper text, and required indicator. Attempt to submit without filling the field and confirm error "Enter an amount" appears.

### Tests for User Story 1 (TDD — write FIRST, confirm failure before T004)

- [x] T003 [US1] Create `tests/pages/AdditionalQuestionsHealthPremium.test.tsx` with all US1 tests: renders question label, shows "Enter amount" placeholder, shows "i.e. $300" helper text, shows required indicator, renders inline error "Enter an amount" on empty submit, clears error when user types a value

### Implementation for User Story 1

- [x] T004 [US1] Extend `src/pages/additionalQuestions/BenefitsRetirementSection.tsx`: add `health-plan-monthly-premium` entry to `benefitsQuestions` array (with `isNumericInput: true`), add `healthPremiumMonthly` + `onHealthPremiumMonthlyChange` to `BenefitsRetirementSectionProps`, add `else if (question.isNumericInput)` render branch inside `benefitsQuestions.map()` (depends on T001)
- [x] T005 [US1] Extend `src/pages/additionalQuestions/AdditionalQuestions.tsx`: add `healthPremiumMonthly` useState, add `if (!healthPremiumMonthly)` validation rule targeting `"health-plan-monthly-premium"` key, pass `healthPremiumMonthly` and `onHealthPremiumMonthlyChange={setHealthPremiumMonthly}` props to `<BenefitsRetirementSection>` (depends on T004)

**Checkpoint**: At this point User Story 1 is fully functional and independently testable. T003 tests should now pass.

---

## Phase 4: User Story 2 — Form Data Captured for Submission (Priority: P2)

**Goal**: The entered health premium value is included in the `buildFinchAssessmentPayload` call and sent to the backend as `benefits.healthPremiumMonthly` (numeric).

**Independent Test**: Fill in a premium amount and submit the form. Spy on `submit` and assert `payload.benefits.healthPremiumMonthly` equals the entered value as a number.

### Tests for User Story 2 (TDD — write FIRST, confirm failure before T007)

- [x] T006 [US2] Add payload test to `tests/pages/AdditionalQuestionsHealthPremium.test.tsx`: spy on `useSubmitFinchAssessment.submit`, enter a premium value (e.g. "300"), submit form, assert `payload.benefits.healthPremiumMonthly === 300`

### Implementation for User Story 2

- [x] T007 [P] [US2] Update `src/utils/finchAssessmentPayload.ts`: add `healthPremiumMonthly: string = ""` as final parameter to `buildFinchAssessmentPayload` signature; add `...(healthPremiumMonthly ? { healthPremiumMonthly: Number(healthPremiumMonthly) } : {})` spread into `benefits` object (depends on T002)
- [x] T008 [US2] Update `buildFinchAssessmentPayload` call in `src/pages/additionalQuestions/AdditionalQuestions.tsx`: append `healthPremiumMonthly` as the final argument (depends on T007)

**Checkpoint**: At this point both User Stories 1 and 2 are fully functional. T006 test should now pass.

---

## Phase 5: Polish & Quality Gate

**Purpose**: Verify the complete feature compiles, lints, formats, and works end-to-end.

- [x] T009 Run `pnpm run type-check` — must exit with 0 errors
- [x] T010 [P] Run `pnpm lint:fix` then `pnpm format`
- [ ] T011 Smoke-test the `/additional-questions` route in `pnpm dev` — confirm question #3 renders, accepts input, shows error on empty submit, and clears error on input

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 2)**: No dependencies — start immediately. T001 and T002 are parallel.
- **User Story 1 (Phase 3)**: T003 → T004 → T005 (sequential within US1; T004 depends on T001)
- **User Story 2 (Phase 4)**: T006 → T007 → T008 (sequential within US2; T007 depends on T002)
- **Polish (Phase 5)**: T009 → T010 → T011 (depends on all above)

### User Story Dependencies

| Story          | Depends on   | Can start when                           |
| -------------- | ------------ | ---------------------------------------- |
| US1 — UI field | T001 (types) | After T001 complete                      |
| US2 — payload  | T002 (types) | After T002 complete (independent of US1) |

### Within Each User Story

- TDD: Tests written FIRST and confirmed failing before implementation
- T004 must precede T005 (props interface must exist before parent passes the props)
- T007 must precede T008 (function signature must accept the param before call site passes it)

---

## Parallel Execution

### Phase 2 (both tasks in parallel)

```
T001  src/types/additionalQuestionsTypes.ts
T002  src/types/finchAssessmentTypes.ts
```

### After Phase 2 — US1 and US2 can proceed in parallel (if two developers)

```
Developer A (US1)          Developer B (US2)
─────────────────          ─────────────────
T003  write US1 tests      T006  write US2 test
T004  BenefitsRetirement   T007  finchAssessmentPayload.ts
T005  AdditionalQuestions  T008  AdditionalQuestions.tsx
```

---

## Implementation Strategy

**MVP scope** = Phase 2 + Phase 3 (T001 − T005 + T003).

This delivers the complete visible feature (FR-001 through FR-006, FR-008) and is independently shippable. Phase 4 (T006 − T008) wires up the payload (FR-007) and can be added immediately after or in parallel.

**Suggested single-developer order**: T001 → T002 → T003 → T004 → T005 → T006 → T007 → T008 → T009 → T010 → T011
