# Tasks: Dashboard Assessment Module

**Branch**: `003-dashboard-assessment`  
**Input**: [dashboard.spec.md](dashboard.spec.md), [dashboard.plan.md](dashboard.plan.md)  
**Scope**: Frontend implementation only (Backend APIs available)

---

## 📊 Implementation Progress Summary

**Last Updated**: 2026-02-06

### ✅ Completed Phases
- **Phase 1: Foundation (100%)** - All 8 foundation tasks completed and type-checked
  - Type definitions, validation schemas, storage layer, API layer, custom hooks
  - Files created: 10 new files
  - Type check: ✅ PASSED (zero errors)
  - Design: ✅ FIXED (white card background, proper spacing, section headers)
  - React Keys: ✅ FIXED (all opt.id → opt.value, no console warnings)
  - **Next Button Integration: ✅ COMPLETED**
    - Validation trigger on click
    - API submission on success
    - Success/Error modals integrated
    - Loading states implemented
    - Scroll to first error on validation failure

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
  
- **State Management**: ✅ IMPLEMENTED & INTEGRATED
  - `useAssessment` hook with auto-save (500ms debounce)
  - `submitSection()` function integrated with Next button
  - `updateAnswer()` with localStorage persistence
  - `loadProgress()` restores saved data on mount
  - Tab completion tracking via `markTabCompleted()`
  - Error state management with `setErrors()`
  - **✅ isSubmitting state prevents duplicate submissions**
  - **✅ Loading indicator on button during API call**

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

### 📋 Next Steps
- Integrate DynamicTab components with AssessmentWorkforce page
- Add "Next" button with validation trigger
- Add success/error modals (BaseModalWithIcon)
- Implement tab navigation and progression

### 📦 Artifacts Created

**Types & Interfaces** (1 file)
- `src/types/questionTypes.ts` - Complete type definitions for question.json structure

**Validation** (1 file)
- `src/services/validation/assessmentSchemas.ts` - Zod schemas for all 4 sections

**Storage** (1 file)
- `src/utils/assessmentStorage.ts` - localStorage persistence with auto-save

**API** (1 file)
- `src/services/api/assessmentApi.ts` - API endpoints for all 4 sections + feedback

**Hooks** (1 file)
- `src/hooks/useAssessment.ts` - State management + navigation hooks

**Components** (5 files)
- `src/components/assessment/DynamicQuestionRenderer.tsx` - Renders 11 question types
- `src/components/assessment/DynamicTab.tsx` - Main tab component with validation
- `src/pages/assessmentWorkforce/WorkforceTab.tsx` - Workforce wrapper
- `src/pages/assessmentWorkforce/CompensationTab.tsx` - Compensation wrapper
- `src/pages/assessmentWorkforce/BenefitsTab.tsx` - Benefits wrapper
- `src/pages/assessmentWorkforce/GoalsTab.tsx` - Goals wrapper

**Total**: 10 new files created, 0 files modified

---

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4, US5)
- Include exact file paths in descriptions

---

## Phase 0: Research & Design (1-2 days)

**Purpose**: Understand existing patterns, parse JSON, design components

- [ ] D001 Review Auth module storage implementation: Read `src/services/storage/` and `src/hooks/useAuth.ts` to understand storage pattern
- [ ] D002 [P] Review Profile Settings auto-save pattern: Analyze field change handlers in `src/pages/settings/` for auto-save implementation
- [ ] D003 [P] Analyze BaseModalWithIcon component: Review props interface in `src/components/modals/BaseModalWithIcon.tsx`
- [ ] D004 [P] Analyze GetInTouchModal component: Review props interface in `src/components/modals/GetInTouchModal.tsx`
- [ ] D005 [P] Review Recommendations component: Check current design in `src/components/dashboard/RecommendationsSection.tsx` or similar
- [ ] D006 [P] Review Benchmark component: Check current design in `src/components/dashboard/BenchmarkSection.tsx` or similar
- [ ] D007 Parse assessmentFields.json: Create mapping table (field type → React component)
- [ ] D008 Design tab state machine: Document tab progression logic (Workforce → Compensation → Benefits → Goals)
- [ ] D009 Design validation strategy: Create validation rules matrix per tab (required fields, percentages, nested objects)
- [ ] D010 Create component hierarchy diagram: Document component relationships and data flow

**Deliverables**: Storage pattern docs, field mapping table, state machine diagram, validation matrix

---

## Phase 1: Foundation (2-3 days) ⚠️ BLOCKING ✅ COMPLETED

**Purpose**: Core infrastructure that ALL user stories depend on

**Status**: ✅ COMPLETED - All foundation components implemented and type-checked

### Type Definitions

- [x] F001 Create `src/types/questionTypes.ts` with interfaces: ✅ COMPLETED
  - [x] F001a Complete TypeScript interfaces for Question, ValidationRules, Section structures
  - [x] F001b QuestionField, ConditionalQuestion, OptionGroup interfaces
  - [x] F001c AssessmentData interface for question.json structure
  - [x] F001d Exported types: `Question`, `Section`, `AssessmentData`, `ValidationRules`
  - [x] F001e Support for all 11 question types (SINGLE_SELECT, MULTIPLE_CHOICE, YES_NO, STRUCTURED_ARRAY, NUMERIC, NUMBER_INPUT, TEXT_INPUT, PARTICIPATION_RATES, RANKING, etc.)

- [x] F002 [P] Dynamic component created:
  - [x] F002a `src/components/assessment/DynamicQuestionRenderer.tsx` - Renders all question types dynamically
  - [x] F002b `src/components/assessment/DynamicTab.tsx` - Main tab component with validation integration
  - [x] F002c 4 tab wrappers created: WorkforceTabDynamic, CompensationTab, BenefitsTab, GoalsTab

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
  - ✅ **Status**: All 4 section endpoints + feedback endpoint implemented
  - ✅ **Auth**: Token injection working via interceptor
  - ✅ **Error Handling**: Unified handleApiError() function
  - ✅ **Type Safety**: ApiResponse<T> generic interface

- [x] F006 [P] Create feedback endpoint: ✅ COMPLETED
  - [x] F006a `submitFeedback(rating, comments?)` → POST `/api/assessment/feedback`
  - [x] F006b Included in assessmentApi.ts module
  - ✅ **Status**: Ready for Phase 6 (User Story 5)

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

**Checkpoint**: ✅ PASSED - `pnpm run type-check` completed with zero errors

---

## Phase 2: User Story 1 - Assessment Initiation (2 days) 🎯 P1

**Goal**: Users can see "Take the Assessment" button and navigate to WorkforceTab

### Tests (Write FIRST - TDD)
- [ ] US1-T05 Test `WorkforceTab` form renders all fields from JSON on page load
- [ ] US1-T06 Test `TabNavigation` shows WorkforceTab as active, others as locked
- [ ] US1-T07 Test clicking locked tabs does nothing (no navigation)

### Implementation

- [ ] US1-I01 already there Take assessment button
  - [ ] US1-I01b Conditionally display counter: `{count > 0 ? `${count} ` : ''}Take the Assessment`
  - [ ] US1-I01c Button text: "Take the Assessment" (count=0) or "Continue" (count>0)
  - [ ] US1-I01d `onClick`: Navigate to `/assessment` using React Router
  - [ ] US1-I01e Style with Tailwind CSS (match existing dashboard button styles)


- [ ] US1-I03 [P] Create `src/components/dashboard/FormFieldRenderer.tsx`:
  - [ ] US1-I03a Parse JSON field config object
  - [ ] US1-I03b Map field types to React components:
    - [ ] `text` → Input component
    - [ ] `select` → Select component
    - [ ] `radio` → Radio component
    - [ ] `checkbox` → Checkbox component
    - [ ] `number` → Input type="number"
    - [ ] `multi-select` → Multi-select component
    - [ ] `textarea` → Textarea component
  - [ ] US1-I03c Handle nested arrays (e.g., commonJobTitles)
  - [ ] US1-I03d Handle nested objects (e.g., healthPlanParticipationRates)
  - [ ] US1-I03e Display field labels, placeholders, helper text from JSON

- [ ] US1-I04 Create `src/components/dashboard/WorkforceTab.tsx`:
  - [ ] US1-I04a Import `FormFieldRenderer` component
  - [ ] US1-I04b Import `useForm` from React Hook Form
  - [ ] US1-I04c Load WorkforceTab field config from assessmentFields.json
  - [ ] US1-I04d Render all fields using FormFieldRenderer
  - [ ] US1-I04e Add "Next" button at bottom of form
  - [ ] US1-I04f Integrate with `useAssessment` hook for state management

- [ ] US1-I05 Create `src/pages/dashboard/AssessmentForm.tsx`:
  - [ ] US1-I05a Render TabNavigation component at top
  - [ ] US1-I05b Conditionally render active tab component (WorkforceTab, CompensationTab, etc.)
  - [ ] US1-I05c Add BackButton component (conditionally displayed)
  - [ ] US1-I05d Set up route: `/assessment` in router config


  - [ ] US1-I06c Conditionally render based on completionCount (hide if count === 4)

**Checkpoint**: Run tests `npm test -- AssessmentButton WorkforceTab TabNavigation` - all must pass

---

## Phase 3: User Story 2 - WorkforceTab Submission (3 days) 🎯 P1

**Goal**: Users can fill WorkforceTab, auto-save, validate, submit to API, see modals

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

- [ ] US2-I01 Add auto-save logic to `WorkforceTab.tsx`:
  - [ ] US2-I01a Watch form field changes with React Hook Form `watch()`
  - [ ] US2-I01b On blur event: Call `useAssessment.saveTabData('WorkforceTab', formData)`
  - [ ] US2-I01c Debounce auto-save with 300ms delay to reduce write frequency
  - [ ] US2-I01d Show auto-save indicator (e.g., "Saving..." → "Saved" checkmark)

- [ ] US2-I02 [P] Add data restoration logic to `WorkforceTab.tsx`:
  - [ ] US2-I02a On component mount: Call `useAssessment.loadTabData('WorkforceTab')`
  - [ ] US2-I02b Populate form fields with saved values using `setValue()` from React Hook Form
  - [ ] US2-I02c Handle null/undefined saved data gracefully (empty form if no saved data)

- [ ] US2-I03 Add percentage sum validation to `assessmentSchemas.ts`:
  - [ ] US2-I03a Custom Zod validator: `commonJobTitles.refine((items) => sum(items.map(i => i.percentage)) === 100)`
  - [ ] US2-I03b Error message: "Percentages must sum to 100%"
  - [ ] US2-I03c Display inline error below commonJobTitles field in red text

- [ ] US2-I04 Add "Next" button logic to `WorkforceTab.tsx`:
  - [ ] US2-I04a `onClick`: Trigger React Hook Form `handleSubmit()`
  - [ ] US2-I04b If validation fails: Display inline errors, prevent submission, scroll to first error
  - [ ] US2-I04c If validation passes: Call `useAssessment.submitTab('WorkforceTab', formData)`
  - [ ] US2-I04d Disable button during API call, show loading spinner

- [ ] US2-I05 Implement `submitTab()` in `useAssessment` hook for WorkforceTab:
  - [ ] US2-I05a Format form data as `{ "responses": { ...formData } }`
  - [ ] US2-I05b Call `assessmentApi.submitWorkforce(formattedData)`
  - [ ] US2-I05c Set loading state: `setIsLoading(true)`
  - [ ] US2-I05d On success (200/201 response):
    - [ ] Mark tab complete: `markTabComplete('WorkforceTab', true)`
    - [ ] Increment counter: `updateCompletionCount(completionCount + 1)`
    - [ ] Show success modal
  - [ ] US2-I05e On error (4xx/5xx response or timeout):
    - [ ] Show error modal with Cancel/Continue options
  - [ ] US2-I05f Set loading state: `setIsLoading(false)`

- [ ] US2-I06 Add success modal trigger in `WorkforceTab.tsx`:
  - [ ] US2-I06a Import `BaseModalWithIcon` component
  - [ ] US2-I06b State: `const [showSuccessModal, setShowSuccessModal] = useState(false)`
  - [ ] US2-I06c Props: `type='success'`, `title='You're done!'`, `subtitle='See your results and recommendations on your dashboard'`
  - [ ] US2-I06d Button: text='Continue', action=`() => { setShowSuccessModal(false); navigate('/assessment?tab=compensation'); }`

- [ ] US2-I07 [P] Add error modal trigger in `WorkforceTab.tsx`:
  - [ ] US2-I07a Import `BaseModalWithIcon` component
  - [ ] US2-I07b State: `const [showErrorModal, setShowErrorModal] = useState(false)`
  - [ ] US2-I07c Props: `type='error'`, `title='Uh-oh'`, `subtitle='You have not filled anything out. Your recommendations will not be as accurate. Are you sure you want to proceed?'`
  - [ ] US2-I07d Buttons:
    - [ ] Cancel: `{ text='Cancel', action=() => setShowErrorModal(false) }`
    - [ ] Continue: `{ text='Continue', action=() => { setShowErrorModal(false); navigate('/assessment?tab=compensation'); } }`

**Checkpoint**: Run tests `npm test -- WorkforceTab useAssessment` - all must pass. Manual test: Fill form, submit, verify API call in Network tab

---

## Phase 4: User Story 3 - Sequential Tab Progression (4 days) 🎯 P1

**Goal**: Users can complete CompensationTab, BenefitsTab, GoalsTab sequentially

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

#### CompensationTab

- [ ] US3-I01 Create `src/components/dashboard/CompensationTab.tsx`:
  - [ ] US3-I01a Same structure as WorkforceTab (copy and adapt)
  - [ ] US3-I01b Load CompensationTab fields from assessmentFields.json
  - [ ] US3-I01c Render fields using FormFieldRenderer
  - [ ] US3-I01d Auto-save on blur event
  - [ ] US3-I01e Load saved data on mount
  - [ ] US3-I01f "Next" button: validate and submit to `/api/v1/assessment/compensation`
  - [ ] US3-I01g Success modal → navigate to BenefitsTab
  - [ ] US3-I01h Error modal with Cancel/Continue

- [ ] US3-I02 [P] Update `useAssessment` hook:
  - [ ] US3-I02a Add `submitCompensation()` function (same pattern as submitWorkforce)
  - [ ] US3-I02b Format data as `{ "responses": {...} }`
  - [ ] US3-I02c Call `assessmentApi.submitCompensation()`
  - [ ] US3-I02d Update storage on success

#### BenefitsTab

- [ ] US3-I03 Create `src/components/dashboard/BenefitsTab.tsx`:
  - [ ] US3-I03a Same structure as WorkforceTab/CompensationTab
  - [ ] US3-I03b Load BenefitsTab fields from assessmentFields.json
  - [ ] US3-I03c Render fields using FormFieldRenderer (handle nested objects like healthPlanParticipationRates)
  - [ ] US3-I03d Auto-save on blur event
  - [ ] US3-I03e Load saved data on mount
  - [ ] US3-I03f "Next" button: validate and submit to `/api/v1/assessment/benefits`
  - [ ] US3-I03g Success modal → navigate to GoalsTab
  - [ ] US3-I03h Error modal with Cancel/Continue

- [ ] US3-I04 [P] Update `useAssessment` hook:
  - [ ] US3-I04a Add `submitBenefits()` function
  - [ ] US3-I04b Call `assessmentApi.submitBenefits()`
  - [ ] US3-I04c Update storage on success

#### GoalsTab

- [ ] US3-I05 Create `src/components/dashboard/GoalsTab.tsx`:
  - [ ] US3-I05a Same structure as previous tabs
  - [ ] US3-I05b Load GoalsTab fields from assessmentFields.json (workforceGoals, workforceGoalsRanking)
  - [ ] US3-I05c Render fields using FormFieldRenderer
  - [ ] US3-I05d Auto-save on blur event
  - [ ] US3-I05e Load saved data on mount
  - [ ] US3-I05f **Button text: "Submit"** (not "Next")
  - [ ] US3-I05g Validate and submit to `/api/v1/assessment/goals`
  - [ ] US3-I05h Success modal button text: **"Go to Dashboard"**
  - [ ] US3-I05i Success modal action: Navigate to `/dashboard`
  - [ ] US3-I05j Error modal with Cancel/Continue

- [ ] US3-I06 [P] Update `useAssessment` hook:
  - [ ] US3-I06a Add `submitGoals()` function
  - [ ] US3-I06b Call `assessmentApi.submitGoals()`
  - [ ] US3-I06c Update storage on success (completionCount = 4)

#### Back Button

- [ ] US3-I07 Create `src/components/dashboard/BackButton.tsx`:
  - [ ] US3-I07a Display only on tabs 2-4 (not WorkforceTab)
  - [ ] US3-I07b `onClick`: Call `useTabNavigation.goToPreviousTab()`
  - [ ] US3-I07c Icon: Left arrow + "Back" text
  - [ ] US3-I07d Style with Tailwind CSS (match existing button styles)
  - [ ] US3-I07e Position at top-left of form

- [ ] US3-I08 Implement `goToPreviousTab()` in `useTabNavigation` hook:
  - [ ] US3-I08a Get current tab from storage
  - [ ] US3-I08b Calculate previous tab (CompensationTab → WorkforceTab, etc.)
  - [ ] US3-I08c Navigate to previous tab using React Router
  - [ ] US3-I08d Load saved data from storage for previous tab

#### Tab Routing

- [ ] US3-I10 Update `AssessmentForm.tsx`:
  - [ ] US3-I10a Read `?tab=` query param from URL
  - [ ] US3-I10b Conditionally render tab component based on query param:
    - [ ] `/assessment?tab=workforce` → WorkforceTab
    - [ ] `/assessment?tab=compensation` → CompensationTab
    - [ ] `/assessment?tab=benefits` → BenefitsTab
    - [ ] `/assessment?tab=goals` → GoalsTab
  - [ ] US3-I10c Default to first incomplete tab if no query param
  - [ ] US3-I10d Render BackButton (conditionally)

**Checkpoint**: Run tests `npm test -- CompensationTab BenefitsTab GoalsTab TabNavigation` - all must pass. E2E test: Complete all 4 tabs sequentially

---

## Phase 5: User Story 4 - Dashboard Post-Completion Display (2 days) 🎯 P2

**Goal**: Dashboard displays Recommendations and Benchmark after assessment complete

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
  - [ ] US5-I03a Import `firstNameSchema`, `lastNameSchema`, `emailSchema`, `phoneSchema` from `src/services/validation/authSchemas.ts`
  - [ ] US5-I03b Apply schemas to feedback form fields in GetInTouchModal
  - [ ] US5-I03c Ensure inline error messages match registration form styling

- [ ] US5-I04 Implement feedback submission handler:
  - [ ] US5-I04a Create `handleFeedbackSubmit` function in dashboard component:
    ```typescript
    const handleFeedbackSubmit = async (data: FeedbackFormData) => {
      try {
        setIsSubmitting(true);
        await feedbackApi.submitFeedback(data);
        setIsFeedbackModalOpen(false);
        setShowFeedbackSuccessModal(true);
      } catch (error) {
        setFeedbackError(error.message);
      } finally {
        setIsSubmitting(false);
      }
    };
    ```
  - [ ] US5-I04b Handle loading state: disable submit button, show spinner during API call
  - [ ] US5-I04c On success: Close GetInTouchModal, show success modal
  - [ ] US5-I04d On error: Display error in GetInTouchModal (inline or at top), keep modal open

- [ ] US5-I05 Add feedback success modal:
  - [ ] US5-I05a Import `BaseModalWithIcon` component
  - [ ] US5-I05b State: `const [showFeedbackSuccessModal, setShowFeedbackSuccessModal] = useState(false)`
  - [ ] US5-I05c Props: `type='success'`, `title='Feedback sent'`, `subtitle='Thanks for sharing your feedback! We really appreciate you taking the time to help us improve.'`
  - [ ] US5-I05d Button: text='Back to Dashboard', action=`() => setShowFeedbackSuccessModal(false)` (no navigation, just close modal)

- [ ] US5-I06 Add error handling in GetInTouchModal:
  - [ ] US5-I06a Display error message at top of modal if `feedbackError` exists
  - [ ] US5-I06b Style error message with red background and text (match existing error styles)
  - [ ] US5-I06c Allow user to correct data and retry submission
  - [ ] US5-I06d Clear error message when user starts editing fields

**Checkpoint**: Run tests `npm test -- GetInTouchModal feedbackApi` - all must pass. Manual test: Complete assessment, click "Share Feedback", submit form, verify API call and success modal

---

## Phase 7: Integration & Testing (2-3 days)

**Purpose**: End-to-end testing, bug fixes, performance optimization, accessibility

<!-- ### E2E Tests (Playwright)

- [ ] E2E-01 Write E2E test: Full assessment flow (all 4 tabs)
  - [ ] E2E-01a Start from dashboard, click "Take the Assessment"
  - [ ] E2E-01b Fill WorkforceTab, submit, verify API call, see success modal, navigate to CompensationTab
  - [ ] E2E-01c Fill CompensationTab, submit, verify API call, navigate to BenefitsTab
  - [ ] E2E-01d Fill BenefitsTab, submit, verify API call, navigate to GoalsTab
  - [ ] E2E-01e Fill GoalsTab, submit, verify API call, see final success modal, navigate to dashboard
  - [ ] E2E-01f Verify completionCount = 4, Recommendations and Benchmark visible, "Take the Assessment" hidden

- [ ] E2E-02 Write E2E test: Back button navigation
  - [ ] E2E-02a Complete WorkforceTab, navigate to CompensationTab
  - [ ] E2E-02b Click back button, verify WorkforceTab loads with saved data
  - [ ] E2E-02c Edit data, click Next, verify changes saved and CompensationTab loads

- [ ] E2E-03 Write E2E test: Assessment persistence across page refresh
  - [ ] E2E-03a Fill WorkforceTab partially, refresh page
  - [ ] E2E-03b Verify saved data loads and displays in form fields
  - [ ] E2E-03c Complete WorkforceTab, submit, refresh page
  - [ ] E2E-03d Verify completionCount = 1, CompensationTab accessible

- [ ] E2E-04 Write E2E test: API error handling
  - [ ] E2E-04a Mock API failure for WorkforceTab
  - [ ] E2E-04b Submit form, verify error modal displays
  - [ ] E2E-04c Click "Cancel", verify modal closes and stays on WorkforceTab
  - [ ] E2E-04d Submit again, click "Continue", verify navigation to CompensationTab

- [ ] E2E-05 Write E2E test: Feedback submission
  - [ ] E2E-05a Complete all 4 tabs, navigate to dashboard
  - [ ] E2E-05b Click "Share Feedback", verify GetInTouchModal opens
  - [ ] E2E-05c Fill form with valid data, submit, verify API call
  - [ ] E2E-05d Verify success modal displays, click "Back to Dashboard", modal closes -->

<!-- ### Unit & Component Tests

- [ ] UT-01 Test sequential access control edge cases:
  - [ ] UT-01a Test cannot access BenefitsTab if CompensationTab not complete
  - [ ] UT-01b Test cannot access GoalsTab if BenefitsTab not complete
  - [ ] UT-01c Test can access completed tabs to view/edit

- [ ] UT-02 Test storage persistence edge cases:
  - [ ] UT-02a Test saving data with special characters (quotes, brackets, etc.)
  - [ ] UT-02b Test loading data handles null/undefined gracefully
  - [ ] UT-02c Test clearAssessmentData() clears all tabs correctly

- [ ] UT-03 Test validation edge cases:
  - [ ] UT-03a Test commonJobTitles percentages: 99%, 101%, negative numbers
  - [ ] UT-03b Test nested object validation (healthPlanParticipationRates)
  - [ ] UT-03c Test array field validation (topWorkLocations)

### Performance Testing

- [ ] PT-01 Measure auto-save performance:
  - [ ] PT-01a Use performance profiler to measure storage write time
  - [ ] PT-01b Target: <500ms from blur event to storage write complete
  - [ ] PT-01c If exceeds target: Implement debouncing or throttling

- [ ] PT-02 Measure form rendering performance:
  - [ ] PT-02a Measure time from route change to all fields visible in DOM
  - [ ] PT-02b Target: <1s for all tabs
  - [ ] PT-02c If exceeds target: Implement lazy loading or virtualization

- [ ] PT-03 Test API timeout behavior:
  - [ ] PT-03a Simulate slow network (throttle to 3G in Chrome DevTools)
  - [ ] PT-03b Verify 10-second timeout triggers error modal
  - [ ] PT-03c Verify loading spinner displays during API call

### Accessibility Testing

- [ ] A11Y-01 Test keyboard navigation:
  - [ ] A11Y-01a Tab through all form fields, verify focus order is logical
  - [ ] A11Y-01b Press Enter on buttons, verify correct actions trigger
  - [ ] A11Y-01c Use arrow keys in select/radio fields, verify navigation works
  - [ ] A11Y-01d Trap focus in modals (cannot tab outside modal when open)

- [ ] A11Y-02 Test screen reader support:
  - [ ] A11Y-02a Test with NVDA (Windows) or VoiceOver (Mac)
  - [ ] A11Y-02b Verify all form fields have proper labels (aria-label or <label>)
  - [ ] A11Y-02c Verify error messages are announced when validation fails
  - [ ] A11Y-02d Verify tab states are described ("completed", "locked", "active")

- [ ] A11Y-03 Run axe-core for WCAG 2.1 AA compliance:
  - [ ] A11Y-03a Install @axe-core/react in dev dependencies
  - [ ] A11Y-03b Run axe on AssessmentForm page, fix all violations
  - [ ] A11Y-03c Run axe on Dashboard page, fix all violations
  - [ ] A11Y-03d Target: Zero violations

### Responsive Design Testing

- [ ] RD-01 Test on mobile (320px):
  - [ ] RD-01a Verify form fields stack vertically and are usable
  - [ ] RD-01b Verify buttons are tappable (min 44x44px tap target)
  - [ ] RD-01c Verify modals are readable and scrollable

- [ ] RD-02 Test on tablet (768px):
  - [ ] RD-02a Verify layout adapts to tablet width
  - [ ] RD-02b Verify tab navigation is usable with touch

- [ ] RD-03 Test on desktop (1920px+):
  - [ ] RD-03a Verify form doesn't stretch too wide (max-width constraint)
  - [ ] RD-03b Verify all elements are properly aligned

### Browser Compatibility Testing

- [ ] BC-01 Test on Chrome (latest 2 versions)
- [ ] BC-02 Test on Firefox (latest 2 versions)
- [ ] BC-03 Test on Safari (latest 2 versions)
- [ ] BC-04 Test on Edge (latest 2 versions)
- [ ] BC-05 Verify consistent behavior across all browsers -->

### Bug Fixes

- [ ] BF-01 Review test results and create bug tickets for failures
- [ ] BF-02 Prioritize bugs: P0 (blocking), P1 (high), P2 (medium), P3 (low)
- [ ] BF-03 Fix all P0 and P1 bugs before release
- [ ] BF-04 Re-run tests after fixes to verify resolution

<!-- **Checkpoint**: All tests pass, performance targets met, accessibility violations fixed, responsive design validated

---

## Phase 8: Documentation & Handoff (1 day)

**Purpose**: Document implementation for future maintenance and API integration

- [ ] DOC-01 Create `docs/assessment-storage.md`:
  - [ ] DOC-01a Document AssessmentStorage schema structure
  - [ ] DOC-01b Document storage helper functions (getAssessmentState, saveTabData, etc.)
  - [ ] DOC-01c Document how to clear assessment data on logout

- [ ] DOC-02 Create `docs/assessment-api.md`:
  - [ ] DOC-02a Document all 4 assessment API endpoints (URL, method, request/response format)
  - [ ] DOC-02b Document feedback API endpoint
  - [ ] DOC-02c Document authentication requirements (Authorization header)
  - [ ] DOC-02d Document error responses and handling

- [ ] DOC-03 Create `docs/validation-rules.md`:
  - [ ] DOC-03a Document validation rules per tab (required fields, formats, constraints)
  - [ ] DOC-03b Document custom validators (percentage sum, nested objects)
  - [ ] DOC-03c Document error messages and display patterns

- [ ] DOC-04 Update `README.md`:
  - [ ] DOC-04a Add section describing dashboard-assessment module
  - [ ] DOC-04b Add instructions for running assessment feature
  - [ ] DOC-04c Add troubleshooting section (common issues and solutions)

- [ ] DOC-05 Create `CHANGELOG.md` entry:
  - [ ] DOC-05a List all new features (4-tab assessment, completion tracking, feedback)
  - [ ] DOC-05b List breaking changes (if any)
  - [ ] DOC-05c List known issues (if any)

- [ ] DOC-06 Create TODO for future Recommendations API integration:
  - [ ] DOC-06a Document current static data structure
  - [ ] DOC-06b Document expected API endpoint and response format
  - [ ] DOC-06c Document integration steps (replace static data with API call)

- [ ] DOC-07 Create TODO for future Benchmark API integration:
  - [ ] DOC-07a Document current static data structure
  - [ ] DOC-07b Document expected API endpoint and response format
  - [ ] DOC-07c Document integration steps

- [ ] DOC-08 Code cleanup:
  - [ ] DOC-08a Remove console.log statements
  - [ ] DOC-08b Remove commented-out code
  - [ ] DOC-08c Add TSDoc comments to complex functions
  - [ ] DOC-08d Run ESLint and Prettier: `npm run lint:fix && npm run format`

- [ ] DOC-09 Create pull request:
  - [ ] DOC-09a Write detailed PR description (what, why, how)
  - [ ] DOC-09b Add screenshots of new features
  - [ ] DOC-09c Add testing evidence (test results, Lighthouse scores)
  - [ ] DOC-09d List reviewers and request review

- [ ] DOC-10 Prepare demo video:
  - [ ] DOC-10a Record screen capture of full assessment flow
  - [ ] DOC-10b Record feedback submission flow
  - [ ] DOC-10c Record dashboard display after completion
  - [ ] DOC-10d Annotate with voiceover or text overlays

**Deliverables**: Complete documentation, clean code, approved PR, demo video --> -->

---

## Summary Checklist

### Phase 0: Research & Design ✅
- [ ] All research tasks complete (D001-D010)
- [ ] Documentation artifacts created (storage patterns, field mapping, state machine, validation matrix)

### Phase 1: Foundation ✅
- [ ] All type definitions created (F001-F002)
- [ ] All validation schemas created (F003)
- [ ] Storage layer implemented (F004)
- [ ] API layer implemented (F005-F006)
- [ ] Hooks implemented (F007-F008)
- [ ] `npm run type-check` passes ✅
- [ ] `npm run lint` passes ✅

---

## 📋 Validation & API Integration Implementation Summary

### ✅ Validation Implementation (100% Complete)

#### 1. Zod Schema Layer
**File**: `src/services/validation/assessmentSchemas.ts`

**Workforce Schema**:
- ✅ Required fields: headCountSize, benefitsUpdates, desklessEmployees, etc.
- ✅ Custom percentage validation: `hourlyEmployeesPercentage + salaryEmployeesPercentage === 100%`
- ✅ Conditional validation: commuteTime required when commuteMoreThan15Miles=true
- ✅ Array constraints: max 5 items for commonJobTitles, topWorkLocations
- ✅ Zip code pattern: `/^\d{5}$/`

**Compensation Schema**:
- ✅ 8 fields validated (medianAnnualEarnings, offersAnnualRaises, etc.)
- ✅ Conditional fields based on offersAnnualRaises boolean

**Benefits Schema**:
- ✅ 21 fields with complex nested objects (healthPlanParticipationRates)
- ✅ Percentage validation (0-100 range)
- ✅ Conditional validation for health plan participation

**Goals Schema**:
- ✅ Array validation: min 1, max 5 for workforceGoals
- ✅ Ranking validation for workforceGoalsRanking

#### 2. Component-Level Validation
**File**: `src/components/assessment/DynamicTab.tsx`

**`validateAnswers()` function**:
```typescript
- ✅ Required field checks (from question.validationRules.required)
- ✅ Conditional required checks (conditionalOn + conditionalValue)
- ✅ Numeric min/max validation
- ✅ Array min/max items validation
- ✅ Sum validation for percentage fields (e.g., hourly + salary = 100%)
- ✅ Error state management via setErrors()
- ✅ Validation callback: onValidationChange(isValid)
```

**Error Display**:
- ✅ Real-time inline errors in `DynamicQuestionRenderer`
- ✅ Red text error messages below each field
- ✅ Error clearing on field update

**Exposed API**:
```typescript
window.__dynamicTabValidation = {
  validate: () => boolean,
  getAnswers: () => Record<string, any>,
  isCompleted: boolean,
  isSaving: boolean
}
```

#### 3. Validation Triggers
- ✅ On field change: Auto-clear error for that field
- ✅ On "Next" button: Trigger validateAnswers() → show errors or proceed
- ✅ Before API submission: Final validation pass

---

### ✅ API Integration Implementation (100% Complete)

#### 1. API Service Layer
**File**: `src/services/api/assessmentApi.ts`

**Axios Configuration**:
```typescript
✅ Timeout: 10 seconds
✅ Content-Type: application/json
✅ Request interceptor: Injects auth token from localStorage
✅ Response interceptor: Unified error handling
```

**Endpoints Implemented**:
1. ✅ `submitWorkforce(responses)` → POST `/api/assessment/workforce`
2. ✅ `submitCompensation(responses)` → POST `/api/assessment/compensation`
3. ✅ `submitBenefits(responses)` → POST `/api/assessment/benefits`
4. ✅ `submitGoals(responses)` → POST `/api/assessment/goals`
5. ✅ `submitFeedback(rating, comments)` → POST `/api/assessment/feedback`
6. ✅ `getAssessmentStatus()` → GET `/api/assessment/status`

**Request Format**:
```json
{
  "responses": {
    "headCountSize": "1-50",
    "benefitsUpdates": ["email", "portal"],
    // ... all question answers
  }
}
```

**Response Format**:
```typescript
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
```

**Error Handling**:
- ✅ Network errors: "Network error occurred"
- ✅ Timeout errors: "Request timed out. Please try again."
- ✅ 4xx/5xx errors: Server error message or "An error occurred"
- ✅ Returns `{ success: false, error: message }`

#### 2. Hook Integration
**File**: `src/hooks/useAssessment.ts`

**State Management**:
```typescript
✅ answers: Record<string, any>           // Current form data
✅ errors: Record<string, string>         // Validation errors
✅ isSubmitting: boolean                  // API call in progress
✅ isSaving: boolean                      // Auto-save in progress
✅ isCompleted: boolean                   // Tab marked complete
```

**API Methods**:
```typescript
✅ submitSection(): Promise<ApiResponse>
  - Determines endpoint based on section ("workforce" | "compensation" | "benefits" | "goals")
  - Calls appropriate submit function (submitWorkforce, submitCompensation, etc.)
  - On success: markTabCompleted(section)
  - Returns ApiResponse with success/error
```

**Auto-Save Integration**:
```typescript
✅ updateAnswer(key, value)
  - Updates answers state
  - Triggers autoSaveProgress() with 500ms debounce
  - Sets isSaving=true temporarily
  - Clears field error
```

**Data Persistence**:
```typescript
✅ loadProgress()         // Load from localStorage on mount
✅ saveAssessmentProgress()  // Save to localStorage on change
✅ autoSaveProgress()     // Debounced save (500ms)
```

#### 3. Component Integration
**File**: `src/components/assessment/DynamicTab.tsx`

**Workflow**:
1. ✅ Mount → loadProgress() → restore saved answers
2. ✅ Field change → updateAnswer() → auto-save (500ms)
3. ✅ Click "Next" → validateAnswers() → submitSection()
4. ✅ Success → markTabCompleted() → show success modal → navigate
5. ✅ Error → show error modal → stay on tab or continue

**Visual Indicators**:
```tsx
✅ {isSaving && <div>Saving...</div>}
✅ {isCompleted && <div>✓ Section completed</div>}
✅ {errors[key] && <p className="text-red-600">{errors[key]}</p>}
```

---

### 🔗 End-to-End Flow Example

**User completes Workforce tab:**

1. **Page Load**:
   - DynamicTab mounts → useAssessment loads saved data
   - `loadProgress()` → `loadSectionProgress("workforce")` → restore answers

2. **Field Interactions**:
   - User types "1-50" in headCountSize
   - `handleAnswerChange("headCountSize", "1-50")`
   - `updateAnswer()` → `setAnswers({...prev, headCountSize: "1-50"})`
   - Auto-save triggers after 500ms → `saveAssessmentProgress("workforce", {...})`
   - Visual: "Saving..." → "Saved"

3. **Validation**:
   - User clicks "Next" button
   - `validateAnswers()` runs:
     - Checks required fields
     - Checks hourly + salary percentages = 100%
     - Checks conditional fields (commuteTime if needed)
   - If errors: Display inline red text, prevent submission
   - If valid: Proceed to API call

4. **API Submission**:
   - `submitSection()` → `submitWorkforce(answers)`
   - POST `/api/assessment/workforce` with Authorization header
   - Body: `{ "responses": {...answers} }`
   - Loading state: `isSubmitting=true` (disable button, show spinner)

5. **Success Response**:
   - `{ success: true, data: {...} }`
   - `markTabCompleted("workforce")`
   - Show success modal: "You're done! See your results..."
   - User clicks "Continue" → Navigate to `/assessment?tab=compensation`

6. **Error Response**:
   - `{ success: false, error: "Network error" }`
   - Show error modal: "Uh-oh... Are you sure you want to proceed?"
   - User clicks "Cancel" → Stay on workforce tab
   - User clicks "Continue" → Navigate to compensation tab anyway

---

### 🚀 Ready for Phase 2 Integration

**What's Complete**:
✅ All validation schemas (Zod)
✅ All API endpoints (4 sections + feedback)
✅ State management hook (useAssessment)
✅ Auto-save (500ms debounce)
✅ Error handling (unified)
✅ Type safety (TypeScript interfaces)
✅ Component validation (DynamicTab.validateAnswers)

**What's Needed for Phase 2**:
- [ ] Integrate "Next" button with validateAnswers() + submitSection()
- [ ] Add BaseModalWithIcon for success/error modals
- [ ] Connect tab navigation (Workforce → Compensation → Benefits → Goals)
- [ ] Add visual loading states (spinner on button)
- [ ] Test full workflow: fill form → validate → submit → modal → navigate

**Ready for Testing**: ✅ YES - All infrastructure complete!

---

## 🧪 Validation & API Integration Test Checklist

### Manual Testing Guide

**Prerequisites**:
```bash
pnpm run type-check  # Should pass with 0 errors
pnpm run dev         # Start dev server
```

### 1. Validation Testing

#### Test 1.1: Required Field Validation
- [ ] Navigate to WorkforceTab
- [ ] Leave headCountSize empty, click "Next"
- [ ] ✅ EXPECT: Red error message "This field is required"
- [ ] Fill headCountSize, error disappears

#### Test 1.2: Percentage Sum Validation
- [ ] Set hourlyEmployeesPercentage = 60
- [ ] Set salaryEmployeesPercentage = 30 (total = 90, not 100)
- [ ] Click "Next"
- [ ] ✅ EXPECT: Error "Hourly and salary percentages must sum to 100%"
- [ ] Change salaryEmployeesPercentage = 40 (total = 100)
- [ ] ✅ EXPECT: Error clears

#### Test 1.3: Conditional Field Validation
- [ ] Select commuteMoreThan15Miles = "Yes"
- [ ] Leave commuteTime empty
- [ ] ✅ EXPECT: Error "Please select commute methods"
- [ ] Select at least one commuteTime option
- [ ] ✅ EXPECT: Error clears

#### Test 1.4: Array Max Items Validation
- [ ] Add 6 commonJobTitles entries
- [ ] ✅ EXPECT: "Add another" button disabled after 5 items
- [ ] Or error "Maximum 5 job titles allowed"

#### Test 1.5: Real-time Error Clearing
- [ ] Trigger required field error
- [ ] Start typing in the field
- [ ] ✅ EXPECT: Error disappears immediately on field change

### 2. Auto-Save Testing

#### Test 2.1: Auto-Save Trigger
- [ ] Type in headCountSize field
- [ ] Wait 500ms
- [ ] ✅ EXPECT: "Saving..." indicator appears briefly
- [ ] Check localStorage: `assessment_progress_workforce` key should exist
- [ ] ✅ EXPECT: JSON contains `{ "headCountSize": "..." }`

#### Test 2.2: Auto-Save Persistence
- [ ] Fill multiple fields
- [ ] Wait for auto-save
- [ ] Refresh page
- [ ] ✅ EXPECT: All field values restored from localStorage

#### Test 2.3: Auto-Save Debounce
- [ ] Type quickly in a field
- [ ] ✅ EXPECT: "Saving..." only appears after 500ms of no typing
- [ ] Not on every keystroke

### 3. API Integration Testing

#### Test 3.1: Auth Token Injection
- [ ] Open browser DevTools → Network tab
- [ ] Submit WorkforceTab (with valid data)
- [ ] Find POST request to `/api/assessment/workforce`
- [ ] ✅ EXPECT: Request headers contain `Authorization: Bearer <token>`

#### Test 3.2: Request Format
- [ ] Check request payload in Network tab
- [ ] ✅ EXPECT: Body structure:
```json
{
  "responses": {
    "headCountSize": "1-50",
    "benefitsUpdates": ["email"],
    "desklessEmployees": true,
    // ... all answers
  }
}
```

#### Test 3.3: Success Response Handling
- [ ] Submit valid form (assuming API returns 200)
- [ ] ✅ EXPECT: Success modal appears "You're done!"
- [ ] ✅ EXPECT: localStorage `assessment_completion` updated
- [ ] ✅ EXPECT: workforceCompleted = true
- [ ] ✅ EXPECT: completionCount incremented

#### Test 3.4: Error Response Handling
- [ ] Submit form (simulate API error - disconnect network or use invalid token)
- [ ] ✅ EXPECT: Error modal appears "Uh-oh..."
- [ ] ✅ EXPECT: Options: "Cancel" or "Continue"
- [ ] Click "Cancel"
- [ ] ✅ EXPECT: Modal closes, stay on WorkforceTab

#### Test 3.5: Timeout Handling
- [ ] Throttle network to slow 3G (DevTools)
- [ ] Submit form
- [ ] Wait 10 seconds
- [ ] ✅ EXPECT: Error modal "Request timed out. Please try again."

#### Test 3.6: Loading States
- [ ] Submit form
- [ ] ✅ EXPECT: "Next" button disabled during API call
- [ ] ✅ EXPECT: Spinner or loading indicator visible
- [ ] After response: Button re-enabled

### 4. State Management Testing

#### Test 4.1: Multi-Section Isolation
- [ ] Fill WorkforceTab, auto-save
- [ ] Navigate to CompensationTab
- [ ] Fill CompensationTab, auto-save
- [ ] Navigate back to WorkforceTab
- [ ] ✅ EXPECT: WorkforceTab data still present
- [ ] Navigate to CompensationTab
- [ ] ✅ EXPECT: CompensationTab data still present
- [ ] localStorage should have separate keys:
  - `assessment_progress_workforce`
  - `assessment_progress_compensation`

#### Test 4.2: Completion Status Tracking
- [ ] Check localStorage `assessment_completion`
- [ ] ✅ EXPECT: Default state:
```json
{
  "workforceCompleted": false,
  "compensationCompleted": false,
  "benefitsCompleted": false,
  "goalsCompleted": false,
  "completionCount": 0
}
```
- [ ] Submit WorkforceTab successfully
- [ ] ✅ EXPECT: `workforceCompleted: true`, `completionCount: 1`

#### Test 4.3: Error State Persistence
- [ ] Trigger validation error
- [ ] Reload page
- [ ] ✅ EXPECT: Errors do NOT persist (fresh validation on submit)

### 5. Component Integration Testing

#### Test 5.1: DynamicQuestionRenderer Integration
- [ ] Verify all 11 question types render correctly:
  - [x] SINGLE_SELECT (radio buttons)
  - [x] YES_NO (radio with conditional)
  - [x] NUMERIC (number input)
  - [x] SINGLE_SELECT_DROPDOWN (select dropdown)
  - [x] STRUCTURED_ARRAY (dynamic array with add/remove)
  - [x] TEXT_INPUT (text field)
  - [x] MULTIPLE_CHECKBOX (checkboxes)
  - [x] GROUPED_CHECKBOX (grouped checkboxes)
  - [x] MULTIPLE_CHOICE (multi-select)
  - [x] RANKING (drag/drop or numbered)
  - [x] PARTICIPATION_RATES (nested object fields)

#### Test 5.2: Conditional Question Rendering
- [ ] Select YES_NO question with conditional
- [ ] Select "Yes"
- [ ] ✅ EXPECT: Conditional question appears below
- [ ] Select "No"
- [ ] ✅ EXPECT: Conditional question hides

#### Test 5.3: Dynamic Tab Wrapper
- [ ] Navigate to each tab:
  - `/assessment?tab=workforce` → WorkforceTab
  - `/assessment?tab=compensation` → CompensationTab
  - `/assessment?tab=benefits` → BenefitsTab
  - `/assessment?tab=goals` → GoalsTab
- [ ] ✅ EXPECT: All render with correct section name and description
- [ ] ✅ EXPECT: All have white card background with padding

### 6. Error Edge Cases

#### Test 6.1: Empty Form Submission
- [ ] Leave all fields empty
- [ ] Click "Next"
- [ ] ✅ EXPECT: Multiple inline errors for all required fields
- [ ] ✅ EXPECT: Submission blocked

#### Test 6.2: Partial Form Submission
- [ ] Fill only half the required fields
- [ ] Click "Next"
- [ ] ✅ EXPECT: Errors only for unfilled required fields
- [ ] ✅ EXPECT: Valid fields retain their values

#### Test 6.3: Invalid Data Types
- [ ] Enter text in numeric field (e.g., "abc" in hourlyEmployeesPercentage)
- [ ] ✅ EXPECT: Validation error or input blocked

#### Test 6.4: API Endpoint Not Found (404)
- [ ] Change API base URL to invalid endpoint
- [ ] Submit form
- [ ] ✅ EXPECT: Error modal with appropriate message

---

### ✅ Test Results Summary

**To complete testing, run through all scenarios above and mark as complete:**

- [ ] All validation rules working (1.1 - 1.5)
- [ ] Auto-save functioning (2.1 - 2.3)
- [ ] API calls formatted correctly (3.1 - 3.6)
- [ ] State management isolated (4.1 - 4.3)
- [ ] Components integrated (5.1 - 5.3)
- [ ] Edge cases handled (6.1 - 6.4)

**Current Status**: 
- ✅ Foundation code complete
- ⏳ Manual testing in progress
- 🚀 Ready for Phase 2 integration

---

### Phase 2: User Story 1 ✅
- [ ] All tests written and passing (US1-T01 to US1-T07)
- [ ] AssessmentButton component complete (US1-I01)
- [ ] TabNavigation component complete (US1-I02)
- [ ] FormFieldRenderer component complete (US1-I03)
- [ ] WorkforceTab component complete (US1-I04)
- [ ] AssessmentForm page complete (US1-I05)
- [ ] Dashboard updated (US1-I06)

### Phase 3: User Story 2 ✅
- [ ] All tests written and passing (US2-T01 to US2-T15)
- [ ] Auto-save implemented (US2-I01)
- [ ] Data restoration implemented (US2-I02)
- [ ] Percentage validation implemented (US2-I03)
- [ ] Submit logic implemented (US2-I04 to US2-I05)
- [ ] Success modal implemented (US2-I06)
- [ ] Error modal implemented (US2-I07)
- [ ] Manual API test successful ✅

### Phase 4: User Story 3 ✅
- [ ] All tests written and passing (US3-T01 to US3-T16)
- [ ] CompensationTab complete (US3-I01 to US3-I02)
- [ ] BenefitsTab complete (US3-I03 to US3-I04)
- [ ] GoalsTab complete (US3-I05 to US3-I06)
- [ ] BackButton complete (US3-I07 to US3-I08)
- [ ] TabNavigation enhancements complete (US3-I09)
- [ ] Tab routing complete (US3-I10)
- [ ] E2E test: Complete all 4 tabs ✅

### Phase 5: User Story 4 ✅
- [ ] All tests written and passing (US4-T01 to US4-T07)
- [ ] Dashboard conditional rendering (US4-I01)
- [ ] Recommendations section displayed (US4-I02)
- [ ] Benchmark section displayed (US4-I03)
- [ ] Share Feedback button added (US4-I04)
- [ ] Manual test: Set count=4, verify display ✅

### Phase 6: User Story 5 ✅
- [ ] All tests written and passing (US5-T01 to US5-T15)
- [ ] Share Feedback button functional (US5-I01)
- [ ] GetInTouchModal integrated (US5-I02)
- [ ] Validation schemas imported (US5-I03)
- [ ] Submission handler implemented (US5-I04)
- [ ] Success modal implemented (US5-I05)
- [ ] Error handling implemented (US5-I06)
- [ ] Manual test: Submit feedback ✅

### Phase 7: Integration & Testing ✅
- [ ] All E2E tests written and passing (E2E-01 to E2E-05)
- [ ] All unit tests passing (UT-01 to UT-03)
- [ ] Performance targets met (PT-01 to PT-03):
  - [ ] Auto-save <500ms ✅
  - [ ] Form rendering <1s ✅
  - [ ] API timeout 10s ✅
- [ ] Accessibility validated (A11Y-01 to A11Y-03):
  - [ ] Keyboard navigation ✅
  - [ ] Screen reader support ✅
  - [ ] axe-core zero violations ✅
- [ ] Responsive design validated (RD-01 to RD-03) ✅
- [ ] Browser compatibility validated (BC-01 to BC-05) ✅
- [ ] All bugs fixed (BF-01 to BF-04)

### Phase 8: Documentation & Handoff ✅
- [ ] All documentation created (DOC-01 to DOC-07)
- [ ] Code cleanup complete (DOC-08)
- [ ] Pull request created (DOC-09)
- [ ] Demo video prepared (DOC-10)
- [ ] Stakeholder approval received ✅

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
