# Research: Assessment Data Persistence via API

**Feature**: 004-assessment-api-persistence  
**Date**: 2026-02-13  
**Status**: Phase 0 Complete

## Overview

This research document consolidates findings for implementing API-based assessment data persistence, fixing form initialization bugs, and implementing proper validation triggers. All technical unknowns from the Technical Context have been clarified through codebase analysis.

## Research Areas

### 1. API State Management in React Hooks

**Decision**: Use native React useState with async/await pattern in useAssessment hook

**Rationale**:
- Existing useAssessment hook already manages state with useState
- React Query not currently implemented in codebase (would require new dependency)
- Axios already integrated for API calls (src/services/api/assessmentApi.ts)
- Loading states (isSubmitting, isSaving) pattern already established
- Minimal refactor approach aligns with FR-020 (preserve existing patterns)

**Alternatives Considered**:
- React Query: Rejected due to new dependency introduction and learning curve
- SWR: Rejected for same reasons
- Redux Toolkit RTK Query: Rejected - Redux already used but not for data fetching patterns

**Implementation Pattern**:
```typescript
// useAssessment hook pattern
const [isLoading, setIsLoading] = useState(false);
const [apiError, setApiError] = useState<string | null>(null);

const fetchAssessmentData = async () => {
  setIsLoading(true);
  try {
    const response = await getAssessment(); // New API function
    if (response.success) {
      setAnswers(response.data[section] || {});
    }
  } catch (error) {
    setApiError(error.message);
  } finally {
    setIsLoading(false);
  }
};
```

---

### 2. STRUCTURED_ARRAY First Write Initialization Bug

**Decision**: Initialize array with empty object when currentAnswer is null/undefined, not in getArrayItems helper

**Rationale**:
- Current bug: getArrayItems returns [{ id: generateId() }] when array is empty, but this doesn't persist to state
- Root cause: Array initialization happens in helper function, not in state update
- Fix: Initialize array in state when first item is added via useEffect or explicit check in addArrayItem

**Alternatives Considered**:
- Modify getArrayItems to trigger state update: Rejected - side effects in getter functions is anti-pattern
- Use defaultValue in form initialization: Rejected - would require restructuring existing form pattern

**Implementation Pattern**:
```typescript
const addArrayItem = (key: string) => {
  const currentItems = answers[key];
  
  // Fix: Explicitly initialize if undefined/null
  if (!currentItems || !Array.isArray(currentItems)) {
    onAnswerChange(key, [{ id: generateId() }]);
    return;
  }
  
  onAnswerChange(key, [...currentItems, { id: generateId() }]);
};
```

---

### 3. SINGLE_SELECT_DROPDOWN First Selection Binding Bug

**Decision**: Ensure Select component onChange handler immediately updates state, not dependent on re-render

**Rationale**:
- Current bug likely caused by stale closure or missing immediate state update
- React 19 automatic batching may delay state updates
- Fix requires synchronous state update in onChange handler

**Alternatives Considered**:
- useRef to track selections: Rejected - adds unnecessary complexity
- Controlled input with flushSync: Rejected - React 19 deprecates flushSync patterns

**Implementation Pattern**:
```typescript
// In DynamicQuestionRenderer, ensure onChange calls immediately
<Select
  value={currentAnswer as string}
  onValueChange={(value) => {
    // Direct callback, no intermediate handlers
    onAnswerChange(question.key, value);
  }}
/>

// In parent component, ensure onAnswerChange updates state synchronously
const updateAnswer = (key: string, value: unknown) => {
  setAnswers(prev => ({ ...prev, [key]: value }));
};
```

---

### 4. Validation Trigger Timing (Next Click Only)

**Decision**: Implement validation trigger ONLY on Next button click, NOT on field blur

**Rationale**:
- Spec clarifies validation triggers only when user clicks Next (FR-038)
- No blur validation to avoid disrupting user input flow
- Error messages display in red text (FR-039)
- Red borders appear on invalid fields for 6 specified types (FR-040)

**Alternatives Considered**:
- Blur validation: Rejected - user clarified NOT to validate on blur
- onChange validation: Rejected - too aggressive, shows errors while typing
- Dual trigger (blur + submit): Rejected - user wants Next click only

**Implementation Pattern**:
```typescript
// Manual validation in useAssessment - Next click only
const validateAllFields = (answers: Record<string, unknown>) => {
  const validationErrors: Record<string, string> = {};
  
  // Run through each required field
  questions.forEach(question => {
    if (question.required && !answers[question.key]) {
      validationErrors[question.key] = 'This field is required';
    }
  });
  
  return validationErrors;
};

// Trigger ONLY on Next button click
const handleNext = () => {
  const validationErrors = validateAllFields(answers);
  if (Object.keys(validationErrors).length > 0) {
    setErrors(validationErrors); // Display in red
    return; // Don't submit, stay on tab
  }
  submitSection(); // Proceed if valid
};

// NO blur validation - remove onBlur handlers
<Input
  // No onBlur prop
  value={value}
  onChange={onChange}
  className={errors[key] ? 'border-red-500' : ''} // Red border if error
/>
```

---

### 5. Loading States & Button Disabling During API Calls

**Decision**: Add isLoading state separate from isSubmitting, disable buttons conditionally

**Rationale**:
- FR-027: Display loading indicator during POST/GET calls
- FR-028: Disable Next/Back buttons during API calls
- Need separate loading states for GET (back navigation) vs POST (forward navigation)

**Alternatives Considered**:
- Single loading state: Rejected - can't distinguish GET vs POST operations
- Disable all interactions: Rejected - too aggressive, prevents user from viewing current data

**Implementation Pattern**:
```typescript
// In useAssessment hook
const [isLoadingGet, setIsLoadingGet] = useState(false);
const [isSubmitting, setIsSubmitting] = useState(false); // Already exists

// Combined loading check
const isAnyLoading = isLoadingGet || isSubmitting;

// In tab components
<Button 
  disabled={isAnyLoading}
  onClick={handleNext}
>
  {isSubmitting && <Spinner />}
  Next
</Button>

<Button
  disabled={isAnyLoading}
  onClick={handleBack}
>
  {isLoadingGet && <Spinner />}
  Back
</Button>
```

---

### 6. API Error Handling with Retry Mechanism

**Decision**: Display inline error messages with Retry button, preserve form data on failure

**Rationale**:
- FR-030-FR-032: POST failures show inline error, stay on tab, preserve data
- FR-033-FR-035: GET failures show error with Retry button
- Existing ErrorMessage component can be reused

**Alternatives Considered**:
- Modal error dialogs: Rejected per FR-014 (no modals for validation)
- Toast notifications: Rejected - not persistent enough for retry workflows
- Automatic retry with exponential backoff: Rejected - removes user control

**Implementation Pattern**:
```typescript
// In useAssessment hook
const [apiError, setApiError] = useState<{
  type: 'get' | 'post',
  message: string
} | null>(null);

const retryGetAssessment = async () => {
  setApiError(null);
  await fetchAssessmentData(); // Retry GET
};

// In tab component
{apiError?.type === 'get' && (
  <ErrorMessage message={apiError.message}>
    <Button onClick={retryGetAssessment}>Retry</Button>
  </ErrorMessage>
)}

{apiError?.type === 'post' && (
  <ErrorMessage message={apiError.message} />
  // User can edit and resubmit via Next button
)}
```

---

### 7. Page Load Initialization with GET /assessment

**Decision**: Call GET /assessment in useEffect on assessment page mount, not in useAssessment hook

**Rationale**:
- FR-036-FR-037: Auto-fetch on page load (initial visit or refresh)
- AssessmentWorkforce.tsx is entry point, should orchestrate initial load
- useAssessment hook focuses on single-section management

**Alternatives Considered**:
- Call GET in useAssessment hook mount: Rejected - hook doesn't know when page loads vs tab changes
- Call GET in router loader: Rejected - React Router loaders not currently used in codebase

**Implementation Pattern**:
```typescript
// In AssessmentWorkforce.tsx
useEffect(() => {
  const initializeAssessment = async () => {
    const response = await getAssessment();
    if (response.success) {
      // Populate all tabs from response
      // Set current active tab from response or default to workforce
    }
  };
  
  initializeAssessment();
}, []); // Empty deps - run once on mount
```

---

## Technology Decisions Summary

| Area | Decision | Justification |
|------|----------|---------------|
| API State | Native useState + Axios | Minimal change, no new dependencies |
| STRUCTURED_ARRAY Bug | Initialize in addArrayItem | Direct fix at source of issue |
| SINGLE_SELECT Bug | Synchronous onChange | Fixes stale closure in React 19 |
| Validation Timing | Manual blur + submit | Matches spec requirements without React Hook Form migration |
| Loading States | Separate isLoadingGet + isSubmitting | Clear distinction for GET vs POST |
| Error Handling | Inline errors + Retry button | User-friendly, preserves data |
| Page Load Init | useEffect in page component | Correct orchestration point |

---

## Dependencies Analysis

**No New Dependencies Required**:
- Axios: Already installed (1.13.2)
- React Hook Form: Already installed but NOT used in useAssessment (can continue current pattern)
- Zod: Already installed (4.3.5) for validation schemas
- All UI components: Already available in src/components/base/

**Deprecated Usage**:
- src/utils/assessmentStorage.ts: Functions will no longer be called for data restoration
  - Keep file for potential backward compatibility or future use
  - Document deprecation in code comments

---

## Risk Mitigation

**Risk 1**: Breaking existing working functionality while refactoring useAssessment
- **Mitigation**: TDD approach - write tests first to capture current behavior
- **Mitigation**: Feature flag or gradual rollout if possible

**Risk 2**: API response format doesn't match expected structure
- **Mitigation**: Add runtime type checking with Zod schemas
- **Mitigation**: Fallback to empty state if response invalid

**Risk 3**: Race conditions with rapid Next/Back clicks
- **Mitigation**: Disable buttons during API calls (FR-028)
- **Mitigation**: Cancel previous API calls if new one initiated

---

## Implementation Sequence

**Recommended Order**:
1. Add getAssessment() function to assessmentApi.ts
2. Add TypeScript types for GET /assessment response
3. Write tests for useAssessment hook with API mocking
4. Refactor useAssessment to use GET /assessment instead of loadSectionProgress
5. Add loading states (isLoadingGet) and error handling
6. Fix STRUCTURED_ARRAY and SINGLE_SELECT bugs with tests
7. Implement validation on blur + submit
8. Add page load initialization in AssessmentWorkforce.tsx
9. Integration tests for full navigation flow

---

## Phase 0 Completion Status

✅ All research areas addressed  
✅ No NEEDS CLARIFICATION items remaining  
✅ Technology decisions documented with rationale  
✅ Implementation patterns specified  
✅ Ready to proceed to Phase 1 (Design & Contracts)
