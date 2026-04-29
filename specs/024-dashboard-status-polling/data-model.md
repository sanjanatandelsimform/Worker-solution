# Data Model: Dashboard Status API Polling

**Feature**: 024-dashboard-status-polling  
**Phase**: 1 - Design  
**Date**: 2026-04-29

## Entity: DashboardStatusResponse

Represents the response payload from GET /api/v1/dashboard/status.

```ts
export type StatusValue = "pending" | "completed" | "not_applicable";

export type ProviderType = "assisted" | "automated" | null;

export interface StatusSection {
  status: StatusValue;
  updatedAt: string | null;
}

export interface DashboardStatusResponse {
  recommendation: StatusSection;
  workforce: StatusSection;
  industry: StatusSection;
  allSettled: boolean;
  suggestPollMs: number;
  updatedAt: string;
  createdAt: string;
  source: string;
  providerType: ProviderType;
}
```

## Entity: DashboardStatusPollingState

Internal hook state used for orchestration.

```ts
export interface DashboardStatusPollingState {
  status: DashboardStatusResponse | null;
  isLoading: boolean;
  isPolling: boolean;
  error: string | null;
  retryCount: number;
  nextDelayMs: number | null;
  lastPolledAt: number | null;
}
```

## Entity: UseDashboardStatusPollingReturn

Public hook contract consumed by pages/components.

```ts
export interface UseDashboardStatusPollingReturn {
  status: DashboardStatusResponse | null;
  isLoading: boolean;
  error: string | null;
  isPolling: boolean;
  start: () => void;
  stop: () => void;
  reset: () => void;
}
```

## State Transitions

```text
idle
  -> (trigger true or start()) loading-first-request
loading-first-request
  -> (success, allSettled=false) polling-scheduled
  -> (success, allSettled=true) settled-stopped
  -> (non-429 failure) retry-backoff-1
  -> (429) polling-scheduled
retry-backoff-1
  -> loading-request
  -> retry-backoff-2
retry-backoff-2
  -> loading-request
  -> retry-backoff-3
retry-backoff-3
  -> loading-request
  -> failed-stopped
polling-scheduled
  -> loading-request
loading-request
  -> polling-scheduled
  -> settled-stopped
  -> retry-backoff-N (non-429)
  -> polling-scheduled (429)
settled-stopped
failed-stopped
  -> (reset/start) loading-first-request
```

## Derived Rules

1. Next delay =
   - `Math.max(1000, suggestPollMs)` when response is successful and `allSettled === false`.
   - Retry delay from sequence [1000, 2000, 4000] for non-429 failures.
2. Any successful response resets `retryCount` to 0.
3. Polling stops immediately and permanently for current cycle when `allSettled === true`.
4. Full page refresh restarts cycle naturally through remount.

## Validation Rules

1. `suggestPollMs` must be treated as milliseconds.
2. `suggestPollMs` can be very large and must not be upper-clamped.
3. Non-positive `suggestPollMs` must be corrected to 1000ms minimum.
4. `updatedAt` and `createdAt` are preserved as strings; parsing is optional and not required for polling.
