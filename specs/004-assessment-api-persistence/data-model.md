# Data Model: Assessment Data Persistence via API

**Feature**: 004-assessment-api-persistence  
**Date**: 2026-02-13  
**Status**: Phase 1 Design

## Overview

This document defines the data structures for API-based assessment persistence. The system transitions from localStorage-based state to server-authoritative state retrieved via GET /assessment and submitted via POST /assessment/{section} endpoints.

## Core Entities

### 1. Assessment Data (Server-Side)

**Purpose**: Server-side representation of user's complete assessment across all four tabs

**Source**: GET /assessment API response

**Structure**:
```typescript
interface AssessmentData {
  id: string;                    // Unique assessment identifier
  userId: string;                // User who owns the assessment
  createdAt: string;             // ISO 8601 timestamp
  updatedAt: string;             // ISO 8601 timestamp
  status: 'in_progress' | 'completed';
  sections: {
    workforce?: WorkforceSection;
    compensation?: CompensationSection;
    benefits?: BenefitsSection;
    goals?: GoalsSection;
  };
  completionPercentage: number;  // 0-100
}
```

**Relationships**:
- Contains 0-4 section objects (one per tab)
- Each section maps to a specific tab component
- Sections are independent and can be partially populated

**Validation Rules**:
- id: Required, non-empty string
- sections: At least one section may be present
- completionPercentage: 0-100 range
- status: Must be 'in_progress' or 'completed'

---

### 2. Workforce Section

**Purpose**: Data submitted via POST /assessment/workforce

**Structure**:
```typescript
interface WorkforceSection {
  [questionKey: string]: QuestionAnswer;
}

type QuestionAnswer = 
  | string                           // TEXT_INPUT, SINGLE_SELECT_DROPDOWN
  | number                           // NUMERIC, NUMBER_INPUT
  | string[]                         // MULTI_SELECT
  | StructuredArrayItem[]            // STRUCTURED_ARRAY
  | ParticipationRateAnswer          // PARTICIPATION_RATES
  | RankingAnswer;                   // RANKING

interface StructuredArrayItem {
  id: number;                        // Client-generated unique ID
  [fieldKey: string]: string | number | boolean;
}

interface ParticipationRateAnswer {
  eligible: number;
  participating: number;
}

interface RankingAnswer {
  rankedItems: string[];             // Ordered array of item IDs
}
```

**State Transitions**:
- Empty → Partially Filled (user enters some questions)
- Partially Filled → Filled (user completes all required questions)
- Filled → Submitted (POST /assessment/workforce succeeds)

**Validation Rules** (Client-Side):
- Required fields must not be null/undefined/empty
- STRUCTURED_ARRAY: At least one item if required, each item must have required subfields
- TEXT_INPUT: Non-empty string if required
- SINGLE_SELECT_DROPDOWN: Must be one of valid options if required
- NUMERIC/NUMBER_INPUT: Must be valid number if required
- PARTICIPATION_RATES: eligible ≥ participating, both ≥ 0

---

### 3. Compensation Section

**Purpose**: Data submitted via POST /assessment/compensation

**Structure**: Same as WorkforceSection (questions differ but structure identical)

```typescript
interface CompensationSection {
  [questionKey: string]: QuestionAnswer;
}
```

**State Transitions**: Same as WorkforceSection

**Validation Rules**: Same field-type rules as WorkforceSection

---

### 4. Benefits Section

**Purpose**: Data submitted via POST /assessment/benefits

**Structure**: Same as WorkforceSection

```typescript
interface BenefitsSection {
  [questionKey: string]: QuestionAnswer;
}
```

**State Transitions**: Same as WorkforceSection

**Validation Rules**: Same field-type rules as WorkforceSection

---

### 5. Goals Section

**Purpose**: Data submitted via POST /assessment/goals, triggers completion flow

**Structure**: Same as WorkforceSection

```typescript
interface GoalsSection {
  [questionKey: string]: QuestionAnswer;
}
```

**State Transitions**: 
- Same as WorkforceSection, plus:
- Submitted → Completed (triggers success/error modal per FR-023/FR-024)

**Validation Rules**: Same field-type rules as WorkforceSection

**Special Behavior**: 
- POST /assessment/goals determines final assessment outcome
- Success triggers "You're done!" modal
- Error triggers "Uh-oh" empty submission modal

---

### 6. Form State (Client-Side)

**Purpose**: Client-side representation of current tab's form data, validation status, and errors

**Structure**:
```typescript
interface FormState {
  section: 'workforce' | 'compensation' | 'benefits' | 'goals';
  answers: Record<string, QuestionAnswer>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;      // Track if field has been blurred
  isSubmitting: boolean;                 // POST in progress
  isLoadingGet: boolean;                 // GET in progress
  isDirty: boolean;                      // Has unsaved changes
}
```

**Source**: Managed in useAssessment hook

**Relationships**:
- Populated from GET /assessment response when navigating to tab
- Submitted to POST /assessment/{section} when clicking Next
- Reset when navigating away (data not preserved client-side)

**Validation Rules**:
- errors: Non-empty when validation fails
- touched: Set to true on field blur (FR-039)
- isSubmitting/isLoadingGet: Mutually exclusive loading states

---

### 7. Validation Error

**Purpose**: Represents a failed validation rule for a specific field

**Structure**:
```typescript
interface ValidationError {
  fieldKey: string;                      // Question key that failed
  message: string;                       // Human-readable error message
  type: 'required' | 'format' | 'range'; // Error category
}

// Stored as Record<string, string> in FormState.errors
// Key = fieldKey, Value = message
```

**Display Behavior**:
- Shown via ErrorMessage component (inline)
- Red border applied to input (FR-012)
- Applies to field types: STRUCTURED_ARRAY, TEXT_INPUT, SINGLE_SELECT_DROPDOWN, NUMERIC, NUMBER_INPUT, PARTICIPATION_RATES (FR-013)

**Lifecycle**:
- Created: ONLY on Next click (FR-038), NOT on field blur
- Displayed: As red text message + red border on invalid input (FR-039, FR-040)
- Cleared: When user corrects the field and clicks Next again (FR-015)
- Prevents navigation: Blocks forward navigation while errors exist (FR-016)

---

### 8. Tab Navigation State

**Purpose**: Tracks which tabs user has visited, current active tab, and navigation permissions

**Structure**:
```typescript
interface TabNavigationState {
  currentTab: 'workforce' | 'compensation' | 'benefits' | 'goals';
  visitedTabs: Set<string>;              // Tabs user has seen
  completedTabs: Set<string>;            // Tabs with successful POST
  canNavigateForward: boolean;           // Based on validation
  canNavigateBack: boolean;              // Based on API loading state
}
```

**Source**: Managed in parent component (AssessmentWorkforce.tsx)

**State Transitions**:
- Initial: currentTab = 'workforce', visitedTabs = [], completedTabs = []
- On Next (success): currentTab advances, completedTabs gains current tab
- On Back: currentTab retreats, visitedTabs updated

**Validation Rules**:
- canNavigateForward: false if FormState.errors non-empty OR isSubmitting true
- canNavigateBack: false if isLoadingGet true (FR-028)

---

### 9. API Loading State

**Purpose**: Tracks async API operations for UI feedback

**Structure**:
```typescript
interface APILoadingState {
  isLoadingGet: boolean;                 // GET /assessment in progress
  isSubmitting: boolean;                 // POST /assessment/{section} in progress
  apiError: {
    type: 'get' | 'post';
    message: string;
    timestamp: string;
  } | null;
}
```

**Source**: Managed in useAssessment hook

**State Transitions**:
- Idle: { isLoadingGet: false, isSubmitting: false, apiError: null }
- Loading GET: { isLoadingGet: true, ... }
- Loading POST: { isSubmitting: true, ... }
- Error: { isLoadingGet/isSubmitting: false, apiError: { ... } }

**Effects**:
- Disables Next/Back buttons (FR-028)
- Shows spinner (FR-027)
- Displays error message with Retry button (FR-033-FR-035)

---

## Data Flow Diagrams

### Forward Navigation (Next Button)

```
User clicks Next
  ↓
Trigger validation (FR-038)
  ↓
Validation fails? → Show errors (FR-012, FR-013), stay on tab
  ↓ (success)
Set isSubmitting = true, disable buttons (FR-028), show spinner (FR-027)
  ↓
POST /assessment/{section}
  ↓
POST fails? → Show inline error (FR-030-FR-032), stay on tab
  ↓ (success)
Set isSubmitting = false, navigate to next tab (FR-007)
  ↓
If next tab = Goals and POST succeeded → Show completion modal (FR-023/FR-024)
```

### Backward Navigation (Back Button)

```
User clicks Back
  ↓
Set isLoadingGet = true, disable buttons (FR-028), show spinner (FR-027)
  ↓
GET /assessment
  ↓
GET fails? → Show error with Retry button (FR-033-FR-035), stay on tab
  ↓ (success)
Populate previous tab FormState.answers from response (FR-009)
  ↓
Set isLoadingGet = false, navigate to previous tab
  ↓
Do NOT call POST (FR-010)
```

### Page Load Initialization

```
User lands on assessment page
  ↓
Mount AssessmentWorkforce.tsx
  ↓
Call GET /assessment in useEffect (FR-036)
  ↓
Populate all section answers from response (FR-037)
  ↓
Determine current tab (last incomplete or first)
  ↓
Render with data
```

---

## Entity Relationship Summary

```
AssessmentData (server)
  ├─ sections.workforce → WorkforceSection
  ├─ sections.compensation → CompensationSection
  ├─ sections.benefits → BenefitsSection
  └─ sections.goals → GoalsSection

FormState (client, per tab)
  ├─ answers → Section Questions
  ├─ errors → ValidationError[]
  └─ API state → APILoadingState

TabNavigationState (client, global)
  ├─ currentTab
  ├─ visitedTabs
  └─ completedTabs
```

---

## Type Definitions for Implementation

```typescript
// Complete TypeScript type definitions for implementation

export interface AssessmentData {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  status: 'in_progress' | 'completed';
  sections: {
    workforce?: WorkforceSection;
    compensation?: CompensationSection;
    benefits?: BenefitsSection;
    goals?: GoalsSection;
  };
  completionPercentage: number;
}

export type SectionType = 'workforce' | 'compensation' | 'benefits' | 'goals';

export type WorkforceSection = Record<string, QuestionAnswer>;
export type CompensationSection = Record<string, QuestionAnswer>;
export type BenefitsSection = Record<string, QuestionAnswer>;
export type GoalsSection = Record<string, QuestionAnswer>;

export type QuestionAnswer = 
  | string
  | number
  | string[]
  | StructuredArrayItem[]
  | ParticipationRateAnswer
  | RankingAnswer;

export interface StructuredArrayItem {
  id: number;
  [fieldKey: string]: string | number | boolean;
}

export interface ParticipationRateAnswer {
  eligible: number;
  participating: number;
}

export interface RankingAnswer {
  rankedItems: string[];
}

export interface FormState {
  section: SectionType;
  answers: Record<string, QuestionAnswer>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isLoadingGet: boolean;
  isDirty: boolean;
}

export interface APILoadingState {
  isLoadingGet: boolean;
  isSubmitting: boolean;
  apiError: {
    type: 'get' | 'post';
    message: string;
    timestamp: string;
  } | null;
}

export interface TabNavigationState {
  currentTab: SectionType;
  visitedTabs: Set<string>;
  completedTabs: Set<string>;
  canNavigateForward: boolean;
  canNavigateBack: boolean;
}
```

---

## Data Persistence Strategy

**Authoritative Source**: Server (via GET /assessment)

**Client-Side Storage**: 
- ❌ localStorage: Explicitly prohibited for assessment data (FR-002)
- ❌ sessionStorage: Explicitly prohibited for assessment data (FR-002)
- ✅ React state: Temporary, cleared on navigation between tabs
- ✅ URL state: Not applicable for this feature

**Synchronization**:
- Forward Navigation: POST → Server stores → Next tab starts fresh
- Backward Navigation: GET → Client populates from server → Display
- Page Refresh: GET → Client repopulates from server → Continue where left off

**Conflict Resolution**: Not applicable - single-user assessment, no concurrent editing

---

## Phase 1 Data Model Completion Status

✅ All entities extracted from spec  
✅ Relationships documented  
✅ Validation rules specified  
✅ State transitions defined  
✅ TypeScript types provided for implementation  
✅ Data flow diagrams created  
✅ Ready to proceed to API contracts
