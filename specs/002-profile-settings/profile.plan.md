# Implementation Plan: Integrate Retake Assessment API

**Branch**: `002-profile-settings` | **Date**: 2026-03-13 | **Spec**: [profile.spec.md](./profile.spec.md)
**Input**: Feature specification from `/specs/002-profile-settings/profile.spec.md` — Retake Assessment API integration (FR-021 to FR-023d)

## Summary

Integrate the retake assessment API (`POST /api/v1/assessment`) into the existing `handleRetakeAssessment` function in `SettingsPage.tsx`. When the user confirms "Yes, Retake Assessment", call the API via the existing `profileApi.ts` service pattern, show a loading spinner on the confirm button with both buttons disabled, redirect to `/assessment` on success, or close the modal and display an ErrorMessage on failure. No existing functionality is changed.

## Technical Context

**Language/Version**: TypeScript 5.9.3, React 19.2.0  
**Primary Dependencies**: React Router v7, Redux Toolkit 2.11.2, Axios (via `profileApi.ts` apiClient), @untitledui/icons  
**Storage**: N/A (no client-side storage changes — assessment reset is server-side)  
**Testing**: Jest + React Testing Library (per constitution principle III)  
**Target Platform**: Web browsers (React SPA)  
**Project Type**: Web frontend (single-page application)  
**Performance Goals**: API response + redirect < 3 seconds (SC-002 pattern), loading state visible immediately on click  
**Constraints**: Must NOT change any existing functionality (FR-023c, DC-001 through DC-007). Must use existing `profileApi.ts` apiClient + `getAccessToken()` helper + `retryRequest()` wrapper. Must use existing `BaseModalWithIcon` `isDisabled` button prop, `ErrorMessage` component, `profileSlice` async thunk pattern.  
**Scale/Scope**: 1 new API function in `profileApi.ts`, 1 new async thunk in `profileSlice.ts`, modifications to `handleRetakeAssessment` + `useModalConfig` in `SettingsPage.tsx`, 1 new `retakeLoading` local state

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Component-First Architecture | ✅ PASS | Reuses existing `BaseModalWithIcon`, `ErrorMessage`, `SettingsPage` — no new components created |
| II. User-Centric Design | ✅ PASS | User Story 4 documented with 6 acceptance scenarios and priorities |
| III. Test-Driven Development | ✅ PASS | Tests identified for: API service function, async thunk, SettingsPage handler (success/error/loading states) |
| IV. Type Safety & Code Quality | ✅ PASS | TypeScript types for API response, async thunk types follow existing pattern |
| V. Performance & Accessibility | ✅ PASS | Loading spinner provides visual feedback; buttons already have ARIA support via BaseModalWithIcon; no bundle size impact |
| VI. State Management Discipline | ✅ PASS | Local `retakeLoading` state for UI, async thunk dispatched through Redux for API call — follows existing patterns exactly |

**Gate Result**: All checks pass. No violations.

## Project Structure

### Documentation (this feature)

```text
specs/002-profile-settings/
├── profile.spec.md      # Feature specification
├── profile.plan.md      # This file (implementation plan)
├── research.md          # Phase 0 research output
├── data-model.md        # Phase 1 data model
├── quickstart.md        # Phase 1 developer quickstart
├── contracts/           # Phase 1 API contract
│   └── assessment-api.md
└── checklists/
    └── requirements.md  # Quality checklist
```

### Source Code (files to modify)

```text
src/
├── services/api/
│   └── profileApi.ts          # ADD: retakeAssessment() function
├── store/slices/
│   └── profileSlice.ts        # ADD: retakeAssessment async thunk + reducers
├── pages/settings/
│   └── SettingsPage.tsx        # MODIFY: handleRetakeAssessment(), add retakeLoading state
└── types/
    └── profileTypes.ts         # Already has ProfileApiResponse (reuse)

tests/
├── services/
│   └── profileApi.test.ts     # ADD: tests for retakeAssessment API function
├── store/
│   └── profileSlice.test.ts   # ADD: tests for retakeAssessment thunk
└── pages/
    └── SettingsPage.test.tsx   # ADD: tests for retake assessment flow
```

**Structure Decision**: Single web frontend project. All changes fit within existing directory structure with no new folders needed.

## Implementation Approach

### Step 1: Add API Service Function

Add `retakeAssessment()` to `src/services/api/profileApi.ts` following the existing pattern:

```typescript
export const retakeAssessment = async (): Promise<ProfileApiResponse> => {
  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new Error("Not authenticated");
  }

  return retryRequest(async () => {
    try {
      const response = await apiClient.post<ProfileApiResponse>("/assessment", {}, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response.data;
    } catch (error) {
      const profileError = getErrorMessage(error);
      throw new Error(profileError.message);
    }
  });
};
```

### Step 2: Add Async Thunk to Profile Slice

Add `retakeAssessmentAction` thunk to `src/store/slices/profileSlice.ts`:

```typescript
export const retakeAssessmentAction = createAsyncThunk<
  void,
  void,
  { rejectValue: string }
>("profile/retakeAssessment", async (_, { rejectWithValue }) => {
  try {
    await profileService.retakeAssessment();
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : "Failed to retake assessment"
    );
  }
});
```

Add corresponding extra reducers (pending/fulfilled/rejected) following existing pattern.

### Step 3: Modify SettingsPage.tsx

1. Add `retakeLoading` local state: `const [retakeLoading, setRetakeLoading] = useState(false);`
2. Add `retakeError` local state: `const [retakeError, setRetakeError] = useState<string | null>(null);`
3. Convert `handleRetakeAssessment` to async:

```typescript
async function handleRetakeAssessment() {
  setRetakeLoading(true);
  setRetakeError(null);
  try {
    await dispatch(retakeAssessmentAction()).unwrap();
    setIsRetakeAssessmentModalOpen(false);
    navigate("/assessment");
  } catch (error) {
    setIsRetakeAssessmentModalOpen(false);
    setRetakeError(typeof error === "string" ? error : "Failed to retake assessment");
    setShowError(true);
  } finally {
    setRetakeLoading(false);
  }
}
```

4. Pass `isDisabled: retakeLoading` to both buttons in `useModalConfig("retakeAssessment", ...)` — or pass `retakeLoading` via `additionalData` and apply it inside the config.

### Step 4: Wire Loading State into Modal Buttons

Option: Pass `retakeLoading` into `useModalConfig` via `additionalData` and use `isDisabled` on both buttons during loading:

```typescript
const retakeAssessmentModal = useModalConfig("retakeAssessment", {
  isOpen: isRetakeAssessmentModalOpen,
  onClose: () => setIsRetakeAssessmentModalOpen(false),
  onConfirm: handleRetakeAssessment,
  additionalData: { loading: retakeLoading },
});
```

In `useModalConfig.tsx`, update the `retakeAssessment` config:
```typescript
retakeAssessment: {
  // ...existing config...
  buttons: [
    {
      text: "Cancel",
      onClick: config.onClose,
      color: "secondary",
      isDisabled: !!config.additionalData?.loading,
    },
    {
      text: config.additionalData?.loading ? "Retaking..." : "Yes, Retake assessment",
      onClick: config.onConfirm || config.onClose,
      color: "error",
      isDisabled: !!config.additionalData?.loading,
    },
  ],
}
```

## Complexity Tracking

> No constitution violations. No complexity justification needed.
