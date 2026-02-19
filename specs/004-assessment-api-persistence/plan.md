# Implementation Plan: Assessment Data Persistence via API

**Branch**: `004-assessment-api-persistence` | **Date**: 2026-02-13 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-assessment-api-persistence/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Replace localStorage-based assessment data persistence with exclusive API-based restoration from GET /assessment endpoint. Fix three critical bugs: STRUCTURED_ARRAY first-write initialization, SINGLE_SELECT_DROPDOWN first-selection binding, and validation red-border handling for required fields. All four assessment tabs (WorkforceTab, CompensationTab, BenefitsTab, GoalsTab) will submit data via POST /assessment/{section} endpoints and restore previously filled data via GET /assessment on back navigation and page load. Technical approach: Refactor useAssessment hook to call GET /assessment instead of localStorage helpers, add loading states with spinners and disabled buttons during API calls, implement validation on Next click + field blur, handle POST/GET failures with inline errors and retry mechanisms, preserve all existing UI without modifications.

## Technical Context

**Language/Version**: TypeScript 5.9.3, React 19.2.0  
**Primary Dependencies**: React Router v7, Redux Toolkit 2.11.2, Axios 1.13.2, React Hook Form 7.71.1, Zod 4.3.5, Tailwind CSS 4.1.18  
**Storage**: Server-side storage via REST API (GET /assessment, POST /assessment/{section}), NO client-side storage (localStorage/sessionStorage explicitly prohibited for assessment data)  
**Testing**: Jest + React Testing Library (implied by constitution), pre-commit hooks with Husky + lint-staged for TypeScript and Prettier validation  
**Target Platform**: Web browsers (desktop, tablet, mobile), React SPA  
**Project Type**: Web frontend (single-page application)  
**Performance Goals**: Validation feedback <100ms (SC-006), API loading indicators for user feedback, maintain Core Web Vitals (LCP <2.5s per constitution)  
**Constraints**: Preserve existing UI/UX without modifications (FR-020, FR-021), maintain backward compatibility with existing API contract (FR-026), no localStorage/sessionStorage for assessment data (FR-002)  
**Scale/Scope**: 4 assessment tabs (workforce, compensation, benefits, goals), 6 field types requiring validation (STRUCTURED_ARRAY, TEXT_INPUT, SINGLE_SELECT_DROPDOWN, NUMERIC, NUMBER_INPUT, PARTICIPATION_RATES), 40 functional requirements across 6 categories

**IMPORTANT CLARIFICATION**: Validation triggers ONLY on Next button click (not on blur). When validation fails, display error messages in red text and show red borders on invalid input fields for the 6 specified field types.

## Tab Lifecycle & Data Flow

**For each tab (Workforce → Compensation → Benefits → Goals):**

### On Tab Mount/Activation
1. **Call Assessment API**: Immediately invoke GET /assessment to fetch previously saved data for that specific section
2. **Pre-fill Form Fields**: 
   - If data exists in response: Populate form fields with returned values
   - If no data exists: Show empty form fields for user to fill
3. **Loading State**: Display spinner and disable Back button while GET request is in progress

### On Next Button Click
1. **Validate Current Tab**: Run validation on all required fields in the current section
2. **Call Section API**: If validation passes, call the appropriate endpoint:
   - Workforce tab → POST /assessment/workforce
   - Compensation tab → POST /assessment/compensation
   - Benefits tab → POST /assessment/benefits
   - Goals tab → POST /assessment/goals
3. **Navigate on Success**: Move to next tab ONLY after successful save response
4. **Show Errors on Failure**: Display inline error messages if POST fails, with Retry option

### Critical UX Requirements
- **DO NOT disable Next button** while user is filling the form
- **DO NOT show blocking loader** during form input
- **ONLY disable buttons and show spinner** during actual API save operation (after Next clicked)
- **Keep form interactive** throughout data entry process
- **Preserve user input** if API call fails (no data loss)

### Data Restoration Scenarios
1. **Back Navigation**: User completes WorkforceTab → moves to CompensationTab → clicks Back → WorkforceTab re-mounts → GET /assessment called → workforce data restored
2. **Page Refresh**: User on BenefitsTab → refreshes page → Assessment page re-mounts → GET /assessment called → benefits data restored  
3. **Direct URL Access**: User navigates to /assessment/compensation directly → GET /assessment called → compensation data pre-filled if exists
4. **Tab Switching**: Any tab change triggers GET /assessment to ensure freshest data from server

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- ✅ **Principle I - Component-First Architecture**: Feature modifies existing components (useAssessment hook, tab components, DynamicQuestionRenderer) without introducing new architectural patterns. Components remain self-contained with clear TypeScript interfaces. No violation.

- ✅ **Principle II - User-Centric Design**: Specification includes 4 prioritized user stories (P1-P3) with clear acceptance criteria and independently testable scenarios. Each story delivers standalone value (data persistence, validation feedback, input reliability, completion flow). Follows Untitled UI with no design changes (FR-020). No violation.

- ✅ **Principle III - Test-Driven Development**: TDD discipline will be followed per constitution. Tests must be written BEFORE implementation for bug fixes (STRUCTURED_ARRAY initialization, SINGLE_SELECT_DROPDOWN binding, validation triggers). Integration tests required for POST/GET API flows and back navigation. No violation - enforced in implementation phase.

- ✅ **Principle IV - Type Safety & Code Quality**: TypeScript strict mode enabled, all API responses and form state must have explicit types. useAssessment hook return type already defined, will be extended for loading states. ESLint + Prettier enforced via pre-commit hooks. No `any` types permitted. No violation.

- ✅ **Principle V - Performance & Accessibility**: Performance target SC-006 (<100ms validation feedback) aligns with Core Web Vitals. Loading indicators (FR-027) provide accessibility feedback during async operations. Red borders and error messages (FR-012, FR-013) provide visual and semantic cues for validation. No UI changes preserve existing accessibility compliance. No violation.

- ✅ **Principle VI - State Management Discipline**: Refactoring useAssessment hook to eliminate localStorage aligns with constitution's "Server state MUST be managed via React Query (or similar)". Current implementation uses local state in hook, will add API state management for GET /assessment. Redux Toolkit already used for app-level state. Immutable state updates maintained. No violation.

**Gate Status**: ✅ **PASSED** - All constitution principles satisfied. No complexity justification required.

## Constitution Check Re-evaluation (Post-Design)

*Re-evaluated after Phase 1 design completion (data-model.md, contracts/, quickstart.md)*

- ✅ **Principle I - Component-First Architecture**: Design maintains component-first architecture. useAssessment hook remains self-contained with extended interface (isLoadingGet, apiError, retryGetAssessment). DynamicQuestionRenderer receives onBlur prop without breaking single responsibility. Tab components maintain clear separation. TypeScript types defined in data-model.md ensure strong contracts. **STILL COMPLIANT**.

- ✅ **Principle II - User-Centric Design**: API contracts (contracts/assessment-api.md) specify error responses with user-friendly messages. Loading states (spinners, disabled buttons) provide clear feedback. Inline errors preserve user context vs. disruptive modals. Retry mechanisms empower users to recover from failures. Design prioritizes user experience. **STILL COMPLIANT**.

- ✅ **Principle III - Test-Driven Development**: quickstart.md explicitly mandates TDD approach with test files listed before implementation. Each bug fix requires test first. Integration tests specified for navigation flows. Test plan provided in quickstart guide. **STILL COMPLIANT**.

- ✅ **Principle IV - Type Safety & Code Quality**: data-model.md provides comprehensive TypeScript interfaces (AssessmentData, FormState, APILoadingState, etc.). All API responses typed explicitly. No `any` types introduced. research.md implementation patterns show explicit type annotations. **STILL COMPLIANT**.

- ✅ **Principle V - Performance & Accessibility**: Design includes loading indicators (FR-027) for async feedback, maintaining accessibility. Error messages use existing ErrorMessage component (semantic). Red borders provide visual cues (FR-012-FR-013). API call optimization (disable buttons during load) prevents race conditions. No performance regressions. **STILL COMPLIANT**.

- ✅ **Principle VI - State Management Discipline**: Design eliminates localStorage (client-side cache) in favor of server state via GET /assessment. State mutations remain immutable (spread operators in research.md examples). Loading states clearly managed in useAssessment hook. No Redux changes needed, maintains existing patterns. **STILL COMPLIANT**.

**Post-Design Gate Status**: ✅ **PASSED** - All constitution principles remain satisfied after design phase. No new violations introduced. Design patterns align with established conventions. Ready for implementation.

## Project Structure

### Documentation (this feature)

```text
specs/004-assessment-api-persistence/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── assessment-api.md  # GET /assessment and POST /assessment/{section} contracts
├── checklists/
│   └── requirements.md  # Already created - quality validation checklist
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── hooks/
│   └── useAssessment.ts          # PRIMARY: Refactor to use API instead of localStorage
├── components/
│   └── assessment/
│       ├── DynamicQuestionRenderer.tsx   # Fix STRUCTURED_ARRAY first write
│       ├── WorkforceTab.tsx             # Add loading states, validation on blur
│       ├── CompensationTab.tsx          # Add loading states, validation on blur  
│       ├── BenefitsTab.tsx              # Add loading states, validation on blur
│       └── GoalsTab.tsx                 # Add loading states, validation on blur
├── services/
│   └── api/
│       └── assessmentApi.ts             # Extend with getAssessment() function
├── pages/
│   └── assessmentWorkforce/
│       └── AssessmentWorkforce.tsx      # Add GET /assessment on page load
└── utils/
    └── assessmentStorage.ts             # DEPRECATE: No longer used for data restoration

tests/
├── hooks/
│   └── useAssessment.test.ts            # TDD: Tests for API integration
├── components/
│   └── assessment/
│       ├── DynamicQuestionRenderer.test.tsx    # TDD: STRUCTURED_ARRAY bug fix
│       ├── WorkforceTab.test.tsx              # TDD: Validation trigger tests
│       └── [other tab tests]
└── integration/
    └── assessment-navigation.test.ts          # TDD: Back button + GET /assessment flow
```

**Structure Decision**: Web frontend (single-page React application). This feature modifies existing assessment components and hooks within established src/ structure. No new directories required. Tests follow TDD with colocated test files per constitution. Eight files in scope (per spec): useAssessment.ts, 4 tab components, DynamicQuestionRenderer.tsx, DynamicTab.tsx, assessmentStorage.ts (read-only/bypass). Primary changes in useAssessment hook to replace localStorage with API calls.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**Status**: No violations - this section intentionally left empty. All constitution principles are satisfied without requiring complexity justifications.
