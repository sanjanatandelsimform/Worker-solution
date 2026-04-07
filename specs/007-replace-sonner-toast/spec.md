# Feature Specification: Replace Sonner Toast with ErrorMessage Component in Finch Feature

**Feature Branch**: `007-replace-sonner-toast`  
**Created**: 2026-04-07  
**Status**: Draft  
**Input**: User description: "In the finch feature, we have installed the sonner for toast message, We need to remove that one, we have to follow what the project follows. Currently in the project, we have to use the ErrorMessage component, So please work on that."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Finch Connection Error Displayed Inline (Priority: P1)

When a user on the Dashboard page attempts to connect with Finch and the connection fails (e.g., session retrieval failure, code exchange failure, or the Finch widget reports an error), the error message is displayed inline on the page using the project's standard `<ErrorMessage />` component instead of a floating toast notification.

**Why this priority**: This is the core ask of the feature. All Finch error paths currently use Sonner `toast.error()`, which must be replaced. Without this change the non-standard dependency remains active and error presentation is inconsistent with the rest of the application.

**Independent Test**: Can be fully tested by triggering any Finch connection error on the Dashboard page (e.g., mocking a failed API call) and verifying that an inline error banner appears within the page rather than a floating toast in the corner.

**Acceptance Scenarios**:

1. **Given** the user is viewing the Dashboard page, **When** they click "Start with Finch" and the session ID request fails, **Then** an inline error message reading "Failed to start Finch Connect. Please try again." (or the server's error message) is shown on the page and no Sonner toast appears.
2. **Given** the Finch widget successfully opens, **When** the code exchange with the backend fails, **Then** an inline error message is shown on the Dashboard page and no Sonner toast appears.
3. **Given** the Finch widget is open, **When** the widget itself reports an error, **Then** an inline error message is shown on the Dashboard page and no Sonner toast appears.
4. **Given** an inline error message is displayed, **When** 5 seconds elapse or the user dismisses it, **Then** the error message disappears (matching the auto-dismiss behaviour of `<ErrorMessage />`).

---

### User Story 2 - Sonner Dependency Fully Removed (Priority: P2)

No remnant of Sonner (the `<Toaster />` global mount, the `sonner.tsx` wrapper, and the `sonner` package import) remains in the codebase after the refactor.

**Why this priority**: Leaving unused code and dependencies creates maintenance overhead and contradicts the project's stated pattern. This story ensures a clean removal.

**Independent Test**: Can be verified by searching the codebase for `sonner` references and confirming none exist, and by confirming the `sonner` package is absent from the project's dependency list.

**Acceptance Scenarios**:

1. **Given** the refactor is complete, **When** the codebase is searched for any import or reference to `sonner`, **Then** no matches are found.
2. **Given** the refactor is complete, **When** the project's dependency manifest is inspected, **Then** `sonner` is not listed as a dependency.
3. **Given** the global app root is inspected, **When** looking for a `<Toaster />` component mount, **Then** no `<Toaster />` from Sonner is present.

---

### Edge Cases

- What happens when the error originates from the Finch SDK's `onError` callback (which provides an `errorMessage` string directly)? The inline error display must handle this path as it does the others.
- What happens if multiple Finch errors fire in rapid succession? The last error should be displayed; the component's auto-dismiss timer resets on new errors.
- What happens when the user dismisses the error and immediately retries? The error state must be cleared before the next attempt so stale messages are not shown.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The `useFinchConnect` hook MUST expose error state to its consumers so that Finch connection errors can be rendered inline in the calling component.
- **FR-002**: The `useFinchConnect` hook MUST clear the exposed error state whenever a new connection attempt begins, ensuring stale errors are not shown during a retry.
- **FR-003**: The Dashboard page MUST render Finch connection errors using the `<ErrorMessage />` component, consistent with how other pages in the project display errors.
- **FR-004**: The `<ErrorMessage />` component MUST be dismissible by the user and MUST auto-dismiss after 5 seconds, matching the component's existing behaviour.
- **FR-005**: All direct calls to `toast.error()` from Sonner within Finch-related code MUST be removed.
- **FR-006**: The global `<Toaster />` mount added to `App.tsx` for Sonner MUST be removed.
- **FR-007**: The `src/components/ui/sonner.tsx` wrapper file MUST be removed.
- **FR-008**: The `sonner` package MUST be removed from the project's dependencies.

### Key Entities

- **ErrorMessage component**: In-page inline alert component (`src/components/common/ErrorMessage.tsx`) that accepts an error message string, an optional error type, and an `onClose` callback. Auto-dismisses after 5 seconds.
- **useFinchConnect hook**: Custom hook (`src/hooks/useFinchConnect.ts`) that manages the full Finch connection flow. Currently has no external error surface; after this change it exposes an `error` string or null.
- **DashboardPage**: The consuming component (`src/pages/dashboard/DashboardPage.tsx`) that renders the "Connect with Finch" UI. Responsible for reading the error from `useFinchConnect` and rendering `<ErrorMessage />`.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Zero references to `sonner` remain in source files after the change is applied.
- **SC-002**: `sonner` is absent from the project's dependency manifest.
- **SC-003**: All four Finch error paths (missing code, code exchange failure, SDK `onError`, session fetch failure) surface an error message visible within the Dashboard page, not as a floating overlay.
- **SC-004**: Existing `<ErrorMessage />` usage in the project is unmodified — only new usage is added in Finch-related files.
- **SC-005**: The application builds without TypeScript or lint errors after the change.

## Assumptions

- The project intends `<ErrorMessage />` as the single standard mechanism for surfacing operation errors to users; no other inline error component is needed.
- The `sonner` package was added solely for the Finch feature and is not used anywhere else in the project beyond the files already identified (`App.tsx`, `useFinchConnect.ts`, `src/components/ui/sonner.tsx`).
- The `useFinchConnect` hook does not need to expose a success state; only error state needs to be surfaced (success navigates immediately to another route).
