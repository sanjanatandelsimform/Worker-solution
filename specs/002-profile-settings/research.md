# Research: Retake Assessment API Integration

**Feature**: 002-profile-settings (Retake Assessment API)  
**Date**: 2026-03-13  
**Status**: Phase 0 Complete

## Overview

This research consolidates findings for integrating the retake assessment API into the existing Settings page. All technical unknowns from the Technical Context have been resolved through codebase analysis.

## Research Areas

### 1. API Service Pattern — Where to Place the retakeAssessment Function

**Decision**: Add `retakeAssessment()` to `src/services/api/profileApi.ts`

**Rationale**:
- The retake action is triggered from the Settings/Profile page, not the assessment flow itself
- `profileApi.ts` already contains all settings-page API functions (`updateProfile`, `updateEmail`, `updatePassword`, `deleteAccount`, `resendEmailVerification`)
- It uses the same `apiClient` instance with `getAccessToken()` + `retryRequest()` pattern
- The alternative `assessmentApi.ts` handles assessment section data submission/retrieval — conceptually different from a "retake" action initiated from settings

**Alternatives Considered**:
- `assessmentApi.ts`: Rejected — that service handles assessment section CRUD (POST /assessment/{section}, GET /assessment). The retake is a profile-level action, not an assessment-data action. It also uses a different axios instance with different interceptor logic.
- New `retakeApi.ts`: Rejected — unnecessary file for a single function. Constitution Principle I favors composition within existing boundaries.

---

### 2. State Management — Redux Thunk vs Local State

**Decision**: Use Redux async thunk (`retakeAssessmentAction`) in `profileSlice.ts` + local `retakeLoading` state in `SettingsPage.tsx`

**Rationale**:
- Every other settings-page action (`updateProfileData`, `changePassword`, `deleteUserAccount`, `updateEmailAddress`) uses a Redux async thunk dispatched from SettingsPage
- The `profileSlice` already tracks `loading` and `error` — but a shared `loading` flag would conflict with other concurrent operations. So we use a local `retakeLoading` state for UI-specific loading, while the thunk handles the async dispatch pattern.
- The existing `profileError` selector can display the error via `ErrorMessage` component (already wired up in SettingsPage).

**Alternatives Considered**:
- Pure local state (no Redux): Rejected — breaks consistency with every other settings action
- Separate slice: Rejected — unnecessary complexity for a single action in an existing slice

---

### 3. Loading State UX — Button Spinner vs Full Modal Loader

**Decision**: Show loading spinner on confirm button text + disable both buttons (Option A from clarify session)

**Rationale**:
- `BaseModalWithIcon` already supports `isDisabled` on individual buttons — no component changes needed
- Changing button text from "Yes, Retake assessment" to "Retaking..." provides clear feedback
- Disabling both "Cancel" and confirm buttons prevents duplicate clicks + prevents closing during in-flight request
- Consistent with how other loading states work in the app (e.g., assessment tab buttons during API save)

**Alternatives Considered**:
- Full modal loading overlay: Rejected — requires changes to BaseModalWithIcon component (violates DC-002)
- No loading state: Rejected — allows duplicate API calls

---

### 4. useModalConfig Hook — Passing Loading State

**Decision**: Use existing `additionalData` parameter to pass `{ loading: retakeLoading }`

**Rationale**:
- `useModalConfig` already accepts `additionalData?: Record<string, unknown>` — used elsewhere (e.g., `resendSuccess` uses `additionalData.email`)
- Reading `config.additionalData?.loading` inside the `retakeAssessment` config is clean — no hook API changes needed
- Apply `isDisabled: !!config.additionalData?.loading` to both buttons in the retakeAssessment config

**Alternatives Considered**:
- Add a dedicated `loading` prop to `ModalConfig` interface: Rejected — changes hook interface for one use case
- Manage button state outside the hook: Rejected — breaks the encapsulation pattern useModalConfig provides

---

### 5. Error Handling — Where to Display Errors

**Decision**: Close modal, then display error on Settings page using existing `ErrorMessage` component

**Rationale**:
- Spec says (FR-023b): "close the confirmation modal and display the error using the existing ErrorMessage component with error details"
- The SettingsPage already has `showError` + `profileError` wired to an `ErrorMessage` render block at the top of the page
- Using a separate `retakeError` local state (alongside existing `showError` flag) ensures the error message is specific to the retake action and doesn't conflict with other profile errors

**Alternatives Considered**:
- Show error inside the modal: Rejected — spec explicitly says "close the confirmation modal" first
- Use Redux `profileError` directly: Could work, but a local `retakeError` gives more control over message and prevents interference with other profile operations

---

### 6. HTTP Method — POST vs PUT vs PATCH

**Decision**: Use `POST /api/v1/assessment` with empty body

**Rationale**:
- Spec defines: `POST {{baseUrl}}/api/v1/assessment` — Retake assessment
- POST is semantically correct: creating a new assessment instance (resetting/initiating)
- Empty body `{}` because no user-provided data is needed — the server identifies the user via the Bearer token
- The `retryRequest` wrapper handles network failures with one automatic retry

**Alternatives Considered**:
- None — the endpoint and method are specified in the spec

## Summary of Decisions

| Area | Decision | Key Reason |
|------|----------|------------|
| API function location | `profileApi.ts` | Settings-page action, same apiClient |
| State management | Redux thunk + local loading | Consistency with existing pattern |
| Loading UX | Button spinner + disabled buttons | Uses existing `isDisabled` prop |
| Hook integration | `additionalData.loading` | No hook API changes |
| Error display | Close modal → show ErrorMessage | Matches spec FR-023b |
| HTTP method | POST with empty body | Spec-defined, semantically correct |
