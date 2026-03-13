# Data Model: Retake Assessment API Integration

**Feature**: 002-profile-settings (Retake Assessment)  
**Date**: 2026-03-13

## Entities

### Existing Entities (no changes)

#### ProfileState (Redux slice state)

```typescript
// src/types/profileTypes.ts — ALREADY EXISTS
interface ProfileState {
  loading: boolean;
  error: string | null;
  passwordAttempts: number;
  isAccountLocked: boolean;
  lockoutExpiry: number | null;
}
```

**Note**: The `loading` and `error` fields are shared across all profile operations. The retake assessment action will use these same fields in the Redux slice, plus a local `retakeLoading` state in the component for button-specific UI feedback.

#### ProfileApiResponse (reused for retake response)

```typescript
// src/types/profileTypes.ts — ALREADY EXISTS
interface ProfileApiResponse {
  success: boolean;
  message?: string;
  data?: {
    user?: User;
    email?: string;
    emailVerify?: boolean;
    [key: string]: unknown;
  };
  attemptsRemaining?: number;
  lockoutDuration?: number;
}
```

### New State (component-local only)

```typescript
// In SettingsPage.tsx — local state additions
const [retakeLoading, setRetakeLoading] = useState(false);
const [retakeError, setRetakeError] = useState<string | null>(null);
```

## Relationships

```
SettingsPage
  ├── dispatches → retakeAssessmentAction (profileSlice async thunk)
  │                    └── calls → profileApi.retakeAssessment()
  │                                    └── POST /api/v1/assessment
  ├── reads → retakeLoading (local state) → controls modal button isDisabled
  ├── reads → retakeError (local state) → feeds ErrorMessage component
  └── uses → useModalConfig("retakeAssessment", { additionalData: { loading } })
                 └── applies isDisabled to both buttons when loading=true
```

## State Transitions

```
IDLE → LOADING → SUCCESS → REDIRECT
                → ERROR → IDLE (user can retry)

States:
  IDLE:     retakeLoading=false, modal open, buttons enabled
  LOADING:  retakeLoading=true, modal open, buttons disabled, confirm shows "Retaking..."
  SUCCESS:  retakeLoading=false, modal closed, navigate("/assessment")
  ERROR:    retakeLoading=false, modal closed, ErrorMessage visible with retakeError
```

## Validation Rules

No user input is required for this action. Validation is limited to:
- **Authentication check**: `getAccessToken()` must return a valid token (handled by `profileApi.ts`)
- **Server-side**: API validates the user's session and assessment eligibility
