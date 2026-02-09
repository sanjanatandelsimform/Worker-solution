# Dashboard Assessment Module

**Module**: `003-dashboard-assessment`  
**Created**: 06 February 2026  
**Status**: Specification Complete - Ready for Implementation

## Overview

The Dashboard Assessment Module enables business users to complete a comprehensive 4-tab workforce quality assessment, with each tab submitting data to dedicated API endpoints. The module tracks completion progress, persists data across sessions, and conditionally displays personalized recommendations and benchmarks upon completion.

## Key Features

### 1. Multi-Tab Assessment Form
- **4 Sequential Tabs**: Workforce → Compensation → Benefits → Goals
- **Dynamic Field Rendering**: All form fields rendered from JSON configuration
- **Sequential Access Control**: Users must complete tabs in order (no jumping ahead)
- **Individual API Endpoints**: Each tab submits to dedicated endpoint with validation

### 2. Data Persistence & Auto-Save
- **Auto-Save on Field Change**: Follows Profile Settings module pattern
- **Cross-Session Persistence**: Data survives page refreshes and browser restarts
- **Storage Pattern**: Reuses existing Auth/Profile Settings storage configuration
- **Back Navigation**: Users can return to previous tabs with data intact

### 3. Completion Tracking
- **Completion Counter**: Displays "[count] Take the Assessment" (count = 0-4)
- **Button State**: Changes to "Continue" when assessment in progress
- **Progress Indicators**: Visual checkmarks on completed tabs
- **Sequential Unlocking**: Next tab unlocks only after successful API submission

### 4. Post-Completion Dashboard Display
- **Conditional Rendering**: Assessment button hides when all tabs complete
- **Recommendations Section**: Displays existing design with static data
- **Benchmark Section**: Displays existing design with static data
- **Share Feedback**: Users can submit feedback via GetInTouchModal

### 5. Validation & Error Handling
- **Client-Side Validation**: Required fields, percentage sums, nested objects
- **Inline Error Display**: Errors shown below fields (Auth module pattern)
- **API Error Modals**: Success/error modals after each tab submission
- **User Choice on Errors**: Cancel (stay on tab) or Continue (proceed anyway)

## Technical Architecture

### Component Structure
```
src/components/dashboard/
├── AssessmentButton.tsx          # CTA with completion counter
├── AssessmentTabForm.tsx         # Wrapper for all 4 tabs
├── TabNavigation.tsx             # Sequential access control
├── WorkforceTab.tsx              # Tab 1: Workforce data
├── CompensationTab.tsx           # Tab 2: Compensation data
├── BenefitsTab.tsx               # Tab 3: Benefits data
├── GoalsTab.tsx                  # Tab 4: Goals data
├── BackButton.tsx                # Navigate to previous tab
├── FormFieldRenderer.tsx         # Dynamic JSON → React components
├── RecommendationsSection.tsx    # Existing (no changes)
└── BenchmarkSection.tsx          # Existing (no changes)
```

### API Endpoints
1. `POST /api/v1/assessment/workforce` - WorkforceTab submission
2. `POST /api/v1/assessment/compensation` - CompensationTab submission
3. `POST /api/v1/assessment/benefits` - BenefitsTab submission
4. `POST /api/v1/assessment/goals` - GoalsTab submission
5. `POST /api/v1/feedback` - Feedback submission

All requests include `Authorization` header with existing auth token.

### Storage Schema
```typescript
interface AssessmentStorage {
  assessment: {
    completedTabs: AssessmentTab[];
    currentTab: AssessmentTab | null;
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

## User Flows

### Flow 1: Start New Assessment
```
Dashboard → Click "Take the Assessment" → Navigate to WorkforceTab
→ Fill form fields (auto-save) → Click "Next" → Validate
→ POST to /api/v1/assessment/workforce → Success modal
→ Counter increments (1) → Navigate to CompensationTab
```

### Flow 2: Continue Incomplete Assessment
```
Dashboard → Button shows "1 Take the Assessment" + "Continue"
→ Click "Continue" → Navigate to CompensationTab (first incomplete)
→ Previous data loads from storage → User continues from where they left off
```

### Flow 3: Complete All Tabs
```
... Complete WorkforceTab (count=1) → Complete CompensationTab (count=2)
→ Complete BenefitsTab (count=3) → Complete GoalsTab (count=4)
→ Final success modal: "Go to Dashboard" → Navigate to dashboard
→ "Take the Assessment" hidden → Recommendations/Benchmark sections visible
```

### Flow 4: Share Feedback
```
Dashboard (completionCount=4) → Click "Share Feedback"
→ GetInTouchModal opens → Fill form (firstName, lastName, email, phone)
→ Validate (Auth module patterns) → POST to /api/v1/feedback
→ Success modal: "Feedback sent" → Close modal
```

## Validation Rules

### WorkforceTab
- **commonJobTitles**: Percentages must sum to exactly 100%
- **Required fields**: headCountSize, desklessEmployees, educationLevel, etc.
- **Nested arrays**: topWorkLocations, employeeLivingZipCodes

### CompensationTab
- **Required fields**: medianAnnualEarnings, offersAnnualRaises, handlesHRPayrollInHouse
- **Conditional logic**: If offersAnnualRaises=true, annualRaiseMonth required

### BenefitsTab
- **Nested objects**: healthPlanParticipationRates (multiple percentages)
- **Required fields**: offersHealthInsurance, offersRetirementBenefit
- **Conditional logic**: If offersRetirementBenefit=true, retirement fields required

### GoalsTab
- **Required fields**: workforceGoals (multi-select), workforceGoalsRanking (ordered list)
- **Validation**: All selected goals must be ranked

### Feedback Form
- **Reuse Auth validation**: firstName (minLength=2), lastName, email, phone patterns
- **Inline errors**: Same styling as registration form

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Assessment Completion Rate | ≥70% | Users who complete all 4 tabs |
| Tab API Success Rate | ≥95% | Successful API responses per tab |
| Average Validation Errors | ≤2 per tab | Client-side validation failures |
| Assessment Abandonment Rate | ≤15% | Users who abandon mid-assessment |
| Average Completion Time | ≤20 minutes | Start to finish |
| Data Persistence Success | 100% | Data loads correctly after refresh |
| Feedback Submission Rate | ≥25% | Completed users who submit feedback |
| Recommendations Visibility | ≥90% | Users who view Recommendations after completion |

## Non-Functional Requirements

### Performance
- **Form Rendering**: <1 second from navigation to fields visible
- **Auto-Save**: <500ms from blur event to storage write
- **Validation Feedback**: <200ms from blur/submit to error display
- **API Timeout**: 10 seconds (show error modal if exceeded)

### Accessibility (WCAG 2.1 Level AA)
- **Keyboard Navigation**: All fields/buttons/tabs accessible via Tab/Enter/Arrow keys
- **Screen Reader Support**: ARIA labels, error announcements, tab state descriptions
- **Focus Management**: Trap focus in modals, logical tab order

### Responsive Design
- **Mobile**: 320px-767px (stacked layout, large tap targets)
- **Tablet**: 768px-1023px (adaptive grid)
- **Desktop**: 1024px+ (max-width constraint for readability)

### Browser Compatibility
- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)

## Implementation Phases

| Phase | Duration | Description |
|-------|----------|-------------|
| 0. Research & Design | 1-2 days | Review existing patterns, parse JSON, design components |
| 1. Foundation | 2-3 days | Types, validation, storage, API, hooks |
| 2. User Story 1 | 2 days | Assessment initiation (button, WorkforceTab) |
| 3. User Story 2 | 3 days | WorkforceTab submission with auto-save |
| 4. User Story 3 | 4 days | Sequential progression (3 more tabs) |
| 5. User Story 4 | 2 days | Dashboard post-completion display |
| 6. User Story 5 | 2 days | Feedback feature |
| 7. Integration & Testing | 2-3 days | E2E tests, performance, accessibility |
| 8. Documentation | 1 day | Docs, PR, demo video |

**Total Duration**: 18-22 days (3.5-4.5 weeks)

## Key Constraints

### What NOT to Change
- ❌ Existing login flow
- ❌ Email verification flow
- ❌ Navigation bar
- ❌ Recommendations design
- ❌ Benchmark design
- ❌ BaseModalWithIcon component
- ❌ GetInTouchModal component
- ❌ Existing storage configuration

### What to Reuse
- ✅ Auth module: Storage patterns, API call patterns, validation rules
- ✅ Profile Settings: Auto-save pattern, form data persistence
- ✅ Registration form: Validation schemas (firstName, lastName, email, phone)
- ✅ Modals: BaseModalWithIcon, GetInTouchModal

## Out of Scope

- Recommendations API integration (use static data)
- Benchmark API integration (use static data)
- Assessment editing after completion
- Multi-version draft saving
- Export assessment data (PDF/CSV)
- Multi-language support
- Conditional field logic (show/hide based on answers)
- Field-level help text/tooltips
- Real-time collaboration

## Dependencies

### Internal
- Auth Module (complete) - Provides tokens, storage patterns, validation
- Profile Settings Module (complete) - Provides auto-save pattern
- BaseModalWithIcon (exists) - Success/error modals
- GetInTouchModal (exists) - Feedback form

### External
- Backend Assessment APIs (4 endpoints)
- Backend Feedback API (1 endpoint)
- Assessment JSON Configuration (provided)

## Files Included

1. **[dashboard.spec.md](dashboard.spec.md)** - Comprehensive technical specification
   - 5 user stories with acceptance scenarios
   - Functional requirements (FR-001 to FR-023)
   - Success criteria (SC-001 to SC-008)
   - Non-functional requirements (NFR-001 to NFR-010)
   - Technical requirements (TR-001 to TR-010)

2. **[dashboard.plan.md](dashboard.plan.md)** - Detailed implementation plan
   - Phase breakdown (0-8)
   - Component architecture
   - Data flow diagrams
   - Storage schema
   - Timeline estimates
   - Risk mitigation strategies

3. **[dashboard.tasks.md](dashboard.tasks.md)** - Granular task breakdown
   - 150-170 individual tasks
   - Test-Driven Development (TDD) approach
   - Phase dependencies
   - Checkpoints and validation gates
   - Definition of Done checklist

4. **[README.md](README.md)** (this file) - Module overview and quick reference

## Getting Started

1. **Review Specifications**: Read [dashboard.spec.md](dashboard.spec.md) to understand user stories and requirements
2. **Review Implementation Plan**: Read [dashboard.plan.md](dashboard.plan.md) for technical architecture
3. **Follow Task Order**: Execute tasks in [dashboard.tasks.md](dashboard.tasks.md) sequentially
4. **Run Tests**: Write tests FIRST (TDD), then implement features
5. **Validate Progress**: Check phase checkpoints before proceeding to next phase

## Questions & Clarifications

For questions about this specification, refer to:
- **User Stories**: See [dashboard.spec.md](dashboard.spec.md) - User Scenarios & Testing
- **Technical Details**: See [dashboard.plan.md](dashboard.plan.md) - Technical Context
- **Task Execution**: See [dashboard.tasks.md](dashboard.tasks.md) - Phase breakdowns

If clarifications needed, document in spec's "Clarifications" section with Q&A format.

---

**Next Steps**: Begin Phase 0 (Research & Design) - Review Auth and Profile Settings modules to understand existing patterns.
