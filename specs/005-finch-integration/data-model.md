# Data Model: Finch Integration

**Feature**: 005-finch-integration  
**Date**: 2026-03-31

## Entities

### FinchSession

A short-lived authorization token issued by the backend that permits opening one Finch Connect session.

| Field       | Type     | Source                               | Notes                                |
| ----------- | -------- | ------------------------------------ | ------------------------------------ |
| `sessionId` | `string` | Backend (`POST /api/finch/sessions`) | Stub returns `"stub-session-id-001"` |

```typescript
export interface FinchSessionResponse {
  sessionId: string;
}
```

---

### FinchAuthorizationCode

A single-use code returned by the Finch Connect overlay on successful user authorization. Never stored client-side — passed directly to the backend.

| Field   | Type                  | Source                         | Notes                                     |
| ------- | --------------------- | ------------------------------ | ----------------------------------------- |
| `code`  | `string`              | Finch SDK `onSuccess` callback | Must be non-empty to trigger exchange     |
| `state` | `string \| undefined` | Finch SDK `onSuccess` callback | Optional; echoed from `open()` parameters |

```typescript
// SDK callback shape (from @tryfinch/react-connect)
export interface FinchSuccessEvent {
  code: string;
  state?: string;
}

export interface FinchErrorEvent {
  errorMessage: string;
  errorType: "validation_error" | "employer_connection_error";
}
```

---

### FinchConnectResult

The backend's acknowledgement that the authorization code has been received and processed.

| Field     | Type      | Source                              | Notes                      |
| --------- | --------- | ----------------------------------- | -------------------------- |
| `success` | `boolean` | Backend (`POST /api/finch/connect`) | Stub always returns `true` |

```typescript
export interface FinchConnectResponse {
  success: boolean;
}
```

---

## Hook Interface

```typescript
export interface UseFinchConnectReturn {
  /** Call this when the user clicks "Start with Finch" or "Let's get started" (Finch plan) */
  connectWithFinch: () => Promise<void>;
  /** True while any async operation is in progress (session fetch or code exchange) */
  isLoading: boolean;
}
```

---

## Hook State Machine

```
         ┌──────────────────────────────────────────────┐
         │                    idle                       │
         └──────────────────────────────────────────────┘
                          │  connectWithFinch()
                          ▼
         ┌──────────────────────────────────────────────┐
         │              fetching-session                 │
         └──────────────────────────────────────────────┘
          │ success          │ error
          ▼                  ▼
 ┌──────────────┐     ┌──────────────┐
 │  connecting  │     │     idle     │ ← toast error shown
 └──────────────┘     └──────────────┘
  │ onSuccess    │ onError   │ onClose
  ▼              ▼           ▼
┌──────────────┐ ┌────────┐ ┌──────┐
│ exchanging-  │ │  idle  │ │ idle │ ← no toast on close
│    code      │ └────────┘ └──────┘
└──────────────┘   ↑ toast
  │ success  │ error
  ▼          ▼
navigate   idle ← toast error shown
/additional-
questions
```

### Status type

```typescript
type FinchConnectStatus = "idle" | "fetching-session" | "connecting" | "exchanging-code";
```

`isLoading` is derived: `status !== 'idle'`

---

## Validation Rules

- `code` from Finch `onSuccess` MUST be a non-empty string before calling `exchangeFinchCode`. If empty/falsy, show toast error and reset to idle without calling the backend.
- While `isLoading === true`, `connectWithFinch()` MUST be a no-op (guard at the top of the function). This prevents concurrent invocations.
