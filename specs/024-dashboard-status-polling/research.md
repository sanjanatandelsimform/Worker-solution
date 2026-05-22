# Research: Dashboard Status API Polling

**Feature**: 024-dashboard-status-polling  
**Phase**: 0 - Research  
**Date**: 2026-04-29

## Summary

No external research required. Decisions are based on the approved feature specification and current repository architecture.

## Decision 1: Poll Scheduler Type

**Decision**: Use chained `setTimeout` instead of `setInterval`.

**Rationale**:

- Each response can change the next interval through `suggestPollMs`.
- `setTimeout` avoids overlap if a request is slower than the previous delay.
- Easier cancellation semantics with one active timer ref.

**Alternatives considered**:

- Fixed `setInterval`: rejected because dynamic interval changes are harder and overlap risk is higher.

## Decision 2: Trigger Source

**Decision**: Start polling only when DashboardPage condition is true:
`isConnected || assessmentData?.data?.status === "completed"`.

**Rationale**:

- Matches current DashboardPage dispatch gating behavior.
- Prevents status endpoint polling before dashboard-relevant prerequisites are satisfied.

## Decision 3: Interval Guardrails

**Decision**:

- If `suggestPollMs <= 0`, use minimum 1000ms.
- No upper cap; allow large values (including hour-level ms).

**Rationale**:

- Prevents rapid-fire loops on malformed/zero values.
- Honors backend as source of truth for slow cadence periods.

## Decision 4: Failure and Retry Policy

**Decision**:

- For network/transport and non-429 server errors: retry up to 3 times using delays 1000ms, 2000ms, 4000ms.
- After max retries, stop polling and expose error state.
- For HTTP 429: apply no special mode; continue normal poll flow.

**Rationale**:

- Matches clarified specification.
- Keeps behavior deterministic and testable.

## Decision 5: Where to place logic

**Decision**:

- API call in `src/services/api/dashboardApi.ts` as `getDashboardStatus`.
- Polling orchestration in new `src/hooks/useDashboardStatusPolling.ts`.
- Page integration in `src/pages/dashboard/DashboardPage.tsx`.

**Rationale**:

- Consistent with existing service/hook separation.
- Keeps DashboardPage mostly declarative.

## Decision 6: Testing strategy

**Decision**:

- Unit-test hook with fake timers and mocked API responses.
- Integration-level page tests verify trigger condition wiring.

**Rationale**:

- Time-dependent behavior must be deterministic.
- Trigger condition is a page concern and should be asserted from page-level tests.

## Resolved Technical Context

| Unknown                   | Resolution                                                       |
| ------------------------- | ---------------------------------------------------------------- |
| How to schedule next poll | Chained setTimeout using latest response value                   |
| Trigger location          | DashboardPage condition gates hook enable                        |
| Long poll intervals       | Supported as-is (no max clamp)                                   |
| Retry policy details      | 3 retries with 1000/2000/4000ms for non-429 failures             |
| 429 behavior              | No special handling; normal cadence                              |
| File placement            | New hook + existing dashboard API service + typed response model |
