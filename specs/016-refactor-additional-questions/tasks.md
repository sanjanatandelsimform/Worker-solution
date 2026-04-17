# Tasks: Refactor Additional Questions Module

**Input**: Design documents from `/specs/016-refactor-additional-questions/`  
**Branch**: `016-refactor-additional-questions`  
**Prerequisites**: plan.md âœ… | spec.md âœ… | research.md âœ… | data-model.md âœ… | quickstart.md âœ…

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- No new npm dependencies â€” all imports come from existing codebase

---

## Phase 1: Setup

**Purpose**: Establish a verified baseline before any code changes. Any pre-existing failures must be documented, not introduced.

- [x] T001 Run baseline type-check (`pnpm run type-check`) and full test suite (`pnpm test --run`); record pass/fail counts as the baseline for final verification

---

## Phase 2: Foundational (Blocking Prerequisite)

**Purpose**: The shared TypeScript types file is consumed by every section component and primitive. It must exist before any other new file can be created.

**âš ï¸ CRITICAL**: All phases beyond Phase 2 depend on this file.

- [x] T002 Create `src/types/additionalQuestionsTypes.ts` exporting `QuestionAnswer`, `GoalsAnswer`, `QuestionOption`, `QuestionTooltip`, `QuestionDefinition` interfaces (see data-model.md Â§1)

**Checkpoint**: `pnpm run type-check` â€” zero errors before proceeding.

---

## Phase 3: User Story 3 â€” Shared UI Primitives (Priority: P3)

**Goal**: Eliminate duplicated JSX patterns by creating three small shared primitives in `src/components/common/`. These are a technical prerequisite for section components in Phase 4.

**Independent Test**: Verify the three new files exist, export the correct named symbols, TypeScript compiles them with zero errors, and the inline-error render pattern is used from a single source.

- [x] T003 [P] [US3] Create `src/components/common/FieldError.tsx` â€” named export `FieldError`; accepts `{ message: string | undefined }`; returns `null` when message is falsy; renders `<InputInfo className="text-ws-error-600"> + <span className="text-sm text-ws-error-600">{message}</span>` inside `<div className="flex items-center gap-2">` (see data-model.md Â§2 and quickstart.md Phase 2)
- [x] T004 [US3] Create `src/components/common/QuestionRadioGroup.tsx` â€” named export `QuestionRadioGroup`; props: `{ question: QuestionDefinition; displayIndex: number; value: string; onChange: (questionId: string, value: string) => void; error?: string }`; renders numbered `<Label>` + `<FieldError message={error}>` + `<RadioGroup>` with mapped `<RadioButton>` per option (depends on T002, T003)
- [x] T005 [US3] Create `src/components/common/QuestionCheckboxGroup.tsx` â€” named export `QuestionCheckboxGroup`; props: `{ question: QuestionDefinition; displayIndex: number; selectedValues: string[]; onToggle: (questionId: string, optionId: string) => void; error?: string }`; renders numbered `<Label>` + `<FieldError message={error}>` + stacked `<Checkbox>` + label rows (depends on T002, T003)

**Checkpoint**: `pnpm run type-check` â€” zero new errors.

---

## Phase 4: User Story 2 â€” Section Components (Priority: P2)

**Goal**: Four isolated section components, each owning its own question-data arrays. A developer can open any one file and understand exactly which questions belong to that section without reading any other file.

**Independent Test**: Confirm each section file contains only its own question data array(s) and renders only its section's card. Opening `BenefitsRetirementSection.tsx` should show `retirementQuestions` defined within that file â€” no compensation or workforce data present.

- [x] T006 [P] [US2] Create `src/data/monthOptions.ts` exporting `monthOptions` array (12 month objects `{ id, label }`) so it can be shared between CompensationSection and BenefitsRetirementSection without duplication
- [x] T007 [P] [US2] Create `src/pages/additionalQuestions/WorkforceSection.tsx` â€” default export `WorkforceSection`; define module-level `questions` const (the 4 workforce question definitions: benefits-updates, deskless-employees, commute-methods, commute-duration); props: `{ answers, fieldErrors, onAnswerChange, onMultiSelectToggle }`; render "Workforce" card using `QuestionRadioGroup` for radio questions and `QuestionCheckboxGroup` for multi-select questions (depends on T002, T004, T005)
- [x] T008 [P] [US2] Create `src/pages/additionalQuestions/CompensationSection.tsx` â€” default export `CompensationSection`; define module-level `compensationQuestions` const; import `monthOptions` from `@/data/monthOptions`; props: `{ answers, fieldErrors, annualRaiseMonth, payrollProvider, onAnswerChange, onMultiSelectToggle, onAnnualRaiseMonthChange, onPayrollProviderChange, onClearFieldError }`; render "Compensation" card with conditional annual-raise month `<Select>` and payroll-provider `<Select>` (depends on T002, T004, T005, T006)
- [x] T009 [P] [US2] Create `src/pages/additionalQuestions/BenefitsRetirementSection.tsx` â€” default export `BenefitsRetirementSection`; define module-level `benefitsQuestions` and `retirementQuestions` consts; import `monthOptions` from `@/data/monthOptions`; props: `{ answers, fieldErrors, benefitsEnrollmentMonth, retirementMatchPercentage, onAnswerChange, onBenefitsEnrollmentMonthChange, onRetirementMatchPercentageChange, onClearFieldError }`; render combined "Benefits" card including Retirement sub-section with the conditional employer-match percentage number input (with `min="0"`, `max="100"`, `onWheel` blur, no-spinner classes) (depends on T002, T004, T006)
- [x] T010 [P] [US2] Create `src/pages/additionalQuestions/GoalsSection.tsx` â€” default export `GoalsSection`; import `goalsData` from `@/data/goalsData`; props: `{ goalsAnswers, fieldErrors, onGoalToggle, onTopThreeGoalsChange }`; render "Goals" card with category checkboxes and `<RankingList>` (depends on T002)

**Checkpoint**: `pnpm run type-check` â€” zero errors. Section files exist and compile; not yet wired into parent.

---

## Phase 5: User Story 1 â€” Slim the Orchestrator & Integration (Priority: P1)

**Goal**: Prove that the refactor produces zero user-observable regression. The parent `AdditionalQuestions.tsx` is trimmed to ~150 lines by replacing the four JSX section blocks with section component calls â€” while all state, hooks, validation, and handlers are preserved unchanged.

**Independent Test**: Load the application at `/additional-questions`. Submit with empty fields and confirm all validation errors appear. Select "Yes" to annual raises and verify month dropdown appears. Select "Yes" to employer match and verify percentage input appears. Enter 101% and verify "Percentage must be 100 or less." error. Complete all fields and submit; confirm navigation to `/dashboard`.

- [x] T011 [US1] Add `handleClearFieldError` helper to `AdditionalQuestions.tsx` â€” `const handleClearFieldError = (key: string) => setFieldErrors(prev => ({ ...prev, [key]: "" }));` â€” replaces the inline `setFieldErrors` calls that were previously inside the section JSX
- [x] T012 [US1] Replace the Workforce JSX block in `AdditionalQuestions.tsx` return statement with `<WorkforceSection answers={answers} fieldErrors={fieldErrors} onAnswerChange={handleAnswerChange} onMultiSelectToggle={handleMultiSelectToggle} />` (depends on T007, T011)
- [x] T013 [US1] Replace the Compensation JSX block in `AdditionalQuestions.tsx` return statement with `<CompensationSection>` call passing all required props including `annualRaiseMonth`, `payrollProvider`, `onAnnualRaiseMonthChange`, `onPayrollProviderChange`, `onClearFieldError` (depends on T008, T011)
- [x] T014 [US1] Replace the Benefits+Retirement JSX block in `AdditionalQuestions.tsx` return statement with `<BenefitsRetirementSection>` call passing all required props including `benefitsEnrollmentMonth`, `retirementMatchPercentage`, `onBenefitsEnrollmentMonthChange`, `onRetirementMatchPercentageChange`, `onClearFieldError` (depends on T009, T011)
- [x] T015 [US1] Replace the Goals JSX block in `AdditionalQuestions.tsx` return statement with `<GoalsSection goalsAnswers={goalsAnswers} fieldErrors={fieldErrors} onGoalToggle={handleGoalToggle} onTopThreeGoalsChange={value => setGoalsAnswers(prev => ({ ...prev, topThreeGoals: value }))} />` (depends on T010, T011)
- [x] T016 [US1] Update imports in `AdditionalQuestions.tsx`: add imports for all 4 section components; add `QuestionAnswer` and `GoalsAnswer` from `@/types/additionalQuestionsTypes`; remove the now-unused inline `interface QuestionAnswer` and `interface GoalsAnswer` definitions; remove any base component imports (`RadioGroup`, `RadioButton`, `Checkbox`, `Label`, `InputInfo`) no longer used directly in the parent file
- [x] T017 [P] [US1] Create `src/pages/additionalQuestions/index.ts` barrel exporting `export { default } from "./AdditionalQuestions"` (can run in parallel with T011â€“T016)

**Checkpoint**: `pnpm run type-check` â€” zero errors. `pnpm test --run` â€” all suites pass.

---

## Final Phase: Polish & Verification

**Purpose**: Confirm the full quality gate passes and line-count success criterion is met.

- [x] T018 Run `pnpm run type-check` â€” must report zero errors
- [x] T019 Run `pnpm lint:fix` then `pnpm format` â€” auto-fix any lint/formatting issues introduced
- [ ] T020 Run `pnpm test --run` â€” all test suites must pass (same count as T001 baseline)
- [ ] T021 Verify `AdditionalQuestions.tsx` line count is â‰¤ 200 lines (SC-001: â‰¥60% reduction from ~930 baseline)

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup)
  â””â”€â–º Phase 2 (Types file â€” blocks everything)
        â””â”€â–º Phase 3 (Primitives) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
              â””â”€â–º Phase 4 (Section Components)             â”‚
                    â””â”€â–º Phase 5 (Orchestrator Integration) â”‚
                          â””â”€â–º Final Phase (Verification)   â”‚
                                                           â”‚
              T003 independent â—„â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
              T004, T005 depend on T003
```

### User Story Dependencies

- **US3 (P3)** â€” Shared primitives: independent; no dependency on other stories
- **US2 (P2)** â€” Section components: depends on US3 primitives being complete (T004, T005)
- **US1 (P1)** â€” Orchestrator slim: depends on US2 sections being complete (T007â€“T010)

> **Note**: The priority ordering (P1 > P2 > P3) reflects _user value priority_. The implementation order is reversed (US3 first, US1 last) because each layer is a prerequisite for the next. All three stories are delivered in a single PR.

### Parallel Opportunities Per Phase

**Phase 3 (US3)**:

- T003 runs in parallel with T002 (different files, no mutual dependency)
- T004 and T005 can run in parallel with each other after T002 + T003 complete

**Phase 4 (US2)**:

- T006, T007, T008, T009, T010 can all run in parallel (all different files, all depend on T002â€“T005)

**Phase 5 (US1)**:

- T012, T013, T014, T015 can run in parallel (each replaces a different JSX block, different section import)
- T016 runs after T012â€“T015 (cleans up all imports at once)
- T017 runs in parallel with T011â€“T016 (separate file)

---

## Parallel Execution Example: Phase 4 (US2)

```
Agent A: T006 â†’ create src/data/monthOptions.ts
Agent B: T007 â†’ create WorkforceSection.tsx
Agent C: T008 â†’ create CompensationSection.tsx
Agent D: T009 â†’ create BenefitsRetirementSection.tsx
Agent E: T010 â†’ create GoalsSection.tsx

(All start simultaneously after T002â€“T005 complete)
(Merge: run pnpm run type-check before Phase 5)
```

---

## Implementation Strategy

**MVP scope (P1 only)**: Technically, all three stories must be implemented together because section components are prerequisites for the orchestrator slim. The minimum deliverable is all phases completed â€” but the output (a working, refactored page) delivers US1 as the primary value.

**Suggested execution for a single agent**:

1. T001 â†’ T002 â†’ T003 (foundation)
2. T004 + T005 (primitives depend on T002+T003)
3. T006 â†’ T007 â†’ T008 â†’ T009 â†’ T010 (sections â€” can batch)
4. T011 â†’ T012 â†’ T013 â†’ T014 â†’ T015 â†’ T016 â†’ T017 (orchestrator)
5. T018 â†’ T019 â†’ T020 â†’ T021 (quality gate)
