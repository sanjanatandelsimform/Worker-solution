# Data Model: Finch Reauth Status Flag

**Feature**: `031-finch-reauth-status`  
**Phase**: 1 — Design  
**Date**: 2026-05-01

## New / Modified Types

### `FinchConnectionStatus` (new union type)

Located in `src/types/dashboardStatusTypes.ts`.

```
"connected"        — Finch connection is healthy; data syncing normally
"reauth_required"  — Finch authorization has expired; user must reconnect
"disconnected"     — Finch connection was explicitly removed
"pending"          — Finch connection is being established (initial sync in progress)
```

**Nullability**: The field is optional on the response. When absent (e.g., non-Finch assessment users), all downstream derived flags remain `false`.

---

### `DashboardStatusResponse` (extended)

| Field                       | Type                                     | Change             |
| --------------------------- | ---------------------------------------- | ------------------ |
| `recommendation`            | `StatusSection`                          | Existing           |
| `workforce`                 | `StatusSection`                          | Existing           |
| `industry`                  | `StatusSection`                          | Existing           |
| `allSettled`                | `boolean`                                | Existing           |
| `suggestPollMs`             | `number`                                 | Existing           |
| `updatedAt`                 | `string`                                 | Existing           |
| `createdAt`                 | `string`                                 | Existing           |
| `source`                    | `string`                                 | Existing           |
| `providerType`              | `ProviderType`                           | Existing           |
| **`finchConnectionStatus`** | **`FinchConnectionStatus \| undefined`** | **NEW — optional** |

---

### `UseDashboardStatusPollingReturn` (extended)

| Field                         | Type                              | Change                                                                 |
| ----------------------------- | --------------------------------- | ---------------------------------------------------------------------- |
| `status`                      | `DashboardStatusResponse \| null` | Existing                                                               |
| `isLoading`                   | `boolean`                         | Existing                                                               |
| `error`                       | `string \| null`                  | Existing                                                               |
| `isPolling`                   | `boolean`                         | Existing                                                               |
| `start`                       | `() => void`                      | Existing                                                               |
| `stop`                        | `() => void`                      | Existing                                                               |
| `reset`                       | `() => void`                      | Existing                                                               |
| `isRecommendationTabReady`    | `boolean`                         | Existing                                                               |
| `isWorkforceTabReady`         | `boolean`                         | Existing                                                               |
| `isIndustryTabReady`          | `boolean`                         | Existing                                                               |
| `hasExceededProcessingWindow` | `boolean`                         | Existing                                                               |
| `isRecommendationTabStale`    | `boolean`                         | Existing                                                               |
| `isWorkforceTabStale`         | `boolean`                         | Existing                                                               |
| `isIndustryTabStale`          | `boolean`                         | Existing                                                               |
| `isAutomatedProvider`         | `boolean`                         | Existing                                                               |
| **`isReauthRequired`**        | **`boolean`**                     | **NEW — true only when `finchConnectionStatus === "reauth_required"`** |

---

### `UseFinchConnectReturn` (extended)

| Field                    | Type                      | Change                                                                                     |
| ------------------------ | ------------------------- | ------------------------------------------------------------------------------------------ |
| `connectWithFinch`       | `() => Promise<void>`     | Existing — triggers Finch flow + navigates to `/additional-questions` on success           |
| `isLoading`              | `boolean`                 | Existing                                                                                   |
| `isPageLoading`          | `boolean`                 | Existing                                                                                   |
| `error`                  | `string \| null`          | Existing                                                                                   |
| `clearError`             | `() => void`              | Existing                                                                                   |
| **`reconnectWithFinch`** | **`() => Promise<void>`** | **NEW — same as `connectWithFinch` but skips `/additional-questions` redirect on success** |

---

## Derivation Logic

### `isReauthRequired`

```
status?.finchConnectionStatus === "reauth_required"
  → true   (user must reconnect)
  → false  (any other value, or field absent, or status is null)
```

### `isReconnectRef` (internal ref in `useFinchConnect`)

```
Initial value: false
Set to true:   when reconnectWithFinch() is called (before opening SDK)
Reset to false: immediately after onSuccess checks the value, whether navigating or not
```

The ref lifecycle ensures repeated reconnect attempts each behave correctly even if the user dismissed the popup and clicked Reconnect again.

## State Transition Diagram

```
Finch Connection Health (from API):
  pending  ──→  connected  (sync complete)
  pending  ──→  reauth_required  (auth expired mid-sync)
  connected  ──→  reauth_required  (token revoked externally)
  reauth_required  ──[user clicks Reconnect]──→  pending  ──→  connected

UI card visibility:
  isReauthRequired=false  →  card hidden
  isReauthRequired=true   →  card shown  →  user clicks Reconnect
                            →  Finch SDK opens  →  completes
                            →  stays on dashboard (no /additional-questions redirect)
```
