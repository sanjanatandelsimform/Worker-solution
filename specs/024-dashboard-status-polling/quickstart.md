# Quickstart: Dashboard Status API Polling

**Feature**: 024-dashboard-status-polling  
**Branch**: 024-dashboard-status-polling  
**Date**: 2026-04-29

## Goal

Implement polling for GET /api/v1/dashboard/status that:

- Starts when DashboardPage condition is true.
- Waits the backend-provided `suggestPollMs` before each subsequent call.
- Repeats until `allSettled === true`.
- Handles retries exactly as specified.

## Files to Change

| File                                           | Change                                   |
| ---------------------------------------------- | ---------------------------------------- |
| src/types/dashboardStatusTypes.ts              | New status response interfaces           |
| src/services/api/dashboardApi.ts               | Add `getDashboardStatus()` API helper    |
| src/hooks/useDashboardStatusPolling.ts         | New polling orchestration hook           |
| src/pages/dashboard/DashboardPage.tsx          | Wire trigger condition into polling hook |
| tests/hooks/useDashboardStatusPolling.test.tsx | New polling behavior tests               |
| tests/pages/DashboardPage.test.tsx             | Add trigger-wiring tests                 |

## Step 1: Add types

Create `src/types/dashboardStatusTypes.ts` with:

- `StatusValue`, `ProviderType`
- `StatusSection`
- `DashboardStatusResponse`
- `UseDashboardStatusPollingReturn`

## Step 2: Add API call

In `src/services/api/dashboardApi.ts`:

1. Import `DashboardStatusResponse` type.
2. Add `getDashboardStatus(): Promise<DashboardStatusResponse>` using authenticated client.
3. Call endpoint `/api/v1/dashboard/status`.
4. Reuse existing error utility conventions already used in this service.

## Step 3: Implement polling hook

Create `src/hooks/useDashboardStatusPolling.ts` with behavior:

1. Accept config:
   - `enabled?: boolean`
2. Expose:
   - `status`, `isLoading`, `error`, `isPolling`, `start`, `stop`, `reset`
3. Scheduling:
   - First call when enabled becomes true (or `start()` called)
   - Subsequent calls after `Math.max(1000, suggestPollMs)`
   - Use chained `setTimeout`
4. Stop rules:
   - stop when `allSettled === true`
   - stop on explicit `stop()`
   - cleanup timer on unmount
5. Retry rules (non-429 only):
   - delays 1000ms, 2000ms, 4000ms
   - stop and set error after max retries
6. 429 handling:
   - no special mode; continue normal cadence

## Step 4: Integrate into DashboardPage

In `src/pages/dashboard/DashboardPage.tsx`:

1. Compute/confirm trigger condition:
   - `const shouldPollDashboardStatus = isConnected || assessmentData?.data?.status === "completed";`
2. Call hook with enabled flag.
3. Keep UI behavior unchanged for this phase unless status loading indicator is explicitly required by task scope.
4. Ensure effect dependencies are stable and do not create duplicate polling loops.

## Step 5: Write tests first (TDD)

### Hook tests (`tests/hooks/useDashboardStatusPolling.test.tsx`)

Required cases:

1. Starts polling when enabled true.
2. Uses returned `suggestPollMs` for next cycle.
3. Honors long delays (e.g., 3600000ms) without capping.
4. Uses 1000ms minimum when `suggestPollMs <= 0`.
5. Stops when `allSettled` becomes true.
6. Retries non-429 failures with 1000/2000/4000 then sets error and stops.
7. Does not apply special flow for 429.
8. Clears timers on unmount.

### Page test updates (`tests/pages/DashboardPage.test.tsx`)

Required cases:

1. Polling hook enabled when `isConnected === true`.
2. Polling hook enabled when assessment status is completed.
3. Polling hook disabled when neither condition is true.

## Verification

Run:

```sh
pnpm run type-check
pnpm lint:fix
pnpm test
```

Manual smoke check:

1. Launch app and navigate to dashboard under trigger condition.
2. Observe recurring status calls in network panel with dynamic delays.
3. Confirm calls stop after response with `allSettled: true`.
