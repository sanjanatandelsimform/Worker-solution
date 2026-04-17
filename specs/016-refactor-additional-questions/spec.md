# Feature Specification: Refactor Additional Questions Module

**Feature Branch**: `016-refactor-additional-questions`  
**Created**: 2026-04-17  
**Status**: Draft  
**Input**: User description: "Refactor this Additional Questions Module. Make multiple re-usable or Simple components, and break down this module into smaller modules to reduce the complexity. NOTE: MAKE SURE THE CURRENT FUNCTIONALITY DOES NOT CHANGE OR BREAK"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - End User Completes Assessment Unchanged (Priority: P1)

An end user fills out the Additional Questions form (Workforce, Compensation, Benefits, Retirement, Goals sections), submits it, and is navigated to the dashboard. All validation messages, conditional fields, and submission behaviour must behave identically to the pre-refactor version.

**Why this priority**: The refactor delivers zero user-visible change. If the user experience regresses in any way the refactor has failed its primary constraint.

**Independent Test**: Can be fully tested by loading `/additional-questions`, completing all required fields including conditional sub-fields (annual raise month, payroll provider, benefits enrollment month, employer match percentage), submitting, and confirming navigation to `/dashboard`.

**Acceptance Scenarios**:

1. **Given** the form is loaded, **When** required fields are left empty and the user clicks "Next", **Then** inline error messages appear for every unanswered required field — identical to pre-refactor behaviour.
2. **Given** the user selects "Yes" for annual raises, **When** they view the compensation section, **Then** a month dropdown appears beneath that question — identical to pre-refactor behaviour.
3. **Given** the user selects "Yes" for employer match, **When** they view the retirement section, **Then** a percentage number input appears beneath that question — identical to pre-refactor behaviour.
4. **Given** all required fields are completed, **When** the user clicks "Next", **Then** the assessment payload is submitted and the user is navigated to `/dashboard` — identical to pre-refactor behaviour.
5. **Given** a percentage greater than 100 is entered for employer match, **When** the user clicks "Next", **Then** an error "Percentage must be 100 or less." is displayed — identical to pre-refactor behaviour.

---

### User Story 2 - Developer Navigates Codebase Independently per Section (Priority: P2)

A developer who needs to add, remove, or modify questions in one section (e.g., Retirement) can open a single focused file and make the change without reading or touching code for other sections.

**Why this priority**: This is the primary maintainability goal of the refactor. Isolated section files reduce the cognitive load and risk of accidental regressions in unrelated sections.

**Independent Test**: Can be tested by locating the file responsible for the Retirement sub-section alone and confirming it contains only retirement-specific questions, rendering and state needs — no compensation or workforce concerns mixed in.

**Acceptance Scenarios**:

1. **Given** the module is refactored, **When** a developer opens the Workforce section file, **Then** it contains only workforce question data and rendering — no compensation, benefits, or goals concerns.
2. **Given** the module is refactored, **When** a developer opens the Benefits/Retirement section file, **Then** it contains the retirement employer-match conditional input logic in one isolated location.

---

### User Story 3 - Developer Reuses Question UI Primitives (Priority: P3)

A developer adding a new question to any section can reuse the same shared radio-group, checkbox-group, and inline-error primitives already used by existing questions — without duplicating markup.

**Why this priority**: Eliminates copy-paste duplication across sections. Currently the same radio-group + error-message pattern is repeated four times in the file.

**Independent Test**: Can be tested by confirming that a shared `QuestionRadioGroup` (or equivalent) component is used by at least the Workforce and Retirement sections for their radio-input questions.

**Acceptance Scenarios**:

1. **Given** the module is refactored, **When** a developer adds a new Yes/No question to any section, **Then** they can render it by passing data to the shared radio-group component without writing new JSX markup.
2. **Given** the module is refactored, **When** inline error rendering is needed for a field, **Then** a single shared error-display primitive is used rather than duplicated `<div>` + icon + `<span>` markup.

---

### Edge Cases

- Conditional inputs (annual raise month, employer match percentage) are tightly coupled to their parent question answer — the refactored components must preserve this coupling correctly.
- The `retirementMatchPercentage` state is cleared by `handleAnswerChange` when the employer-match question switches to "No" — this cross-section state interaction must remain intact after refactoring.
- The Goals section uses a separate `goalsAnswers` state shape distinct from the generic `answers` map — the refactored Goals component must not merge or conflict with the generic answers state.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The module entry point (`AdditionalQuestions.tsx`) MUST remain at the same file path and export — no routing changes.
- **FR-002**: The module MUST be decomposed into at least four section-level components: one each for Workforce, Compensation, Benefits+Retirement, and Goals.
- **FR-003**: Repeated rendering patterns — radio-group question, checkbox-group question — MUST be extracted into shared reusable components consumable by all sections.
- **FR-004**: Inline field error display (icon + message) MUST be extracted into a single shared primitive reused by all question components.
- **FR-005**: Each section component MUST receive only the state and callbacks it needs via props — no section may access state it does not use.
- **FR-006**: Question data arrays (`questions`, `compensationQuestions`, `monthOptions`, `benefitsQuestions`, `retirementQuestions`) MUST be co-located with their respective section or in a dedicated data file — not left as a single mixed module-level dump.
- **FR-007**: All existing form validation rules MUST be preserved exactly: required-field checks, conditional required checks (annual raise month, employer match percentage), max-100 check on percentage.
- **FR-008**: All existing conditional-render rules MUST be preserved exactly: annual raise month dropdown shown iff "Yes" to annual raises; employer match percentage input shown iff "Yes" to employer match.
- **FR-009**: No new dependencies may be introduced to achieve the decomposition.
- **FR-010**: The main `AdditionalQuestions` component MUST retain ownership of all shared state (`answers`, `goalsAnswers`, `annualRaiseMonth`, `payrollProvider`, `benefitsEnrollmentMonth`, `retirementMatchPercentage`, `fieldErrors`) and pass them down to section components.

### Key Entities

- **Section component**: A self-contained component that renders one logical group of questions (Workforce, Compensation, Benefits+Retirement, or Goals). Receives shared state slices and callbacks as props.
- **Question primitive**: A small shared component that renders a single question (radio, checkbox, or dropdown) with its label, required marker, and inline error — reusable across all sections.
- **Inline error primitive**: A tiny shared component that renders the icon + error-message combination currently duplicated throughout the file.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: The main `AdditionalQuestions.tsx` file is reduced by at least 60% in line count compared to the pre-refactor baseline.
- **SC-002**: All existing automated tests pass without modification after the refactor.
- **SC-003**: No end-user-observable behaviour changes — every validation message, conditional field, and navigation outcome remains identical.
- **SC-004**: Each section component file can be understood in isolation in under 5 minutes by a developer unfamiliar with the codebase.
- **SC-005**: The radio-group question rendering pattern is implemented exactly once (in a shared component) and reused by all sections that need it — zero duplication.
