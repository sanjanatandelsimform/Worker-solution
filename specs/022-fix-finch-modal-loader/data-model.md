# Data Model: Fix Finch Modal Loading State

**Feature**: 022-fix-finch-modal-loader  
**Phase**: 1 — Design  
**Date**: 2026-04-24

---

## Entities

### `FinchConnectStatus` (existing, unchanged)

The internal state discriminant of `useFinchConnect`. No changes to the type itself.

```ts
type FinchConnectStatus =
  | "idle" // no flow active
  | "fetching-session" // backend GET /finch/session in progress
  | "connecting" // Finch Connect modal is open
  | "exchanging-code"; // backend POST /finch/exchange in progress
```

---

### `UseFinchConnectReturn` (modified)

The public interface of `useFinchConnect`. One new field is added; all existing fields are unchanged.

```ts
export interface UseFinchConnectReturn {
  connectWithFinch: () => Promise<void>;

  /** True for ALL non-idle phases. Use to disable interactive controls. */
  isLoading: boolean; // existing — status !== "idle"

  /**
   * True ONLY during server-request phases (fetching-session, exchanging-code).
   * False while the Finch Connect modal is open (connecting).
   * Use to gate full-screen page-level spinners.
   */
  isPageLoading: boolean; // NEW — status === "fetching-session" || status === "exchanging-code"

  error: string | null;
  clearError: () => void;
}
```

#### Field derivation

| Field           | Derived from `status`                                             |
| --------------- | ----------------------------------------------------------------- |
| `isLoading`     | `status !== "idle"` (unchanged)                                   |
| `isPageLoading` | `status === "fetching-session" \|\| status === "exchanging-code"` |

---

## State Transitions (unchanged)

```
┌──────────────────────────────────────────────────────────────────────────┐
│  connectWithFinch() called                                                │
│                                                                          │
│  idle ─── (setStatus "fetching-session") ──▶ fetching-session            │
│                isPageLoading = true / isLoading = true                   │
│                                                                          │
│            ├── success: getFinchSessionId() ──▶ connecting               │
│            │         isPageLoading = false / isLoading = true            │
│            │         (Finch modal rendered; user interacts)              │
│            │                                                             │
│            │   ├── onSuccess(code) ──▶ exchanging-code                   │
│            │   │     isPageLoading = true / isLoading = true             │
│            │   │     └── success ──▶ navigate("/additional-questions")   │
│            │   │         idle (navigation unmounts component)            │
│            │   │     └── failure ──▶ idle (error set)                    │
│            │   │         isPageLoading = false / isLoading = false       │
│            │   │                                                         │
│            │   ├── onError() ──▶ idle (error set)                        │
│            │   │     isPageLoading = false / isLoading = false           │
│            │   │                                                         │
│            │   └── onClose() ──▶ idle (no error)                         │
│            │         isPageLoading = false / isLoading = false           │
│            │                                                             │
│            └── failure: getFinchSessionId() ──▶ idle (error set)         │
│                  isPageLoading = false / isLoading = false               │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Dashboard Guard Logic (changed)

| Guard location in `DashboardPage.tsx` | Before                                    | After                                         |
| ------------------------------------- | ----------------------------------------- | --------------------------------------------- |
| Full-screen spinner early-return      | `isLoadingAssessment \|\| isFinchLoading` | `isLoadingAssessment \|\| isFinchPageLoading` |
| Button `isDisabled` prop              | `isFinchLoading` (unchanged)              | `isFinchLoading` (unchanged)                  |

---

## No New Entities

This feature does not introduce any new components, Redux slices, API endpoints, localStorage keys, or routes. It is a targeted state-derivation fix within an existing hook and a one-line guard change in the Dashboard page.
