# Implementation Plan: Dashboard Assessment Module

**Branch**: `003-dashboard-assessment` | **Date**: 06 February 2026 | **Spec**: [dashboard.spec.md](dashboard.spec.md)

## Summary

**Frontend Implementation** - Build multi-tab assessment form with sequential API integration, completion tracking, and post-assessment results display. Features include: 4 sequential tabs (Workforce, Compensation, Benefits, Goals) each with dedicated API endpoint, auto-save on field change (Profile Settings pattern), validation before submission, success/error modals per tab, completion counter (0-4) on dashboard button, back button navigation with data restoration, and conditional display of Recommendations/Benchmark sections after completion. Feedback feature uses existing GetInTouchModal with registration form validation patterns.

**Backend APIs**: Already implemented and available. Frontend consumes 4 REST API endpoints for assessment tabs plus 1 feedback endpoint.

## Technical Context

**Language/Version**: TypeScript with React 19+, strict mode enabled  
**Primary Dependencies**: React Hook Form (form state management), Zod (validation), Axios (HTTP client), React Router v7 (navigation), Tailwind CSS 4+, shadcn/ui components  
**Storage**: Use existing storage pattern from Auth and Profile Settings modules (DO NOT add new configuration)  
**Testing**: Jest (unit tests), React Testing Library (component tests), Integration tests with Playwright  
**Target Platform**: Web application (mobile, tablet, desktop browsers - Chrome, Firefox, Safari, Edge)  
**Project Type**: Single-page web application (frontend only, consumes backend REST API)  
**Performance Goals**: Tab rendering <1s, auto-save <500ms, validation feedback <200ms, API calls timeout at 10s, WCAG 2.1 Level AA compliance  
**Constraints**: Sequential tab access only (no jumping), percentage fields must sum to 100%, reuse existing modals (BaseModalWithIcon, GetInTouchModal), reuse existing Recommendations/Benchmark designs without modification  
**Scale/Scope**: 4 assessment tabs (dynamic form rendering from JSON), 4 API endpoints, 1 feedback endpoint, ~15-20 React components, completion tracking (0-4), conditional dashboard display

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*




### Component Structure

```
src/
├── components/
│   ├── dashboard/
│   │   ├── FormFieldRenderer.tsx         # Dynamic field rendering from JSON
│   │   ├── RecommendationsSection.tsx    # Existing component (no changes)
│   │   └── BenchmarkSection.tsx          # Existing component (no changes)
│   ├── modals/
│   │   ├── BaseModalWithIcon.tsx         # Existing (reuse for success/error)
│   │   └── GetInTouchModal.tsx           # Existing (reuse for feedback)
│   └── shared/
│       └── ErrorMessage.tsx              # Existing (reuse for validation)
├── services/
│   ├── api/
│   │   ├── assessmentApi.ts              # API calls for 4 assessment endpoints
│   │   └── feedbackApi.ts                # API call for feedback endpoint
│   ├── validation/
│   │   ├── assessmentSchemas.ts          # Zod schemas for assessment forms
│   │   └── authSchemas.ts                # Existing (reuse for feedback validation)
│   └── storage/
│       └── assessmentStorage.ts          # Helper functions using existing storage pattern
├── hooks/
│   ├── useAssessment.ts                  # Assessment state management hook
│   ├── useTabNavigation.ts               # Tab access control and progression logic
│   └── useAuth.ts                        # Existing (for auth tokens)
├── types/
│   ├── assessmentTypes.ts                # TypeScript interfaces for assessment responses
│   └── dashboardTypes.ts                 # Dashboard-specific types
├── pages/
│   └── dashboard/
│       ├── index.tsx                     # Main dashboard page (update for conditional display)
│       └── AssessmentForm.tsx            # Assessment form page with tabs
└── config/
    └── assessmentFields.json             # Form field configuration (provided)
```

### Data Flow

```
1. Dashboard Load
   ├─ Read completionCount from storage
   ├─ Display "[count] Take the Assessment" if count < 4
   ├─ If count === 4: Show Recommendations + Benchmark sections
   └─ Hide email verification section if count === 4

2. Start/Continue Assessment
   ├─ User clicks "Take the Assessment" or "Continue"
   ├─ Navigate to assessment form
   ├─ Load assessmentFields.json
   ├─ Determine active tab based on completionCount
   └─ Load saved form data from storage

3. Fill Out Tab
   ├─ User enters data in form fields
   ├─ On blur event: Auto-save to storage (Profile Settings pattern)
   ├─ Validation runs on blur (inline errors)
   └─ Data persists across page refreshes

4. Submit Tab
   ├─ User clicks "Next" or "Submit"
   ├─ Client-side validation (all required fields, percentages sum to 100%)
   ├─ If invalid: Show inline errors, prevent submission
   ├─ If valid: Format data as { "responses": {...} }
   ├─ POST to /api/v1/assessment/{tabName}
   ├─ Set 10-second timeout
   └─ Handle response

5. Success Response
   ├─ Show BaseModalWithIcon (type: success)
   ├─ Update storage: apiSuccess.{tabName} = true
   ├─ Increment completionCount
   ├─ Unlock next tab
   ├─ User clicks modal button
   ├─ If last tab: Navigate to dashboard
   └─ Else: Navigate to next tab

6. Error Response
   ├─ Show BaseModalWithIcon (type: error)
   ├─ User clicks "Cancel": Stay on tab
   ├─ User clicks "Continue": Proceed to next tab without API success
   └─ Data remains in storage for retry later

7. Back Button
   ├─ User clicks back button (on tabs 2-4)
   ├─ Navigate to previous tab
   ├─ Load saved data from storage
   └─ Display in form fields

8. Assessment Complete (count === 4)
   ├─ User navigates to dashboard
   ├─ Hide "Take the Assessment" button
   ├─ Hide email verification section
   ├─ Show Recommendations section (static data)
   ├─ Show Benchmark section (static data)
   └─ Show "Share Feedback" button

9. Share Feedback
   ├─ User clicks "Share Feedback"
   ├─ Open GetInTouchModal
   ├─ User fills form (firstName, lastName, email, phone)
   ├─ Validate using Auth module schemas
   ├─ POST to /api/v1/feedback
   ├─ On success: Show success modal
   └─ On error: Show inline error in modal
```

### Storage Schema

```typescript
// Use existing storage from Auth/Profile Settings
// DO NOT create new storage config

interface AssessmentStorage {
  assessment: {
    completedTabs: Array<'WorkforceTab' | 'CompensationTab' | 'BenefitsTab' | 'GoalsTab'>;
    currentTab: 'WorkforceTab' | 'CompensationTab' | 'BenefitsTab' | 'GoalsTab' | null;
    completionCount: number; // 0-4
    formData: {
      WorkforceTab: WorkforceResponses | null;
      CompensationTab: CompensationResponses | null;
      BenefitsTab: BenefitsResponses | null;
      GoalsTab: GoalsResponses | null;
    };
    apiSuccess: {
      WorkforceTab: boolean;
      CompensationTab: boolean;
      BenefitsTab: boolean;
      GoalsTab: boolean;
    };
    lastUpdated: string; // ISO timestamp
  };
}
```

---

## Phase Breakdown

### Phase 0: Research & Design (1-2 days)

**Purpose**: Understand existing patterns and design new components

**Tasks**:
1. Review Auth module storage implementation (`src/services/storage/`, `src/hooks/useAuth.ts`)
2. Review Profile Settings auto-save pattern (`src/pages/settings/`, watch for field change handlers)
3. Analyze existing BaseModalWithIcon props and usage
4. Analyze existing GetInTouchModal props and usage
5. Review Recommendations and Benchmark components (current design/structure)
6. Parse provided assessmentFields.json and map to component structure
7. Design form field mapping strategy (JSON field type → React component)
8. Design tab navigation state machine (WorkforceTab → CompensationTab → BenefitsTab → GoalsTab)
9. Design validation strategy per tab (required fields, percentages, nested objects)
10. Create wireframes for tab layout, back button placement, completion counter display

**Deliverables**:
- Storage pattern documentation (how to reuse existing config)
- Component hierarchy diagram
- Field type mapping table (JSON → React components)
- Tab state machine diagram
- Validation rules matrix per tab

---

### Phase 1: Foundation (2-3 days)

**Purpose**: Core infrastructure that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

**Tasks**:
1. Create TypeScript types in `src/types/assessmentTypes.ts`:
   - `WorkforceResponses`, `CompensationResponses`, `BenefitsResponses`, `GoalsResponses`
   - `AssessmentTab`, `AssessmentState`, `TabSubmissionResult`
2. Create TypeScript types in `src/types/dashboardTypes.ts`:
   - `CompletionCounter`, `TabNavigationState`, `FeedbackFormData`
3. Create Zod validation schemas in `src/services/validation/assessmentSchemas.ts`:
   - `workforceSchema`, `compensationSchema`, `benefitsSchema`, `goalsSchema`
   - Include percentage sum validation (must equal 100%)
   - Include nested object/array validation
4. Create storage helper in `src/services/storage/assessmentStorage.ts`:
   - `getAssessmentState()`, `saveTabData()`, `updateCompletionCount()`, `markTabComplete()`
   - Use existing storage pattern from Auth/Profile Settings (DO NOT create new config)
5. Create API functions in `src/services/api/assessmentApi.ts`:
   - `submitWorkforce()`, `submitCompensation()`, `submitBenefits()`, `submitGoals()`
   - Set baseURL, timeout (10s), Authorization header (from useAuth)
6. Create API function in `src/services/api/feedbackApi.ts`:
   - `submitFeedback()`
7. Create `useAssessment` hook in `src/hooks/useAssessment.ts`:
   - Manage assessment state (completionCount, currentTab, formData)
   - Provide functions: `loadTabData()`, `saveTabData()`, `submitTab()`
8. Create `useTabNavigation` hook in `src/hooks/useTabNavigation.ts`:
   - Sequential access control logic
   - Functions: `canAccessTab()`, `goToNextTab()`, `goToPreviousTab()`

**Checkpoint**: Foundation complete - user story implementation can begin

---

### Phase 2: User Story 1 - Assessment Initiation (2 days) 🎯 P1

**Goal**: Users can see "Take the Assessment" button and navigate to assessment form

**Independent Test**: Dashboard displays button, click navigates to WorkforceTab with form fields rendered

**Tasks**:

#### Tests (Write FIRST - TDD)
1. **T101**: Test AssessmentButton displays "Take the Assessment" when completionCount = 0
2. **T102**: Test AssessmentButton displays "[count] Take the Assessment" when count > 0
3. **T103**: Test button click navigates to `/assessment`
4. **T104**: Test WorkforceTab form renders all fields from JSON
5. **T105**: Test only WorkforceTab is accessible, other tabs are locked

#### Implementation
6. **T106**:already design and navigation done
   - Display counter if count > 0
   - Button text: "Take the Assessment" (count=0) or "Continue" (count>0)
   - onClick: Navigate to `/assessment`
7. **T107**: already design and navigation done
   - Display 4 tabs: Workforce, Compensation, Benefits, Goals
   - Apply sequential access control (use useTabNavigation hook)
   - Visual indicators: active, completed, locked
8. **T108**: Create `FormFieldRenderer.tsx` component
   - Parse JSON field config
   - Map field types to React components (text → Input, select → Select, checkbox → Checkbox, etc.)
   - Handle nested arrays and objects
9. **T109**: Create `WorkforceTab.tsx` component
   - Import FormFieldRenderer
   - Render fields for WorkforceTab from assessmentFields.json
   - Integrate React Hook Form for state management
10. **T110**: Update `src/pages/dashboard/index.tsx`
    - Add AssessmentButton component to dashboard
    - Conditional rendering based on completionCount

**Checkpoint**: User Story 1 complete - users can start assessment and see first tab

---

### Phase 3: User Story 2 - WorkforceTab Submission (3 days) 🎯 P1

**Goal**: Users can fill WorkforceTab, auto-save data, submit to API, see success/error modal

**Independent Test**: Fill WorkforceTab, submit, verify API call, confirm modal and progression

**Tasks**:

#### Tests (Write FIRST - TDD)
1. **T201**: Test field data auto-saves to storage on blur event
2. **T202**: Test saved data loads when navigating back to WorkforceTab
3. **T203**: Test commonJobTitles percentages validation (must sum to 100%)
4. **T204**: Test required field validation prevents submission
5. **T205**: Test API call format: `POST /api/v1/assessment/workforce` with `{ "responses": {...} }`
6. **T206**: Test success modal displays on successful API response
7. **T207**: Test completion counter increments to 1 on success
8. **T208**: Test CompensationTab unlocks after WorkforceTab success
9. **T209**: Test error modal displays on API failure
10. **T210**: Test "Cancel" button keeps user on WorkforceTab
11. **T211**: Test "Continue" button proceeds to CompensationTab without API success

#### Implementation
12. **T212**: Add auto-save logic to WorkforceTab.tsx
    - Watch field changes with React Hook Form
    - Call saveTabData() on blur event
    - Debounce to prevent excessive writes
13. **T213**: Add data restoration logic to WorkforceTab.tsx
    - Call loadTabData() on component mount
    - Populate form fields with saved values
14. **T214**: Add percentage sum validation
    - Custom Zod validator for commonJobTitles field
    - Display inline error if sum !== 100%
15. **T215**: Add "Next" button to WorkforceTab.tsx
    - Trigger form validation on click
    - If valid: Call submitTab() from useAssessment hook
    - If invalid: Display inline errors, prevent submission
16. **T216**: Implement submitTab() in useAssessment hook for WorkforceTab
    - Format form data as `{ "responses": {...} }`
    - Call assessmentApi.submitWorkforce()
    - Handle success: Update storage (apiSuccess.WorkforceTab = true), increment count
    - Handle error: Show error modal
17. **T217**: Add success modal trigger
    - Use BaseModalWithIcon component
    - Props: type='success', title='You're done!', subtitle='See your results...'
    - Button action: Close modal, navigate to CompensationTab
18. **T218**: Add error modal trigger
    - Use BaseModalWithIcon component
    - Props: type='error', title='Uh-oh', subtitle='You have not filled...'
    - Buttons: Cancel (close modal), Continue (proceed to next tab)

**Checkpoint**: User Story 2 complete - WorkforceTab fully functional with API integration

---

### Phase 4: User Story 3 - Sequential Tab Progression (4 days) 🎯 P1

**Goal**: Users can complete CompensationTab, BenefitsTab, GoalsTab in sequence with same workflow

**Independent Test**: Complete all tabs sequentially, verify each API call, check counter increments, confirm navigation

**Tasks**:

#### Tests (Write FIRST - TDD)
1. **T301**: Test CompensationTab renders after WorkforceTab success
2. **T302**: Test back button appears on CompensationTab
3. **T303**: Test back button navigates to WorkforceTab with saved data
4. **T304**: Test CompensationTab API call: `POST /api/v1/assessment/compensation`
5. **T305**: Test completion counter increments to 2 after CompensationTab success
6. **T306**: Test BenefitsTab unlocks after CompensationTab success
7. **T307**: Test BenefitsTab API call: `POST /api/v1/assessment/benefits`
8. **T308**: Test completion counter increments to 3 after BenefitsTab success
9. **T309**: Test GoalsTab unlocks after BenefitsTab success
10. **T310**: Test GoalsTab submit button says "Submit" not "Next"
11. **T311**: Test GoalsTab API call: `POST /api/v1/assessment/goals`
12. **T312**: Test completion counter increments to 4 after GoalsTab success
13. **T313**: Test final success modal button says "Go to Dashboard"
14. **T314**: Test navigation to dashboard after GoalsTab completion

#### Implementation
15. **T315**: Create `CompensationTab.tsx` component
    - Same structure as WorkforceTab
    - Render fields from assessmentFields.json
    - Auto-save, validation, API submission
16. **T316**: Create `BenefitsTab.tsx` component
    - Same structure as WorkforceTab
    - Render fields from assessmentFields.json
    - Auto-save, validation, API submission
17. **T317**: Create `GoalsTab.tsx` component
    - Same structure as WorkforceTab
    - Render fields from assessmentFields.json
    - Button text: "Submit" instead of "Next"
18. **T318**: Create `BackButton.tsx` component
    - Display on tabs 2-4 only (not WorkforceTab)
    - onClick: Call goToPreviousTab() from useTabNavigation hook
    - Load saved data from storage
19. **T319**: Update useAssessment hook
    - Add submitCompensation(), submitBenefits(), submitGoals()
    - Follow same pattern as submitWorkforce()
20. **T320**: Update TabNavigation.tsx
    - Add checkmarks to completed tabs
    - Enable click on completed tabs to view/edit
21. **T321**: Update completion counter logic
    - Increment after each successful API response
    - Store in assessmentStorage
22. **T322**: Add final tab success modal logic
    - If tabName === 'GoalsTab': Button text = "Go to Dashboard"
    - Button action: Navigate to `/dashboard`
23. **T323**: Add tab completion indicators
    - Display checkmark icon on completed tabs in TabNavigation
    - Allow clicking completed tabs to navigate back

**Checkpoint**: User Story 3 complete - all 4 tabs functional with sequential progression

---

### Phase 5: User Story 4 - Dashboard Post-Completion Display (2 days) 🎯 P2

**Goal**: Dashboard displays Recommendations and Benchmark sections after assessment completion

**Independent Test**: Set completionCount = 4, load dashboard, verify assessment button hidden, Recommendations/Benchmark visible

**Tasks**:

#### Tests (Write FIRST - TDD)
1. **T401**: Test "Take the Assessment" button hidden when completionCount = 4
2. **T402**: Test email verification section hidden when completionCount = 4
3. **T403**: Test Recommendations section displayed when completionCount = 4
4. **T404**: Test Benchmark section displayed when completionCount = 4
5. **T405**: Test "Share Feedback" button visible when completionCount = 4

#### Implementation
6. **T406**: Update `src/pages/dashboard/index.tsx`
   - Add conditional rendering based on completionCount
   - If count < 4: Show AssessmentButton, show email verification (if needed)
   - If count === 4: Hide AssessmentButton, hide email verification
7. **T407**: Import RecommendationsSection component
   - Render when completionCount === 4
   - Use existing component without modifications
   - Display static data
8. **T408**: Import BenchmarkSection component
   - Render when completionCount === 4
   - Use existing component without modifications
   - Display static data
9. **T409**: Add "Share Feedback" button
   - Display when completionCount === 4
   - onClick: Open GetInTouchModal

**Checkpoint**: User Story 4 complete - dashboard displays results after completion

---

### Phase 6: User Story 5 - Share Feedback (2 days) 🎯 P2

**Goal**: Users can submit feedback via GetInTouchModal with registration validation

**Independent Test**: Click "Share Feedback", fill form, submit, verify API call and success modal

**Tasks**:

#### Tests (Write FIRST - TDD)
1. **T501**: Test "Share Feedback" button opens GetInTouchModal
2. **T502**: Test feedback form validates firstName (same as registration)
3. **T503**: Test feedback form validates lastName (same as registration)
4. **T504**: Test feedback form validates email (same as registration)
5. **T505**: Test feedback form validates phone (same as registration)
6. **T506**: Test API call format: `POST /api/v1/feedback` with `{ firstName, lastName, email, phone }`
7. **T507**: Test success modal displays after successful feedback submission
8. **T508**: Test "Back to Dashboard" button closes modal without reload
9. **T509**: Test error message displays in modal on API failure
10. **T510**: Test modal remains open for retry on error

#### Implementation
11. **T511**: Update dashboard.tsx to add "Share Feedback" button
    - Display when completionCount === 4
    - State: `const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false)`
    - onClick: `setIsFeedbackModalOpen(true)`
12. **T512**: Import and render GetInTouchModal
    - Pass `isOpen={isFeedbackModalOpen}` and `onClose={...}` props
    - Use existing component without modifications
13. **T513**: Import validation schemas from Auth module
    - Import `firstNameSchema`, `lastNameSchema`, `emailSchema`, `phoneSchema` from `authSchemas.ts`
    - Apply to feedback form fields
14. **T514**: Implement feedback submission handler
    - Create `handleFeedbackSubmit` function
    - Call `feedbackApi.submitFeedback()`
    - On success: Close GetInTouchModal, show success modal
    - On error: Display error in GetInTouchModal
15. **T515**: Add success modal for feedback
    - Use BaseModalWithIcon component
    - Props: type='success', title='Feedback sent', subtitle='Thanks for sharing...'
    - Button: "Back to Dashboard" closes modal (no navigation)
16. **T516**: Add error handling in GetInTouchModal
    - Display inline error message at top of modal
    - Keep modal open
    - Allow user to retry submission

**Checkpoint**: User Story 5 complete - feedback feature fully functional

---

### Phase 7: Integration & Testing (2-3 days)

**Purpose**: End-to-end testing, bug fixes, performance optimization

**Tasks**:
1. **T601**: Write Playwright E2E test for full assessment flow (all 4 tabs)
2. **T602**: Write Playwright E2E test for feedback submission
3. **T603**: Test sequential tab access control edge cases
4. **T604**: Test storage persistence across page refreshes
5. **T605**: Test auto-save performance (measure write time <500ms)
6. **T606**: Test form rendering performance (measure <1s)
7. **T607**: Test API timeout behavior (10-second limit)
8. **T608**: Test validation edge cases (percentages, nested objects)
9. **T609**: Test accessibility with screen reader (NVDA/JAWS)
10. **T610**: Test keyboard navigation (Tab, Enter, Arrow keys)
11. **T611**: Test responsive design on mobile (320px), tablet (768px), desktop (1920px)
12. **T612**: Test browser compatibility (Chrome, Firefox, Safari, Edge)
13. **T613**: Run axe-core for WCAG 2.1 AA compliance
14. **T614**: Performance profiling (Lighthouse, Core Web Vitals)
15. **T615**: Fix bugs identified in testing
16. **T616**: Code review and refactoring

**Checkpoint**: All user stories tested, bugs fixed, performance validated

---

### Phase 8: Documentation & Handoff (1 day)

**Purpose**: Document implementation for future maintenance and API integration

**Tasks**:
1. **T701**: Document storage schema in `docs/assessment-storage.md`
2. **T702**: Document API request/response formats in `docs/assessment-api.md`
3. **T703**: Update README.md with assessment feature description
4. **T704**: Create CHANGELOG.md entry for dashboard-assessment module
5. **T705**: Document validation rules per tab in `docs/validation-rules.md`
6. **T706**: Create TODO for future Recommendations API integration
7. **T707**: Create TODO for future Benchmark API integration
8. **T708**: Code cleanup and final ESLint/Prettier pass
9. **T709**: Create pull request with detailed description
10. **T710**: Prepare demo video for stakeholder review

**Deliverables**:
- Complete dashboard-assessment module implementation
- Test suite with ≥80% coverage
- Documentation for future API integration
- Pull request ready for review

---

## Timeline Estimate

**Total Duration**: 18-22 days (3.5-4.5 weeks)

| Phase | Duration | Dependencies | Risk Level |
|-------|----------|--------------|------------|
| Phase 0: Research & Design | 1-2 days | None | 🟢 Low |
| Phase 1: Foundation | 2-3 days | Phase 0 | 🟡 Medium |
| Phase 2: User Story 1 | 2 days | Phase 1 | 🟢 Low |
| Phase 3: User Story 2 | 3 days | Phase 2 | 🟡 Medium |
| Phase 4: User Story 3 | 4 days | Phase 3 | 🔴 High |
| Phase 5: User Story 4 | 2 days | Phase 4 | 🟢 Low |
| Phase 6: User Story 5 | 2 days | Phase 4 | 🟢 Low |
| Phase 7: Integration & Testing | 2-3 days | Phases 2-6 | 🟡 Medium |
| Phase 8: Documentation & Handoff | 1 day | Phase 7 | 🟢 Low |

**Critical Path**: Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 7 (16-18 days)

**Parallel Work Opportunities**:
- Phase 5 (Dashboard Display) can start after Phase 4 without blocking
- Phase 6 (Feedback) can start after Phase 4 without blocking
- Documentation (Phase 8) can be written incrementally during Phases 2-7

---

## Risk Mitigation

### Risk 1: JSON Schema Complexity
**Mitigation**: Validate JSON structure early in Phase 0. Create comprehensive field type mapping table.
**Contingency**: If JSON parsing issues, fall back to hardcoded form fields temporarily

### Risk 2: API Endpoint Failures
**Mitigation**: Implement error modal with "Continue" option. Store data for retry later.
**Contingency**: If API unavailable, implement local-only mode with sync-on-reconnect

### Risk 3: Storage Quota Issues
**Mitigation**: Monitor serialized data size. Limit array fields (max 10 items).
**Contingency**: If quota exceeded, migrate to IndexedDB or implement server-side draft saving

### Risk 4: Performance on Mobile
**Mitigation**: Lazy load form fields. Debounce auto-save. Test on low-end devices early.
**Contingency**: Reduce auto-save frequency or disable on slow connections

### Risk 5: Validation Rules Too Strict
**Mitigation**: Copy exact patterns from Auth module. Provide clear error messages.
**Contingency**: If high failure rate, relax constraints (e.g., 99-101% for percentages)

---

## Success Metrics (Post-Launch)

| Metric | Target | Measurement Period |
|--------|--------|-------------------|
| Assessment Completion Rate | ≥70% | 30 days |
| Tab API Success Rate | ≥95% | 30 days |
| Average Validation Errors per Tab | ≤2 | 30 days |
| Assessment Abandonment Rate | ≤15% | 30 days |
| Average Completion Time | ≤20 minutes | 30 days |
| Data Persistence Success Rate | 100% | 30 days |
| Feedback Submission Rate | ≥25% | 30 days |
| Recommendations Section Visibility | ≥90% | 30 days |

---

## Open Questions

1. **Q**: Should completed tabs allow editing and resubmission?  
   **A**: [TBD - Spec says users can navigate back to view. Clarify if edit+resubmit allowed]

2. **Q**: What happens if user logs out with incomplete assessment?  
   **A**: [TBD - Should assessment data clear on logout like Auth module, or persist?]

3. **Q**: Should there be a "Save Draft" button or is auto-save sufficient?  
   **A**: [TBD - Spec indicates auto-save is sufficient. Confirm with stakeholders]

4. **Q**: What is the exact structure of the assessmentFields.json file?  
   **A**: [TBD - Need JSON file to proceed with Phase 0 research]

5. **Q**: Are there any conditional field logic requirements (show/hide based on answers)?  
   **A**: [TBD - Out of scope per OS-008, but confirm no critical dependencies]

6. **Q**: Should assessment data be encrypted in storage?  
   **A**: [TBD - NFR-010 mentions minimizing PII exposure. Clarify if encryption required]

7. **Q**: When will Recommendations and Benchmark APIs be available for integration?  
   **A**: [TBD - Plan for future phase. Document integration requirements]

8. **Q**: Should there be analytics tracking for form field interactions?  
   **A**: [TBD - Would help measure SC-003 (validation errors). Discuss with product team]

---

## Definition of Done

- ✅ All 5 user stories implemented and independently testable
- ✅ All acceptance scenarios pass automated tests
- ✅ Test coverage ≥80% for new components
- ✅ All API integrations functional (4 assessment + 1 feedback endpoint)
- ✅ Auto-save working per Profile Settings pattern
- ✅ Sequential tab access enforced
- ✅ Completion counter updates correctly (0-4)
- ✅ Dashboard conditionally displays Recommendations/Benchmark after completion
- ✅ Feedback feature validates using Auth module patterns
- ✅ WCAG 2.1 Level AA compliance verified with axe-core
- ✅ Performance targets met (form render <1s, auto-save <500ms, validation <200ms)
- ✅ Responsive design tested on mobile/tablet/desktop
- ✅ Browser compatibility verified (Chrome, Firefox, Safari, Edge)
- ✅ No ESLint/Prettier errors
- ✅ No TypeScript strict mode errors
- ✅ Documentation complete (storage schema, API formats, validation rules)
- ✅ Pull request approved by code reviewer
- ✅ Demo completed for stakeholder approval

---

## Notes

- **Storage Pattern**: MUST reuse existing Auth/Profile Settings pattern. DO NOT create new storage config.
- **Validation**: MUST copy exact rules from Auth module registration for feedback form.
- **Modals**: MUST reuse BaseModalWithIcon and GetInTouchModal without modification.
- **Designs**: MUST use existing Recommendations/Benchmark components without redesign.
- **API Format**: ALL assessment endpoints expect `{ "responses": {...} }` body structure.
- **Sequential Access**: Strict requirement - users CANNOT jump ahead to locked tabs.
- **Percentage Validation**: commonJobTitles percentages MUST sum to exactly 100%.
- **Completion Counter**: Display format is "[count] Take the Assessment" (e.g., "2 Take the Assessment").
- **Button Text**: Changes to "Continue" when completionCount > 0.
- **Back Button**: Only displayed on tabs 2-4 (not WorkforceTab).
- **Final Tab**: GoalsTab button says "Submit" not "Next".
- **Success Modal**: Final tab success modal button says "Go to Dashboard".
- **Dashboard Hiding**: Both "Take the Assessment" and email verification sections hidden when count === 4.
