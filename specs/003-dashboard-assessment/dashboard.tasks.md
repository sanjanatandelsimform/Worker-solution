# Tasks: Dashboard Assessment Module

**Branch**: `003-dashboard-assessment`  
**Input**: [dashboard.spec.md](dashboard.spec.md), [dashboard.plan.md](dashboard.plan.md)  
**Scope**: Frontend implementation only (Backend APIs available)

---

## 📊 Implementation Progress Summary

**Last Updated**: 2026-02-07

### ✅ Completed Phases
- **Phase 0: Research & Design (100%)** - All research tasks completed
- **Phase 1: Foundation (100%)** - All 8 foundation tasks completed and type-checked
  - Type definitions, validation schemas, storage layer, API layer, custom hooks
  - Files created: 10 new files
  - Type check: ✅ PASSED (zero errors)
  - Build check: ✅ PASSED (zero errors)
  - Lint check: ✅ PASSED (warnings resolved)
  - Design: ✅ FIXED (white card background, proper spacing, section headers)
  - React Keys: ✅ FIXED (all opt.id → opt.value, no console warnings)
  - **Next Button Integration: ✅ COMPLETED**
    - Validation trigger on click
    - API submission on success
    - Success/Error modals integrated
    - Loading states implemented
    - Scroll to first error on validation failure
  - **Type Safety: ✅ COMPLETED**
    - All `any` types replaced with proper TypeScript types
    - SelectItemType compatibility fixed
    - Promise types corrected
    - Zod schema validation fixed
    - Input component props validated

### ✅ Validation & API Integration Status
- **Validation Layer**: ✅ IMPLEMENTED & INTEGRATED
  - Zod schemas created for all 4 sections (workforce, compensation, benefits, goals)
  - Custom validators: percentage sum validation (hourly + salary = 100%)
  - Conditional field validation (e.g., commuteTime when commuteMoreThan15Miles=true)
  - Array validation (min/max items for STRUCTURED_ARRAY)
  - Field-level validation in DynamicTab.validateAnswers()
  - Real-time error display in DynamicQuestionRenderer
  - **✅ Next button triggers validation before API call**
  - **✅ Scroll to first error on validation failure**
  - **✅ Client-side min/max validation for numeric fields**
  
- **API Integration**: ✅ IMPLEMENTED & INTEGRATED
  - API service created: `src/services/api/assessmentApi.ts`
  - All 4 section endpoints configured:
    - POST `/api/assessment/workforce`
    - POST `/api/assessment/compensation`
    - POST `/api/assessment/benefits`
    - POST `/api/assessment/goals`
  - POST `/api/assessment/feedback` endpoint ready
  - Auth token injection via request interceptor
  - Error handling via response interceptor
  - 10s timeout configured
  - ApiResponse type-safe interface
  - **✅ submitSection() called from Next button after validation**
  - **✅ Success/Error modals display based on API response**
  - **✅ Token refresh interceptor with queue management**
  - **✅ Proper axios instance configuration**
  
- **State Management**: ✅ IMPLEMENTED & INTEGRATED
  - `useAssessment` hook with auto-save (500ms debounce)
  - `submitSection()` function integrated with Next button
  - `updateAnswer()` with localStorage persistence
  - `loadProgress()` restores saved data on mount
  - Tab completion tracking via `markTabCompleted()`
  - Error state management with `setErrors()`
  - **✅ isSubmitting state prevents duplicate submissions**
  - **✅ Loading indicator on button during API call**

### 🎯 Recent Fixes (Phase 1 Completion)
- ✅ **Build Errors Resolved**:
  - Fixed DynamicQuestionRenderer SelectItemType compatibility
  - Removed unsupported min/max props from Input component
  - Added client-side validation for numeric fields with helper text
  - Fixed authApi missing axios import and API_TIMEOUT constant
  - Restored all existing authApi functions (forgotPassword, resetPassword, verifyEmail, signout with token)
  - Fixed signin response type to match existing interface
  - Added setTokens utility function

- ✅ **Type Safety Improvements**:
  - Replaced all `any` types with `unknown` in assessmentApi
  - Fixed Promise queue types in token refresh interceptor
  - Updated Zod schema error messages (removed invalid_type_error)
  - Fixed questionTypes metadata to use `Record<string, unknown>`
  - Added proper type casting for question arrays from JSON

- ✅ **Component Fixes**:
  - String type assertions for all value props (RadioGroup, Input, Select)
  - Array type checks for currentAnswer before using array methods
  - Proper handling of empty/null values with String() conversion
  - Fixed PARTICIPATION_RATES rendering with proper type casting

### 🎯 Next Button Implementation Details

**Component**: `src/components/assessment/DynamicTab.tsx`

**Flow**:
1. ✅ User clicks "Next" button (or "Submit" on Goals tab)
2. ✅ `handleNext()` triggers `validateAnswers()`
3. ✅ If validation fails:
   - Display inline error messages (red text)
   - Scroll to first error field
   - **DO NOT** call API
4. ✅ If validation passes:
   - Call `submitSection()` API
   - Show loading spinner on button
   - Disable button during submission
5. ✅ On API success:
   - Show success modal ("You're done!")
   - Mark tab as completed
   - Navigate to next tab (or dashboard if Goals)
6. ✅ On API error:
   - Show error modal with message
   - Options: "Cancel" (stay) or "Continue" (proceed anyway)

**Features Implemented**:
- ✅ Button text: "Next" for first 3 tabs, "Submit" for Goals tab
- ✅ Loading state: `isLoading={isSubmitting}` with spinner
- ✅ Disabled state: `isDisabled={isSubmitting || isSaving}`
- ✅ Success modal: BaseModalWithIcon with CircleCheckIcon
- ✅ Error modal: BaseModalWithIcon with X icon
- ✅ Scroll to error: `element?.scrollIntoView({ behavior: "smooth" })`
- ✅ Data attribute: `data-question-key={question.key}` for targeting

**Code Added**:
- 3 new state variables (showSuccessModal, showErrorModal, errorMessage)
- handleNext() async function (30 lines)
- handleSuccessModalContinue() callback
- handleErrorModalContinue() callback
- handleErrorModalCancel() callback
- Next button JSX with loading/disabled states
- 2 modal components (Success and Error)

### 🚧 In Progress
- Phase 2: User Story 1 - Assessment Initiation (Ready to integrate with AssessmentWorkforce page)
- Tab navigation and routing setup
- Integration with AssessmentWorkforce page

### 📋 Next Steps
1. Complete Phase 2: User Story 1
   - Integrate DynamicTab components with AssessmentWorkforce page
   - Set up tab routing with query parameters
   - Implement TabNavigation component with lock/unlock logic
2. Begin Phase 3: User Story 2
   - Test complete WorkforceTab submission flow
   - Verify API integration end-to-end
3. Continue sequential implementation through Phase 8

### 📦 Artifacts Created

**Types & Interfaces** (1 file)
- `src/types/questionTypes.ts` - Complete type definitions for question.json structure

**Validation** (1 file)
- `src/services/validation/assessmentSchemas.ts` - Zod schemas for all 4 sections

**Storage** (1 file)
- `src/utils/assessmentStorage.ts` - localStorage persistence with auto-save

**API** (2 files)
- `src/services/api/assessmentApi.ts` - API endpoints for all 4 sections + feedback
- `src/services/api/authApi.ts` - Updated with all existing functions restored

**Hooks** (1 file)
- `src/hooks/useAssessment.ts` - State management + navigation hooks

**Components** (6 files)
- `src/components/assessment/DynamicQuestionRenderer.tsx` - Renders 11 question types
- `src/components/assessment/DynamicTab.tsx` - Main tab component with validation
- `src/pages/assessmentWorkforce/WorkforceTab.tsx` - Workforce wrapper
- `src/pages/assessmentWorkforce/CompensationTab.tsx` - Compensation wrapper
- `src/pages/assessmentWorkforce/BenefitsTab.tsx` - Benefits wrapper
- `src/pages/assessmentWorkforce/GoalsTab.tsx` - Goals wrapper

**Total**: 11 files created/updated, 0 build errors, 0 type errors

---

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4, US5)
- Include exact file paths in descriptions

---

## Phase 0: Research & Design (1-2 days) ✅ COMPLETED

**Purpose**: Understand existing patterns, parse JSON, design components

- [x] D001 Review Auth module storage implementation: Read `src/services/storage/` and `src/hooks/useAuth.ts` to understand storage pattern
- [x] D002 [P] Review Profile Settings auto-save pattern: Analyze field change handlers in `src/pages/settings/` for auto-save implementation
- [x] D003 [P] Analyze BaseModalWithIcon component: Review props interface in `src/components/modals/BaseModalWithIcon.tsx`
- [x] D004 [P] Analyze GetInTouchModal component: Review props interface in `src/components/modals/GetInTouchModal.tsx`
- [x] D005 [P] Review Recommendations component: Check current design in `src/components/dashboard/RecommendationsSection.tsx` or similar
- [x] D006 [P] Review Benchmark component: Check current design in `src/components/dashboard/BenchmarkSection.tsx` or similar
- [x] D007 Parse assessmentFields.json: Create mapping table (field type → React component)
- [x] D008 Design tab state machine: Document tab progression logic (Workforce → Compensation → Benefits → Goals)
- [x] D009 Design validation strategy: Create validation rules matrix per tab (required fields, percentages, nested objects)
- [x] D010 Create component hierarchy diagram: Document component relationships and data flow

**Deliverables**: ✅ Storage pattern docs, field mapping table, state machine diagram, validation matrix

---

## Phase 1: Foundation (2-3 days) ⚠️ BLOCKING ✅ COMPLETED

**Purpose**: Core infrastructure that ALL user stories depend on

**Status**: ✅ COMPLETED - All foundation components implemented, type-checked, and built successfully

### Type Definitions

- [x] F001 Create `src/types/questionTypes.ts` with interfaces: ✅ COMPLETED
  - [x] F001a Complete TypeScript interfaces for Question, ValidationRules, Section structures
  - [x] F001b QuestionField, ConditionalQuestion, OptionGroup interfaces
  - [x] F001c AssessmentData interface for question.json structure
  - [x] F001d Exported types: `Question`, `Section`, `AssessmentData`, `ValidationRules`
  - [x] F001e Support for all 11 question types (SINGLE_SELECT, MULTIPLE_CHOICE, YES_NO, STRUCTURED_ARRAY, NUMERIC, NUMBER_INPUT, TEXT_INPUT, PARTICIPATION_RATES, RANKING, etc.)
  - [x] F001f Fixed metadata type to use `Record<string, unknown>`

- [x] F002 [P] Dynamic component created: ✅ COMPLETED
  - [x] F002a `src/components/assessment/DynamicQuestionRenderer.tsx` - Renders all question types dynamically
  - [x] F002b `src/components/assessment/DynamicTab.tsx` - Main tab component with validation integration
  - [x] F002c 4 tab wrappers created: WorkforceTab, CompensationTab, BenefitsTab, GoalsTab
  - [x] F002d Fixed SelectItemType compatibility with proper label handling
  - [x] F002e String type assertions for all value props
  - [x] F002f Fixed PARTICIPATION_RATES rendering with proper type casting

### Validation Schemas

- [x] F003 Create `src/services/validation/assessmentSchemas.ts` with Zod schemas: ✅ COMPLETED
  - [x] F003a `workforceSchema` - Validates all 15 Workforce fields with required/optional rules
  - [x] F003b Custom validator for percentages: `hourlyEmployeesPercentage + salaryEmployeesPercentage === 100%`
  - [x] F003c `compensationSchema` - Validates all 8 Compensation fields
  - [x] F003d `benefitsSchema` - Validates all 21 Benefits fields with conditional logic
  - [x] F003e `goalsSchema` - Validates Goals fields with min/max array constraints
  - [x] F003f Exported type-safe interfaces: `WorkforceFormData`, `CompensationFormData`, `BenefitsFormData`, `GoalsFormData`
  - [x] F003g Conditional required field validation (e.g., commuteTime when commuteMoreThan15Miles=true)
  - [x] F003h Array validation (min/max items for STRUCTURED_ARRAY fields)
  - [x] F003i Fixed Zod error messages (replaced invalid_type_error with message)
  - ✅ **Status**: All schemas implemented and exported
  - ✅ **Integration**: DynamicTab.validateAnswers() uses question.json validation rules
  - ✅ **Error Display**: Real-time inline errors in DynamicQuestionRenderer

### Storage Layer

- [x] F004 Create `src/utils/assessmentStorage.ts` using existing Auth/Profile pattern: ✅ COMPLETED
  - [x] F004a `loadAssessmentProgress(): AssessmentProgress` - Read full progress from localStorage
  - [x] F004b `saveAssessmentProgress(section, data)` - Write section data to localStorage
  - [x] F004c `markTabCompleted(tabName)` - Mark tab as complete and increment counter
  - [x] F004d `loadCompletionStatus(): AssessmentCompletion` - Get completion status with count
  - [x] F004e `clearAssessmentProgress()` - Reset all assessment data (for logout/restart)
  - [x] F004f `getCompletionPercentage(): number` - Calculate 0-100% completion
  - [x] F004g `autoSaveProgress(section, data, delay=500ms)` - Debounced auto-save function
  - [x] F004h `saveCurrentStep(step)` / `loadCurrentStep()` - Persist navigation state
  - [x] F004i `isTabCompleted(tabName): boolean` - Check individual tab completion
  - [x] F004j `isAssessmentComplete(): boolean` - Check if all 4 tabs completed
  - [x] F004k Fixed type definitions with proper `Record<string, unknown>` types

### API Layer

- [x] F005 Create `src/services/api/assessmentApi.ts`: ✅ COMPLETED
  - [x] F005a Axios client configured (timeout: 10s, JSON headers)
  - [x] F005b `submitWorkforce(responses)` → POST `/api/assessment/workforce`
  - [x] F005c `submitCompensation(responses)` → POST `/api/assessment/compensation`
  - [x] F005d `submitBenefits(responses)` → POST `/api/assessment/benefits`
  - [x] F005e `submitGoals(responses)` → POST `/api/assessment/goals`
  - [x] F005f Request interceptor: Injects `Authorization: Bearer ${token}` from localStorage
  - [x] F005g Response interceptor: Unified error handling for network/timeout/server errors
  - [x] F005h `getAssessmentStatus()` - Get backend completion status
  - [x] F005i Exported `ApiResponse` interface with success/error fields
  - [x] F005j Fixed token refresh interceptor with proper Promise types
  - [x] F005k Replaced all `any` types with `unknown` for type safety
  - ✅ **Status**: All 4 section endpoints + feedback endpoint implemented
  - ✅ **Auth**: Token injection working via interceptor
  - ✅ **Error Handling**: Unified handleApiError() function
  - ✅ **Type Safety**: ApiResponse<T> generic interface

- [x] F006 [P] Update `src/services/api/authApi.ts`: ✅ COMPLETED
  - [x] F006a Restored all existing functions (signup, signin, signout, getCurrentUser, etc.)
  - [x] F006b Added forgotPassword() function
  - [x] F006c Added resetPassword() function
  - [x] F006d Added verifyEmail() function
  - [x] F006e Fixed signout() to accept optional token parameter
  - [x] F006f Fixed signin() response type to match existing interface
  - [x] F006g Added setTokens() utility function
  - [x] F006h Fixed token refresh interceptor with proper error handling
  - [x] F006i Added missing axios import and API_TIMEOUT constant
  - ✅ **Status**: All existing auth functions preserved and working

### Hooks

- [x] F007 Create `src/hooks/useAssessment.ts`: ✅ COMPLETED
  - [x] F007a State management: `answers`, `errors`, `isSubmitting`, `isSaving`, `isCompleted`
  - [x] F007b `loadProgress()` - Load saved section data from localStorage on mount
  - [x] F007c `updateAnswer(key, value)` - Update single field with auto-save integration
  - [x] F007d `submitSection()` - Validate + API call to appropriate endpoint based on section
  - [x] F007e Completion tracking: Marks tab as completed on successful API response
  - [x] F007f Error handling: Returns ApiResponse with success/error flags
  - [x] F007g Auto-save integration: Debounced 500ms save on every answer change
  - [x] F007h `updateAnswers(data)` - Bulk update multiple fields
  - [x] F007i `clearError(key)` - Remove field-specific error
  - [x] F007j `resetSection()` - Clear all section data
  - ✅ **Status**: Full state management hook with auto-save
  - ✅ **Integration**: Used in DynamicTab component
  - ✅ **Auto-Save**: 500ms debounce with visual indicator
  - ✅ **API Ready**: submitSection() calls correct endpoint based on section type

- [x] F008 [P] Create `src/hooks/useAssessment.ts` (navigation): ✅ COMPLETED
  - [x] F008a `useAssessmentNavigation()` - Separate hook for navigation management
  - [x] F008b `goToStep(step)` - Navigate to specific tab with state persistence
  - [x] F008c `goToNextStep()` - Sequential navigation forward
  - [x] F008d `goToPreviousStep()` - Sequential navigation backward
  - [x] F008e `currentStep` state - Tracks active tab (workforce/compensation/benefits/goals)
  - [x] F008f `completionStatus` - Loads and tracks completed tabs and count
  - [x] F008g `isFirstStep` / `isLastStep` - Boolean flags for boundary checks
  - ✅ **Status**: Navigation hook implemented in same file
  - ✅ **Integration**: Ready for tab navigation in Phase 2

**Checkpoint**: ✅ PASSED 
- `pnpm run type-check` - Zero errors
- `pnpm run build` - Successful
- `pnpm lint:fix` - All warnings resolved

---

## Phase 2: User Story 1 - Assessment Initiation (2 days) 🎯 P1

**Goal**: Users can see "Take the Assessment" button and navigate to WorkforceTab

**Status**: 🚧 IN PROGRESS - Foundation complete, ready for integration

### Tests (Write FIRST - TDD)
- [ ] US1-T05 Test `WorkforceTab` form renders all fields from JSON on page load
- [ ] US1-T06 Test `TabNavigation` shows WorkforceTab as active, others as locked
- [ ] US1-T07 Test clicking locked tabs does nothing (no navigation)

### Implementation

- [ ] US1-I01 Verify "Take the Assessment" button exists in dashboard
  - [ ] US1-I01a Conditionally display counter: `{count > 0 ? `${count} ` : ''}Take the Assessment`
  - [ ] US1-I01b Button text: "Take the Assessment" (count=0) or "Continue" (count>0)
  - [ ] US1-I01c `onClick`: Navigate to `/assessment` using React Router
  - [ ] US1-I01d Style with Tailwind CSS (match existing dashboard button styles)

- [ ] US1-I02 Create `src/components/assessment/TabNavigation.tsx`:
  - [ ] US1-I02a Display 4 tabs: Workforce, Compensation, Benefits, Goals
  - [ ] US1-I02b Load completion status from storage
  - [ ] US1-I02c Apply visual states:
    - [ ] Active tab: Bold text, colored indicator
    - [ ] Completed tab: Checkmark icon, clickable
    - [ ] Locked tab: Gray text, lock icon, not clickable
  - [ ] US1-I02d Click handler: Navigate to unlocked tabs only
  - [ ] US1-I02e Style with Tailwind CSS (horizontal tab bar for desktop, stacked for mobile)

- [ ] US1-I03 Verify FormFieldRenderer exists (created in Phase 1):
  - [ ] US1-I03a Dynamic question rendering working for all 11 types
  - [ ] US1-I03b Proper error display integration
  - [ ] US1-I03c Auto-save functionality working

- [ ] US1-I04 Verify WorkforceTab wrapper exists (created in Phase 1):
  - [ ] US1-I04a Imports DynamicTab component
  - [ ] US1-I04b Passes section="workforce"
  - [ ] US1-I04c Passes questions from questionData.json
  - [ ] US1-I04d Integrates with useAssessment hook

- [ ] US1-I05 Create or update `src/pages/assessmentWorkforce/AssessmentWorkforce.tsx`:
  - [ ] US1-I05a Render TabNavigation component at top
  - [ ] US1-I05b Read `currentStep` from useAssessmentNavigation
  - [ ] US1-I05c Conditionally render active tab component:
    - [ ] workforce → WorkforceTab
    - [ ] compensation → CompensationTab
    - [ ] benefits → BenefitsTab
    - [ ] goals → GoalsTab
  - [ ] US1-I05d Implement handleNext callback for tab navigation
  - [ ] US1-I05e Implement handleBack callback for backward navigation
  - [ ] US1-I05f Set up route: `/assessment-workforce` in router config

- [ ] US1-I06 Update dashboard to integrate assessment button:
  - [ ] US1-I06a Import useAssessment hook to read completionCount
  - [ ] US1-I06b Conditionally render button based on completionCount
  - [ ] US1-I06c Hide button when completionCount === 4

**Checkpoint**: Run tests `npm test -- AssessmentButton WorkforceTab TabNavigation` - all must pass

---

## Phase 3: User Story 2 - WorkforceTab Submission (3 days) 🎯 P1

**Goal**: Users can fill WorkforceTab, auto-save, validate, submit to API, see modals

**Status**: ⏳ PENDING - Awaiting Phase 2 completion

### Tests (Write FIRST - TDD)

- [ ] US2-T01 Test field data auto-saves to storage on blur event (within 500ms)
- [ ] US2-T02 Test saved data loads when navigating back to WorkforceTab after leaving
- [ ] US2-T03 Test commonJobTitles percentages validation: sum must equal 100%
- [ ] US2-T04 Test commonJobTitles validation error message: "Percentages must sum to 100%"
- [ ] US2-T05 Test required field validation prevents submission (show inline errors)
- [ ] US2-T06 Test API call format: POST `/api/v1/assessment/workforce` with body `{ "responses": {...} }`
- [ ] US2-T07 Test API request includes Authorization header with auth token
- [ ] US2-T08 Test success modal displays on successful API response (type='success')
- [ ] US2-T09 Test success modal title: "You're done!", subtitle: "See your results..."
- [ ] US2-T10 Test completionCount increments to 1 after successful submission
- [ ] US2-T11 Test CompensationTab unlocks after WorkforceTab API success
- [ ] US2-T12 Test error modal displays on API failure (type='error')
- [ ] US2-T13 Test error modal "Cancel" button: close modal, stay on WorkforceTab
- [ ] US2-T14 Test error modal "Continue" button: close modal, navigate to CompensationTab
- [ ] US2-T15 Test API timeout after 10 seconds shows error modal

### Implementation

> **Note**: Auto-save and validation are already implemented in DynamicTab component (Phase 1).
> This phase focuses on integration testing and UI enhancements.

- [ ] US2-I01 Verify auto-save is working (implemented in DynamicTab):
  - [ ] US2-I01a Field changes trigger debounced save (500ms)
  - [ ] US2-I01b Visual indicator shows "Saving..." → "Saved"
  - [ ] US2-I01c localStorage updates correctly

- [ ] US2-I02 Verify data restoration is working (implemented in DynamicTab):
  - [ ] US2-I02a loadProgress() called on mount
  - [ ] US2-I02b Form fields populate with saved values
  - [ ] US2-I02c Null/undefined handled gracefully

- [ ] US2-I03 Verify percentage validation is working (implemented in DynamicTab):
  - [ ] US2-I03a Sum validation for structured fields
  - [ ] US2-I03b Inline error display
  - [ ] US2-I03c Scroll to error on validation failure

- [ ] US2-I04 Verify "Next" button logic (implemented in DynamicTab):
  - [ ] US2-I04a Validation runs on click
  - [ ] US2-I04b Inline errors display if validation fails
  - [ ] US2-I04c API call triggers if validation passes
  - [ ] US2-I04d Button disabled during API call

- [ ] US2-I05 Verify submitSection() integration (implemented in useAssessment):
  - [ ] US2-I05a Correct endpoint called (POST /api/assessment/workforce)
  - [ ] US2-I05b Request body formatted correctly
  - [ ] US2-I05c Auth token included
  - [ ] US2-I05d Success: tab marked complete, count incremented
  - [ ] US2-I05e Error: error modal shown

- [ ] US2-I06 Verify success modal (implemented in DynamicTab):
  - [ ] US2-I06a BaseModalWithIcon used
  - [ ] US2-I06b Correct title/subtitle
  - [ ] US2-I06c Continue button navigates to next tab

- [ ] US2-I07 Verify error modal (implemented in DynamicTab):
  - [ ] US2-I07a BaseModalWithIcon used
  - [ ] US2-I07b Cancel/Continue buttons functional
  - [ ] US2-I07c Modal remains open until user action

**Checkpoint**: Run tests `npm test -- WorkforceTab useAssessment` - all must pass. Manual test: Fill form, submit, verify API call in Network tab

---

## Phase 4: User Story 3 - Sequential Tab Progression (4 days) 🎯 P1

**Goal**: Users can complete CompensationTab, BenefitsTab, GoalsTab sequentially

**Status**: ⏳ PENDING - Awaiting Phase 3 completion

### Tests (Write FIRST - TDD)

- [ ] US3-T01 Test CompensationTab renders after WorkforceTab API success
- [ ] US3-T02 Test back button appears on CompensationTab (not on WorkforceTab)
- [ ] US3-T03 Test back button navigates to WorkforceTab with saved data loaded
- [ ] US3-T04 Test CompensationTab API call: POST `/api/v1/assessment/compensation`
- [ ] US3-T05 Test completionCount increments to 2 after CompensationTab success
- [ ] US3-T06 Test BenefitsTab unlocks after CompensationTab success
- [ ] US3-T07 Test BenefitsTab API call: POST `/api/v1/assessment/benefits`
- [ ] US3-T08 Test completionCount increments to 3 after BenefitsTab success
- [ ] US3-T09 Test GoalsTab unlocks after BenefitsTab success
- [ ] US3-T10 Test GoalsTab submit button says "Submit" not "Next"
- [ ] US3-T11 Test GoalsTab API call: POST `/api/v1/assessment/goals`
- [ ] US3-T12 Test completionCount increments to 4 after GoalsTab success
- [ ] US3-T13 Test final success modal button says "Go to Dashboard" (not "Continue")
- [ ] US3-T14 Test navigation to `/dashboard` after GoalsTab completion
- [ ] US3-T15 Test completed tabs show checkmark icon in TabNavigation
- [ ] US3-T16 Test clicking completed tab navigates to that tab with saved data

### Implementation

> **Note**: CompensationTab, BenefitsTab, and GoalsTab wrappers already exist (Phase 1).
> This phase focuses on navigation, back button, and sequential flow.

#### Tab Integration

- [ ] US3-I01 Verify all tab wrappers exist and work (created in Phase 1):
  - [ ] US3-I01a CompensationTab.tsx properly configured
  - [ ] US3-I01b BenefitsTab.tsx properly configured
  - [ ] US3-I01c GoalsTab.tsx properly configured
  - [ ] US3-I01d All use DynamicTab with correct section prop

#### Navigation Enhancement

- [ ] US3-I02 Create BackButton component:
  - [ ] US3-I02a Import from shared components
  - [ ] US3-I02b Display only on tabs 2-4 (not WorkforceTab)
  - [ ] US3-I02c onClick: Call goToPreviousStep() from useAssessmentNavigation
  - [ ] US3-I02d Icon: Left arrow + "Back" text
  - [ ] US3-I02e Style with Tailwind CSS

- [ ] US3-I03 Update AssessmentWorkforce.tsx:
  - [ ] US3-I03a Add BackButton conditionally (if !isFirstStep)
  - [ ] US3-I03b Implement handleBack callback
  - [ ] US3-I03c Ensure backward navigation loads saved data

- [ ] US3-I04 Update TabNavigation component:
  - [ ] US3-I04a Add checkmark icons to completed tabs
  - [ ] US3-I04b Make completed tabs clickable
  - [ ] US3-I04c Update lock logic for sequential access
  - [ ] US3-I04d Style active/completed/locked states

#### Goals Tab Special Handling

- [ ] US3-I05 Update GoalsTab for final submission:
  - [ ] US3-I05a Pass custom button text prop: "Submit"
  - [ ] US3-I05b Update success modal button text: "Go to Dashboard"
  - [ ] US3-I05c Update navigation target: /dashboard

**Checkpoint**: Run tests `npm test -- CompensationTab BenefitsTab GoalsTab TabNavigation` - all must pass. E2E test: Complete all 4 tabs sequentially

---

## Phase 5: User Story 4 - Dashboard Post-Completion Display (2 days) 🎯 P2

**Goal**: Dashboard displays Recommendations and Benchmark after assessment complete

**Status**: ⏳ PENDING - Awaiting Phase 4 completion

### Tests (Write FIRST - TDD)

- [ ] US4-T01 Test "Take the Assessment" button hidden when completionCount = 4
- [ ] US4-T02 Test email verification section hidden when completionCount = 4
- [ ] US4-T03 Test Recommendations section displayed when completionCount = 4
- [ ] US4-T04 Test Benchmark section displayed when completionCount = 4
- [ ] US4-T05 Test Recommendations section shows static data correctly
- [ ] US4-T06 Test Benchmark section shows static data correctly
- [ ] US4-T07 Test "Share Feedback" button visible when completionCount = 4

### Implementation

- [ ] US4-I01 Update `src/pages/dashboard/index.tsx`:
  - [ ] US4-I01a Import `useAssessment` hook to read completionCount
  - [ ] US4-I01b Conditional rendering logic:
    ```typescript
    const { completionCount } = useAssessment();
    const isAssessmentComplete = completionCount === 4;
    ```
  - [ ] US4-I01c If `!isAssessmentComplete`: Render AssessmentButton
  - [ ] US4-I01d If `!isAssessmentComplete`: Render email verification section (if needed)
  - [ ] US4-I01e If `isAssessmentComplete`: Hide AssessmentButton
  - [ ] US4-I01f If `isAssessmentComplete`: Hide email verification section

- [ ] US4-I02 Import and render Recommendations section:
  - [ ] US4-I02a Import existing `RecommendationsSection` component
  - [ ] US4-I02b Conditional render: `{isAssessmentComplete && <RecommendationsSection />}`
  - [ ] US4-I02c Verify static data displays correctly (NO CHANGES to component)

- [ ] US4-I03 [P] Import and render Benchmark section:
  - [ ] US4-I03a Import existing `BenchmarkSection` component
  - [ ] US4-I03b Conditional render: `{isAssessmentComplete && <BenchmarkSection />}`
  - [ ] US4-I03c Verify static data displays correctly (NO CHANGES to component)

- [ ] US4-I04 Add "Share Feedback" button:
  - [ ] US4-I04a Create button component or add inline button
  - [ ] US4-I04b Conditional render: `{isAssessmentComplete && <Button onClick={...}>Share Feedback</Button>}`
  - [ ] US4-I04c Style with Tailwind CSS (match existing dashboard button styles)
  - [ ] US4-I04d Position below Recommendations/Benchmark sections

**Checkpoint**: Run tests `npm test -- dashboard` - all must pass. Manual test: Set completionCount=4 in storage, refresh dashboard, verify sections display

---

## Phase 6: User Story 5 - Share Feedback (2 days) 🎯 P2

**Goal**: Users can submit feedback via GetInTouchModal with registration validation

**Status**: ⏳ PENDING - Awaiting Phase 5 completion

### Tests (Write FIRST - TDD)

- [ ] US5-T01 Test "Share Feedback" button opens GetInTouchModal
- [ ] US5-T02 Test GetInTouchModal closes on cancel/X button
- [ ] US5-T03 Test feedback form validates firstName (same as registration: minLength=2, pattern=/^[a-zA-Z\s]+$/)
- [ ] US5-T04 Test feedback form validates lastName (same as registration)
- [ ] US5-T05 Test feedback form validates email (same as registration: pattern=/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
- [ ] US5-T06 Test feedback form validates phone (same as registration: pattern=/^\+?[1-9]\d{1,14}$/)
- [ ] US5-T07 Test validation errors display inline in modal
- [ ] US5-T08 Test API call format: POST `/api/v1/feedback` with `{ firstName, lastName, email, phone, message? }`
- [ ] US5-T09 Test API request includes Authorization header
- [ ] US5-T10 Test success modal displays after successful feedback submission
- [ ] US5-T11 Test success modal title: "Feedback sent", subtitle: "Thanks for sharing your feedback!"
- [ ] US5-T12 Test "Back to Dashboard" button closes success modal (no page reload)
- [ ] US5-T13 Test error message displays in GetInTouchModal on API failure
- [ ] US5-T14 Test modal remains open for retry on error
- [ ] US5-T15 Test feedback can be resubmitted after fixing errors

### Implementation

- [ ] US5-I01 Update `dashboard/index.tsx` to add "Share Feedback" button:
  - [ ] US5-I01a State: `const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false)`
  - [ ] US5-I01b Button `onClick`: `setIsFeedbackModalOpen(true)`
  - [ ] US5-I01c Conditional render based on `isAssessmentComplete`

- [ ] US5-I02 Import and render GetInTouchModal:
  - [ ] US5-I02a Import `GetInTouchModal` component from `src/components/modals/GetInTouchModal.tsx`
  - [ ] US5-I02b Pass props: `isOpen={isFeedbackModalOpen}`, `onClose={() => setIsFeedbackModalOpen(false)}`
  - [ ] US5-I02c Pass `onSubmit={handleFeedbackSubmit}` handler

- [ ] US5-I03 Import validation schemas from Auth module:
  - [ ] US5-I03a Import validation schemas from `src/services/validation/assessmentSchemas.ts`
  - [ ] US5-I03b Apply schemas to feedback form fields in GetInTouchModal
  - [ ] US5-I03c Ensure inline error messages match registration form styling

- [ ] US5-I04 Implement feedback submission handler:
  - [ ] US5-I04a Create `handleFeedbackSubmit` function in dashboard component
  - [ ] US5-I04b Handle loading state: disable submit button, show spinner during API call
  - [ ] US5-I04c On success: Close GetInTouchModal, show success modal
  - [ ] US5-I04d On error: Display error in GetInTouchModal, keep modal open

- [ ] US5-I05 Add feedback success modal:
  - [ ] US5-I05a Import `BaseModalWithIcon` component
  - [ ] US5-I05b State: `const [showFeedbackSuccessModal, setShowFeedbackSuccessModal] = useState(false)`
  - [ ] US5-I05c Props: `type='success'`, `title='Feedback sent'`, `subtitle='Thanks for sharing your feedback!'`
  - [ ] US5-I05d Button: text='Back to Dashboard', action=`() => setShowFeedbackSuccessModal(false)`

- [ ] US5-I06 Add error handling in GetInTouchModal:
  - [ ] US5-I06a Display error message at top of modal if error exists
  - [ ] US5-I06b Style error message with red background and text
  - [ ] US5-I06c Allow user to correct data and retry submission
  - [ ] US5-I06d Clear error message when user starts editing fields

**Checkpoint**: Run tests `npm test -- GetInTouchModal feedbackApi` - all must pass. Manual test: Complete assessment, click "Share Feedback", submit form, verify API call and success modal

---

## Phase 7: Integration & Testing (2-3 days)

**Purpose**: End-to-end testing, bug fixes, performance optimization, accessibility

**Status**: ⏳ PENDING - Awaiting Phase 6 completion

### Bug Fixes

- [ ] BF-01 Review test results and create bug tickets for failures
- [ ] BF-02 Prioritize bugs: P0 (blocking), P1 (high), P2 (medium), P3 (low)
- [ ] BF-03 Fix all P0 and P1 bugs before release
- [ ] BF-04 Re-run tests after fixes to verify resolution

---

## Phase 8: Documentation & Handoff (1 day)

**Purpose**: Document implementation for future maintenance and API integration

**Status**: ⏳ PENDING - Awaiting Phase 7 completion

- [ ] DOC-01 Create `docs/assessment-storage.md`:
  - [ ] DOC-01a Document AssessmentStorage schema structure
  - [ ] DOC-01b Document storage helper functions
  - [ ] DOC-01c Document how to clear assessment data on logout

- [ ] DOC-02 Create `docs/assessment-api.md`:
  - [ ] DOC-02a Document all 4 assessment API endpoints
  - [ ] DOC-02b Document feedback API endpoint
  - [ ] DOC-02c Document authentication requirements
  - [ ] DOC-02d Document error responses and handling

- [ ] DOC-03 Create `docs/validation-rules.md`:
  - [ ] DOC-03a Document validation rules per tab
  - [ ] DOC-03b Document custom validators
  - [ ] DOC-03c Document error messages and display patterns

- [ ] DOC-04 Update `README.md`:
  - [ ] DOC-04a Add section describing dashboard-assessment module
  - [ ] DOC-04b Add instructions for running assessment feature
  - [ ] DOC-04c Add troubleshooting section

- [ ] DOC-05 Create `CHANGELOG.md` entry:
  - [ ] DOC-05a List all new features
  - [ ] DOC-05b List breaking changes (if any)
  - [ ] DOC-05c List known issues (if any)

- [ ] DOC-06 Create TODO for future Recommendations API integration:
  - [ ] DOC-06a Document current static data structure
  - [ ] DOC-06b Document expected API endpoint
  - [ ] DOC-06c Document integration steps

- [ ] DOC-07 Create TODO for future Benchmark API integration:
  - [ ] DOC-07a Document current static data structure
  - [ ] DOC-07b Document expected API endpoint
  - [ ] DOC-07c Document integration steps

- [ ] DOC-08 Code cleanup:
  - [ ] DOC-08a Remove console.log statements
  - [ ] DOC-08b Remove commented-out code
  - [ ] DOC-08c Add TSDoc comments to complex functions
  - [ ] DOC-08d Run ESLint and Prettier: `pnpm lint:fix && pnpm format`

- [ ] DOC-09 Create pull request:
  - [ ] DOC-09a Write detailed PR description
  - [ ] DOC-09b Add screenshots of new features
  - [ ] DOC-09c Add testing evidence
  - [ ] DOC-09d List reviewers and request review

- [ ] DOC-10 Prepare demo video:
  - [ ] DOC-10a Record screen capture of full assessment flow
  - [ ] DOC-10b Record feedback submission flow
  - [ ] DOC-10c Record dashboard display after completion
  - [ ] DOC-10d Annotate with voiceover or text overlays

---

## Summary Checklist

### Phase 0: Research & Design ✅
- [x] All research tasks complete (D001-D010)
- [x] Documentation artifacts created

### Phase 1: Foundation ✅
- [x] All type definitions created (F001-F002)
- [x] All validation schemas created (F003)
- [x] Storage layer implemented (F004)
- [x] API layer implemented (F005-F006)
- [x] Hooks implemented (F007-F008)
- [x] `pnpm run type-check` passes
- [x] `pnpm run build` passes
- [x] `pnpm lint:fix` passes

### Phase 2: User Story 1 🚧
- [ ] All tests written and passing
- [ ] TabNavigation component complete
- [ ] AssessmentWorkforce page complete
- [ ] Dashboard integration complete

### Phase 3: User Story 2 ⏳
- [ ] All tests written and passing
- [ ] WorkforceTab submission flow complete
- [ ] Success/Error modals tested
- [ ] API integration verified

### Phase 4: User Story 3 ⏳
- [ ] All tests written and passing
- [ ] All 4 tabs functional
- [ ] BackButton working
- [ ] Sequential progression tested

### Phase 5: User Story 4 ⏳
- [ ] All tests written and passing
- [ ] Dashboard conditional rendering complete
- [ ] Recommendations/Benchmark sections displayed

### Phase 6: User Story 5 ⏳
- [ ] All tests written and passing
- [ ] Feedback submission working
- [ ] GetInTouchModal integrated

### Phase 7: Integration & Testing ⏳
- [ ] All E2E tests passing
- [ ] Performance targets met
- [ ] Accessibility validated
- [ ] Bug fixes complete

### Phase 8: Documentation & Handoff ⏳
- [ ] All documentation created
- [ ] Code cleanup complete
- [ ] Pull request created
- [ ] Demo video prepared

---

## Definition of Done ✅

- [ ] All 5 user stories implemented and independently testable
- [ ] All acceptance scenarios pass automated tests
- [ ] Test coverage ≥80% for new components
- [ ] All API integrations functional (4 assessment + 1 feedback endpoint)
- [ ] Auto-save working per Profile Settings pattern
- [ ] Sequential tab access enforced
- [ ] Completion counter updates correctly (0-4)
- [ ] Dashboard conditionally displays Recommendations/Benchmark after completion
- [ ] Feedback feature validates using Auth module patterns
- [ ] WCAG 2.1 Level AA compliance verified with axe-core
- [ ] Performance targets met (form render <1s, auto-save <500ms, validation <200ms)
- [ ] Responsive design tested on mobile/tablet/desktop
- [ ] Browser compatibility verified (Chrome, Firefox, Safari, Edge)
- [ ] No ESLint/Prettier errors
- [ ] No TypeScript strict mode errors
- [ ] Documentation complete (storage schema, API formats, validation rules)
- [ ] Pull request approved by code reviewer
- [ ] Demo completed for stakeholder approval

**Total Tasks**: ~150-170 tasks across 8 phases  
**Estimated Duration**: 18-22 days (3.5-4.5 weeks)  
**Current Progress**: Phase 1 Complete (100%), Phase 2 In Progress (0%), Overall ~12% Complete
