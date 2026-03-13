# Quickstart: Retake Assessment API Integration

**Feature**: 002-profile-settings  
**Date**: 2026-03-13

## What This Changes

Integrates the `POST /api/v1/assessment` API call into the existing "Retake Assessment" flow on the Settings page. Currently, clicking "Yes, Retake Assessment" navigates directly — after this change, it calls the API first, then navigates on success or shows an error on failure.

## Files to Modify

| File | Change | Size |
|------|--------|------|
| `src/services/api/profileApi.ts` | Add `retakeAssessment()` function | ~15 lines |
| `src/store/slices/profileSlice.ts` | Add `retakeAssessmentAction` thunk + extra reducers | ~25 lines |
| `src/pages/settings/SettingsPage.tsx` | Add `retakeLoading`/`retakeError` state, convert `handleRetakeAssessment` to async | ~20 lines changed |
| `src/hooks/useModalConfig.tsx` | Add `isDisabled` to retakeAssessment buttons from `additionalData.loading` | ~4 lines changed |

## Files to Create (Tests)

| File | Purpose |
|------|---------|
| `tests/services/profileApi.retake.test.ts` | Unit test for `retakeAssessment()` API function |
| `tests/pages/SettingsPage.retake.test.tsx` | Integration test for the retake flow (success, error, loading states) |

## Prerequisites

- Existing `profileApi.ts` with `apiClient`, `getAccessToken()`, `retryRequest()`, `getErrorMessage()`
- Existing `profileSlice.ts` with async thunk patterns
- Existing `SettingsPage.tsx` with `handleRetakeAssessment()` and modal wiring
- Existing `BaseModalWithIcon` with `isDisabled` button prop
- Backend `POST /api/v1/assessment` endpoint available

## Step-by-Step Implementation Order

### 1. Write Tests First (TDD — Constitution Principle III)

```bash
# Create test file for API service
touch tests/services/profileApi.retake.test.ts

# Create test file for settings page retake flow  
touch tests/pages/SettingsPage.retake.test.tsx
```

### 2. Add API Function → `src/services/api/profileApi.ts`

Add after existing `resendEmailVerification`:

```typescript
export const retakeAssessment = async (): Promise<ProfileApiResponse> => {
  const accessToken = getAccessToken();
  if (!accessToken) throw new Error("Not authenticated");

  return retryRequest(async () => {
    try {
      const response = await apiClient.post<ProfileApiResponse>("/assessment", {}, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return response.data;
    } catch (error) {
      const profileError = getErrorMessage(error);
      throw new Error(profileError.message);
    }
  });
};
```

### 3. Add Redux Thunk → `src/store/slices/profileSlice.ts`

Add import and thunk:
```typescript
import { retakeAssessment } from "@/services/api/profileApi";
// ... (it's already imported as * from profileService)

export const retakeAssessmentAction = createAsyncThunk<void, void, { rejectValue: string }>(
  "profile/retakeAssessment",
  async (_, { rejectWithValue }) => {
    try {
      await profileService.retakeAssessment();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Failed to retake assessment");
    }
  }
);
```

Add extra reducers (pending/fulfilled/rejected) following existing pattern.

### 4. Modify SettingsPage → `src/pages/settings/SettingsPage.tsx`

1. Import `retakeAssessmentAction`
2. Add local state: `retakeLoading`, `retakeError`
3. Convert `handleRetakeAssessment` to async with try/catch/finally
4. Pass `additionalData: { loading: retakeLoading }` to `useModalConfig`
5. Add `retakeError` display in ErrorMessage block

### 5. Update useModalConfig → `src/hooks/useModalConfig.tsx`

Add `isDisabled` to both retakeAssessment buttons:
```typescript
isDisabled: !!config.additionalData?.loading,
```

Change confirm button text when loading:
```typescript
text: config.additionalData?.loading ? "Retaking..." : "Yes, Retake assessment",
```

### 6. Run Tests + Verify

```bash
pnpm run type-check           # Must pass
pnpm lint:fix && pnpm format  # Code quality
pnpm dev                      # Smoke test /settings retake flow
```

## What NOT to Change

- Do NOT modify `BaseModalWithIcon` component
- Do NOT modify `ErrorMessage` component  
- Do NOT change existing modal configs (updateComplete, emailUpdated, accountDelete, etc.)
- Do NOT change routing or other handler functions
- Do NOT add new dependencies
