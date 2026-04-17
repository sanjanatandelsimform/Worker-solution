# Tasks: Add Retirement Employer Match Question

**Branch**: `015-add-retirement-match`  
**Input**: Design documents from `specs/015-add-retirement-match/`  
**Prerequisites**: spec.md âœ… (plan.md: inline from session)

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to
- Exact file paths included in all descriptions

---

## Phase 1: Setup

**Purpose**: Confirm baseline before any changes

- [x] T001 Run `pnpm run type-check` â€” confirm zero pre-existing TypeScript errors before any edits

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Type contract must be updated first â€” all other files depend on it

**âš ï¸ Blocks all implementation tasks**

- [x] T002 Update `src/types/finchAssessmentTypes.ts`

**Checkpoint**: Type contract updated â€” T003 through T007 can now proceed

---

## Phase 3: User Story 1 â€“ Employer Match Question End-to-End (Priority: P1) ðŸŽ¯ MVP

**Goal**: Insert the new "Does your retirement plan feature an employer match?" Yes/No question after `retirement-vesting-period` in the Retirement section, conditionally show a number input for the match percentage when Yes is selected, and include the new fields in the submitted benefits payload.

**Independent Test**: Navigate to `/additional-questions`, reach the Retirement section, answer "Yes" on the employer match question, enter `4` in the percentage input, submit the form â€” confirm the network request payload contains `retirementPlanHasMatch: true` and `retirementMatchPercentage: 4`. Then reload and answer "No" â€” confirm `retirementMatchPercentage` is absent from the payload.

### Implementation for User Story 1

- [x] T003 [P] [US1] Update `src/utils/finchAssessmentPayload.ts` â€” add two new parameters `retirementPlanHasMatch: boolean` and `retirementMatchPercentage: string` after `benefitsEnrollmentMonth`; add `retirementPlanHasMatch` to the `benefits` block; conditionally add `retirementMatchPercentage: Number(retirementMatchPercentage)` to `benefits` only when `retirementPlanHasMatch` is `true`

- [x] T004 [US1] Update `retirementQuestions` array in `src/pages/additionalQuestions/AdditionalQuestions.tsx` â€” insert new entry after `retirement-vesting-period` and before `retirement-auto-enroll`: `{ id: "retirement-employer-match", question: "Does your retirement plan feature an employer match?", required: true, hasConditional: true, options: [{ id: "yes-match", label: "Yes" }, { id: "no-match", label: "No" }] }`

- [x] T005 [US1] Add `retirementMatchPercentage` state in `src/pages/additionalQuestions/AdditionalQuestions.tsx` â€” `const [retirementMatchPercentage, setRetirementMatchPercentage] = useState<string>("")` alongside the other dedicated dropdown state vars (`annualRaiseMonth`, `payrollProvider`, `benefitsEnrollmentMonth`)

- [x] T006 [US1] Update `retirementQuestions.map()` render block in `src/pages/additionalQuestions/AdditionalQuestions.tsx` â€” add a conditional branch: when `question.hasConditional && answers[question.id] === "yes-match"`, render a `<div className="ml-6 space-y-2 pt-2">` containing a `<Label>` ("How much? e.g. 3%"), a native `<input type="number" min="0" className="...">` bound to `retirementMatchPercentage` state, and the error display for `fieldErrors["retirementMatchPercentage"]`; also clear `retirementMatchPercentage` state when the user changes `retirement-employer-match` back to `no-match` (inline in `handleAnswerChange`)

- [x] T007 [US1] Update `handleSubmit` in `src/pages/additionalQuestions/AdditionalQuestions.tsx` â€” add two new required-field validations: (1) `if (!answers["retirement-employer-match"]) newErrors["retirement-employer-match"] = "Select an option"`, (2) `if (answers["retirement-employer-match"] === "yes-match" && !retirementMatchPercentage) newErrors["retirementMatchPercentage"] = "Please enter a percentage."`; update the `buildFinchAssessmentPayload(...)` call to pass `answers["retirement-employer-match"] === "yes-match"` and `retirementMatchPercentage` as the two new arguments

**Checkpoint âœ…**: User Story 1 complete â€” run `pnpm run type-check` (zero errors). Manual test: form renders new question in correct position, Yes reveals number input with validation, No hides input, submitted payload contains correct fields.

---

## Phase 4: Tests

**Purpose**: Update utility tests to cover the new payload fields

- [x] T008 [P] Update `tests/utils/finchAssessmentPayload.test.ts` â€” (a) update the existing "complete payload" `toMatchObject` assertion to include `retirementPlanHasMatch: true` and `retirementMatchPercentage: 4` in the `benefits` block (update the call to pass `true` and `"4"` as the two new arguments); (b) add test: with `retirementPlanHasMatch = true` and `retirementMatchPercentage = "3"`, expect `benefits.retirementPlanHasMatch` to be `true` and `benefits.retirementMatchPercentage` to equal `3` (a number); (c) add test: with `retirementPlanHasMatch = false`, expect `benefits.retirementMatchPercentage` to be `undefined` (stripped by `stripEmpty`)

---

## Phase 5: Polish & Verification

- [x] T009 Run `pnpm run type-check` â€” must pass with zero errors
- [x] T010 Run `pnpm test --run` â€” all test suites must pass

---

## Dependencies & Execution Order

```
T001 (baseline)
  â””â”€â”€ T002 (types â€” foundational, BLOCKS all below)
        â”œâ”€â”€ T003 [P] (utility â€” depends on T002)
        â”œâ”€â”€ T004 [P] (question data â€” depends on T002)
        â”œâ”€â”€ T005 [P] (state â€” depends on T002, parallel with T004)
        â”œâ”€â”€ T006 (conditional render â€” depends on T004 + T005)
        â”œâ”€â”€ T007 (validation + call site â€” depends on T003 + T005 + T006)
        â””â”€â”€ T008 [P] (tests â€” depends on T003, parallel with T004-T007)
              â””â”€â”€ T009 â†’ T010 (verification)
```

### Parallel Opportunities

- **T003 + T008**: `finchAssessmentPayload.ts` and its test file are independent of the form â€” can be worked in parallel with the form changes after T002.
- **T004 + T005**: Question data and state additions are in the same file but touch non-overlapping lines; can be committed together.
- **T006 â†’ T007**: Must be sequential (render before validation references the rendered input).

### Sequential Critical Path (single developer)

```
T001 â†’ T002 â†’ T003 â†’ T004 â†’ T005 â†’ T006 â†’ T007 â†’ T008 â†’ T009 â†’ T010
```

### Parallel Split (two developers)

```
Dev A: T001 â†’ T002 â†’ T003 â†’ T008 â†’ T009 â†’ T010
Dev B:              â†’ T004 â†’ T005 â†’ T006 â†’ T007
```

---

## Implementation Notes

- `retirementMatchPercentage` is stored as a plain `string` in component state (same as `annualRaiseMonth`) and converted to `number` via `Number()` inside the utility. This keeps the input `onChange` handler simple.
- When the user switches Yes â†’ No, `setRetirementMatchPercentage("")` must be called to prevent a stale percentage leaking into the payload on re-selection.
- The `stripEmpty` utility in `finchAssessmentPayload.ts` already handles omitting `undefined` and `null` values â€” so when `retirementPlanHasMatch` is `false`, simply omit the `retirementMatchPercentage` field from the object (don't set it to `null`).
- The `retirementQuestions` array currently has only plain RadioGroup questions. The map now needs a `hasConditional` branch â€” mirror the existing pattern used for `annual-raises` in `compensationQuestions`.
- The index offset in the retirement question labels (`{index + 3}`) will shift by 1 after the new question is inserted (from `+ 3` it becomes `+ 3` again because the new question is inside the array and indexed naturally). No label offset changes needed.
