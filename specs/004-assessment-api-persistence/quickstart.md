# Quickstart: Assessment Data Persistence via API

**Feature**: 004-assessment-api-persistence  
**Date**: 2026-02-13  
**Branch**: `004-assessment-api-persistence`

## Overview

This guide helps developers quickly understand and implement the assessment API persistence feature. Read this first before diving into code changes.

---

## 🎯 What We're Building

**Before**: Assessment data saved to localStorage, restored from localStorage on navigation  
**After**: Assessment data submitted via POST /assessment/{section}, restored via GET /assessment

**Three Bug Fixes**:
1. STRUCTURED_ARRAY first write doesn't initialize properly
2. SINGLE_SELECT_DROPDOWN first selection doesn't display
3. Validation red borders not showing on all required field types

---

## 📋 Prerequisites

**Required Knowledge**:
- React 19 hooks (useState, useEffect, useCallback)
- TypeScript interfaces and types
- Axios API calls with async/await
- React Router v7 navigation

**Required Setup**:
```bash
# Verify you're on the feature branch
git branch --show-current
# Should output: 004-assessment-api-persistence

# Install dependencies (if not already done)
pnpm install

# Run type checking
pnpm run type-check

# Start dev server
pnpm dev
```

---

## 🗺️ Feature Map

### Files You'll Modify (8 files)

**Priority 1 - Core Logic**:
1. `src/hooks/useAssessment.ts` - PRIMARY: Replace localStorage with API calls
2. `src/services/api/assessmentApi.ts` - Add getAssessment() function

**Priority 2 - Bug Fixes**:
3. `src/components/assessment/DynamicQuestionRenderer.tsx` - Fix STRUCTURED_ARRAY, SINGLE_SELECT bugs
4. `src/pages/assessmentWorkforce/AssessmentWorkforce.tsx` - Add GET /assessment on page load

**Priority 3 - Tab Components** (Add validation on blur):
5. `src/components/assessment/WorkforceTab.tsx`
6. `src/components/assessment/CompensationTab.tsx`
7. `src/components/assessment/BenefitsTab.tsx`
8. `src/components/assessment/GoalsTab.tsx`

**Read-Only Reference**:
- `src/utils/assessmentStorage.ts` - No longer used for data restoration (keep for backward compat)
- `src/components/assessment/DynamicTab.tsx` - Existing tab wrapper (minimal changes)

### Test Files You'll Create (TDD!)

```
tests/
├── hooks/
│   └── useAssessment.test.ts
├── components/
│   └── assessment/
│       ├── DynamicQuestionRenderer.test.tsx
│       └── WorkforceTab.test.tsx
└── integration/
    └── assessment-navigation.test.ts
```

---

## 🚀 Implementation Sequence

### Step 1: Add API Function (15 min)

**File**: `src/services/api/assessmentApi.ts`

```typescript
// Add to existing file

export interface AssessmentData {
  id: string;
  userId: string;
  sections: {
    workforce?: Record<string, unknown>;
    compensation?: Record<string, unknown>;
    benefits?: Record<string, unknown>;
    goals?: Record<string, unknown>;
  };
  status: 'in_progress' | 'completed';
  completionPercentage: number;
}

export const getAssessment = async (): Promise<ApiResponse<AssessmentData>> => {
  try {
    const response = await apiClient.get('/assessment');
    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to fetch assessment data',
    };
  }
};
```

**Test it**:
```bash
# In browser console after login
import { getAssessment } from '@/services/api/assessmentApi';
const data = await getAssessment();
console.log(data);
```

---

### Step 2: Refactor useAssessment Hook (45 min)

**File**: `src/hooks/useAssessment.ts`

**Changes Required**:
1. Remove imports from `assessmentStorage.ts`
2. Add `isLoadingGet` state
3. Replace `loadProgress()` function to call `getAssessment()` API
4. Add `apiError` state for error handling
5. Update return type to include new states

**Key Code Changes**:

```typescript
// REPLACE THIS (lines ~8-11):
import {
  saveAssessmentProgress,
  loadSectionProgress,
  autoSaveProgress,
  // ... rest of localStorage imports
} from "@/utils/assessmentStorage";

// WITH THIS:
import { getAssessment } from "@/services/api/assessmentApi";
// Remove all localStorage function imports

// ADD NEW STATE (after existing states):
const [isLoadingGet, setIsLoadingGet] = useState(false);
const [apiError, setApiError] = useState<{
  type: 'get' | 'post';
  message: string;
} | null>(null);

// REPLACE loadProgress() function:
const loadProgress = useCallback(async () => {
  setIsLoadingGet(true);
  setApiError(null);
  try {
    const response = await getAssessment();
    if (response.success && response.data?.sections?.[section]) {
      setAnswers(response.data.sections[section]);
    }
  } catch (error) {
    setApiError({
      type: 'get',
      message: error.message || 'Failed to load assessment data'
    });
  } finally {
    setIsLoadingGet(false);
  }
}, [section]);

// REMOVE auto-save logic from updateAnswer and updateAnswers:
const updateAnswer = useCallback((key: string, value: unknown) => {
  setAnswers(prev => ({ ...prev, [key]: value }));
  // Remove autoSaveProgress call - data only persists via POST on Next click
}, []);

// UPDATE return type:
return {
  answers,
  errors,
  isSubmitting,
  isLoadingGet,      // NEW
  apiError,          // NEW
  updateAnswer,
  updateAnswers,
  setErrors,
  clearError,
  submitSection,
  resetSection,
  loadProgress,
  retryGetAssessment: loadProgress,  // NEW - for Retry button
};
```

**Test Plan** (Write **BEFORE** implementing):
```typescript
// tests/hooks/useAssessment.test.ts
describe('useAssessment', () => {
  it('should call GET /assessment on mount', async () => {
    // Mock getAssessment API
    // Render hook
    // Assert API called
    // Assert answers populated from response
  });

  it('should set isLoadingGet during GET call', async () => {
    // Assert isLoadingGet true during call
    // Assert isLoadingGet false after complete
  });

  it('should set apiError on GET failure', async () => {
    // Mock API failure
    // Assert apiError populated
  });

  it('should NOT call localStorage functions', () => {
    // Spy on localStorage methods
    // Assert never called
  });
});
```

---

### Step 3: Fix STRUCTURED_ARRAY Bug (20 min)

**File**: `src/components/assessment/DynamicQuestionRenderer.tsx`

**Bug**: First item added to empty array doesn't persist

**Root Cause**: `getArrayItems()` returns default but doesn't update state

**Fix**:
```typescript
// FIND: addArrayItem function (around line 50)
const addArrayItem = (key: string) => {
  const currentItems = getArrayItems(key);
  onAnswerChange(key, [...currentItems, { id: generateId() }]);
};

// REPLACE WITH:
const addArrayItem = (key: string) => {
  const currentItems = answers[key];
  
  // Fix: Explicitly initialize if undefined/null/empty
  if (!currentItems || !Array.isArray(currentItems) || currentItems.length === 0) {
    onAnswerChange(key, [{ id: generateId() }]);
    return;
  }
  
  onAnswerChange(key, [...currentItems, { id: generateId() }]);
};
```

**Test Plan** (TDD):
```typescript
// tests/components/assessment/DynamicQuestionRenderer.test.tsx
it('should persist first STRUCTURED_ARRAY item', () => {
  // Render with empty array field
  // Click "Add" button
  // Assert onAnswerChange called with array containing one item
  // Assert item remains visible after re-render
});

it('should show red border on STRUCTURED_ARRAY when validation fails', () => {
  // Render required STRUCTURED_ARRAY with no items
  // Click Next button
  // Assert error message displays in red
  // Assert input has red border class
});
```

---

### Step 4: Fix SINGLE_SELECT_DROPDOWN Bug (15 min)

**File**: `src/components/assessment/DynamicQuestionRenderer.tsx`

**Bug**: First selection doesn't display until second interaction

**Root Cause**: Possible stale closure or async state update

**Fix**:
```typescript
// FIND: Select component render (search for <Select)
<Select
  value={currentAnswer as string}
  onValueChange={(value) => {
    // Ensure immediate synchronous update
    onAnswerChange(question.key, value);
  }}
  placeholder={question.placeholder}
>... rest of Select props
</Select>

// If Select uses onSelectionChange instead of onValueChange, check docs
// Ensure value prop is correctly bound to currentAnswer
```

**Test Plan** (TDD):
```typescript
it('should display selected value immediately on first selection', () => {
  // Render dropdown with no initial value
  // Select first option
  // Assert onAnswerChange called
  // Assert selected value visible in dropdown display
});
```

---

### Step 5: Implement Validation on Next Click Only (20 min)

**File**: `src/components/assessment/WorkforceTab.tsx` (repeat for other tabs)

**IMPORTANT**: Validation triggers ONLY on Next button click, NOT on blur

**Changes**:
```typescript
// In WorkforceTab component

const handleNext = () => {
  // Validate ALL fields on Next click
  const validationErrors: Record<string, string> = {};
  
  questions.forEach(question => {
    const value = answers[question.key];
    
    // Check required fields
    if (question.required && !value) {
      validationErrors[question.key] = 'This field is required';
    }
    
    // Add other validation rules as needed
  });
  
  if (Object.keys(validationErrors).length > 0) {
    setErrors(validationErrors); // Display errors in red
    return; // Stay on tab, don't submit
  }
  
  // If valid, proceed with submission
  submitSection();
};

// NO blur validation - DynamicQuestionRenderer does NOT need onBlur prop
<DynamicQuestionRenderer
  question={question}
  answers={answers}
  onAnswerChange={updateAnswer}
  errors={errors}
/>
```

**Update DynamicQuestionRenderer** to show red borders for errors:
```typescript
// In DynamicQuestionRenderer.tsx
const error = errors[question.key];
const hasError = !!error;

// For each input type, add red border class when error exists
<Input
  className={cx(
    'base-input-classes',
    hasError && 'border-red-500' // Red border on error
  )}
  // NO onBlur handler
  value={currentAnswer}
  onChange={(e) => onAnswerChange(question.key, e.target.value)}
/>

// Display error message in red
{error && (
  <span className="text-red-500 text-sm mt-1">{error}</span>
)}
```

---

### Step 6: Add Page Load GET /assessment (15 min)

**File**: `src/pages/assessmentWorkforce/AssessmentWorkforce.tsx`

```typescript
// Add near top of component
useEffect(() => {
  const initializeAssessment = async () => {
    // This will be called by each tab's useAssessment hook
    // No additional logic needed here if useAssessment already calls loadProgress on mount
  };
  
  initializeAssessment();
}, []);

// If useAssessment doesn't auto-load, trigger it explicitly:
const { loadProgress } = useAssessment({ section: 'workforce' });

useEffect(() => {
  loadProgress();
}, []); // Run once on page mount
```

---

### Step 7: Add Loading States to UI (20 min)

**File**: Each tab component

```typescript
const { isSubmitting, isLoadingGet, apiError } = useAssessment({ section });

const isAnyLoading = isSubmitting || isLoadingGet;

return (
  <div>
    {/* Error display */}
    {apiError && (
      <ErrorMessage message={apiError.message}>
        {apiError.type === 'get' && (
          <Button onClick={retryGetAssessment}>Retry</Button>
        )}
      </ErrorMessage>
    )}

    {/* Form fields */}
    {/* ... existing form ... */}

    {/* Navigation buttons */}
    <Button
      onClick={handleNext}
      disabled={isAnyLoading}
    >
      {isSubmitting && <Spinner />}
      Next
    </Button>

    <Button
      onClick={handleBack}
      disabled={isAnyLoading}
    >
      {isLoadingGet && <Spinner />}
      Back
    </Button>
  </div>
);
```

---

## 🧪 Testing Strategy (TDD!)

### Write Tests FIRST

**Order**:
1. API function tests (getAssessment)
2. useAssessment hook tests (API integration)
3. Bug fix tests (STRUCTURED_ARRAY, SINGLE_SELECT)
4. Validation trigger tests (blur + submit)
5. Integration tests (full navigation flow)

**Run Tests**:
```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test useAssessment.test.ts

# Watch mode for TDD
pnpm test --watch
```

---

## 🐛 Debugging Tips

**Issue**: "answers not populating on back navigation"
- Check: GET /assessment called in network tab?
- Check: Response contains section data?
- Check: useAssessment.loadProgress() called?

**Issue**: "STRUCTURED_ARRAY still not saving first item"
- Console.log in addArrayItem to see state before/after
- Check: onAnswerChange being called with array?
- Check: Parent component re-rendering with new answers?

**Issue**: "Validation not triggering on blur"
- Check: onBlur prop passed to DynamicQuestionRenderer?
- Check: onBlur callback connected to input components?
- Use React DevTools to inspect prop flow

---

## 📚 Key Resources

**Specification**: [spec.md](./spec.md)  
**Data Model**: [data-model.md](./data-model.md)  
**API Contracts**: [contracts/assessment-api.md](./contracts/assessment-api.md)  
**Research**: [research.md](./research.md)  

**Constitution**: `/.specify/memory/constitution.md`  
**Copilot Instructions**: `/.github/copilot-instructions.md`

---

## ✅ Definition of Done

Before marking this feature complete:

- [ ] All 8 files modified as specified
- [ ] GET /assessment API function added and tested
- [ ] useAssessment refactored to use API instead of localStorage
- [ ] STRUCTURED_ARRAY bug fixed with test
- [ ] SINGLE_SELECT_DROPDOWN bug fixed with test
- [ ] Validation triggers on blur + submit with tests
- [ ] Loading states (spinner + disabled buttons) implemented
- [ ] Error handling with Retry button implemented
- [ ] Page load calls GET /assessment
- [ ] Integration test for back navigation passes
- [ ] All tests passing (`pnpm test`)
- [ ] Type check passing (`pnpm run type-check`)
- [ ] No localStorage calls for assessment data (verify in DevTools)
- [ ] UI unchanged (no visual regressions)
- [ ] Code review approved

---

## 🚦 Next Steps

1. **Read**: [spec.md](./spec.md) - Understand user stories and requirements
2. **Review**: [data-model.md](./data-model.md) - Understand data structures
3. **Study**: [contracts/assessment-api.md](./contracts/assessment-api.md) - API details
4. **Implement**: Follow steps 1-7 above in order
5. **Test**: Write tests first (TDD), ensure all pass
6. **Submit**: Create PR referencing spec and tasks

---

## 💬 Questions?

**Technical Questions**: Review research.md for implementation patterns  
**API Questions**: Check contracts/assessment-api.md  
**Data Questions**: See data-model.md  
**Requirement Questions**: Refer to spec.md user stories

**Constitution Compliance**: Ensure all changes follow `.specify/memory/constitution.md` principles

---

**Ready to start?** Begin with Step 1 - Add API Function ✨
