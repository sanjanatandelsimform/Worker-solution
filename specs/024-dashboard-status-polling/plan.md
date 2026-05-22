# Implementation Plan: Dashboard Status API Polling

**Branch**: `024-dashboard-status-polling` | **Date**: 2026-04-29 | **Spec**: [spec.md](spec.md)  
**Input**: Feature specification from `/specs/024-dashboard-status-polling/spec.md`

## Summary

Implement a dashboard status polling flow that starts when the DashboardPage trigger condition is met (`isConnected || assessmentData?.data?.status === "completed"`), then calls `/api/v1/dashboard/status` repeatedly using backend-provided `suggestPollMs` until `allSettled === true`.

Clarified behavior included in this plan:

- Polling continues in hidden tabs.
- `suggestPollMs` is authoritative and can be large (including hour-level milliseconds).
- For non-429 failures: retry up to 3 times with exponential backoff (1000ms, 2000ms, 4000ms), then stop and set error state.
- For HTTP 429: no special handling; continue normal polling schedule.

## Technical Context

**Language/Version**: TypeScript 5.x + React 19  
**Primary Dependencies**: React hooks, Axios via existing authenticated api client, Redux Toolkit (existing store), Vitest + React Testing Library  
**Storage**: In-memory hook state only (no new persistent storage)  
**Testing**: Vitest, React Testing Library, fake timers (`vi.useFakeTimers`)  
**Target Platform**: Web SPA (Vite)  
**Project Type**: Single web application (`src/`)  
**Performance Goals**: Poll scheduling accuracy meets spec (±200ms or ±1%); no timer leaks on unmount  
**Constraints**: Honor backend `suggestPollMs` without max cap; keep existing DashboardPage behavior and routing unchanged  
**Scale/Scope**: 6-8 files expected (API service, types, new hook, Dashboard integration, unit tests)

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle                       | Status | Notes                                                                           |
| ------------------------------- | ------ | ------------------------------------------------------------------------------- |
| I. Component-First Architecture | PASS   | Polling logic isolated in reusable hook, page consumes hook output only         |
| II. User-Centric Design         | PASS   | Trigger and stop conditions directly map to user-visible dashboard readiness    |
| III. Test-Driven Development    | PASS   | Plan includes hook and page tests for trigger, timing, retries, stop conditions |
| IV. Type Safety & Code Quality  | PASS   | New response and hook contracts modeled in explicit TypeScript interfaces       |
| V. Performance & Accessibility  | PASS   | Timer lifecycle cleanup required; no accessibility regressions introduced       |
| VI. State Management Discipline | PASS   | Server polling state remains local to hook; no unnecessary global state         |

**Gate result**: All gates pass. No violations to track.

## Project Structure

### Documentation (this feature)

```text
specs/024-dashboard-status-polling/
├── plan.md            # this file
├── spec.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── dashboard-status-api.yaml
└── checklists/
    └── requirements.md
```

### Source Code (planned changes)

```text
src/
├── hooks/
│   └── useDashboardStatusPolling.ts         # NEW
├── pages/
│   └── dashboard/
│       └── DashboardPage.tsx                # MODIFY (trigger + hook wiring)
├── services/
│   └── api/
│       └── dashboardApi.ts                  # MODIFY (add getDashboardStatus)
└── types/
    └── dashboardStatusTypes.ts              # NEW

tests/
├── hooks/
│   └── useDashboardStatusPolling.test.tsx   # NEW
└── pages/
    └── DashboardPage.test.tsx               # MODIFY (trigger and polling usage)
```

**Structure Decision**: Keep polling orchestration in a dedicated hook (`src/hooks`) and keep API call concerns in `dashboardApi.ts` for consistency with existing service organization.

## Implementation Plan

### Phase 0: Research

See [research.md](research.md). Key decisions are resolved for:

- Trigger condition and start timing
- Dynamic poll interval behavior
- Long interval handling
- Retry policy
- 429 handling

### Phase 1: Design

See:

- [data-model.md](data-model.md)
- [contracts/dashboard-status-api.yaml](contracts/dashboard-status-api.yaml)
- [quickstart.md](quickstart.md)

### Phase 2: Implementation Breakdown

1. Add typed status response models in `src/types/dashboardStatusTypes.ts`.
2. Extend `src/services/api/dashboardApi.ts` with `getDashboardStatus()` targeting `/api/v1/dashboard/status`.
3. Implement `src/hooks/useDashboardStatusPolling.ts` with:
   - trigger-aware start
   - recursive timeout scheduling (not fixed interval)
   - dynamic next-delay from `suggestPollMs`
   - stop on `allSettled === true`
   - retry policy for non-429 failures
   - cleanup on unmount
4. Integrate hook into `src/pages/dashboard/DashboardPage.tsx` using trigger condition:
   - `isConnected || assessmentData?.data?.status === "completed"`
5. Add tests first (TDD):
   - hook timer behavior with fake timers
   - stop condition and retry behavior
   - DashboardPage trigger wiring

## Acceptance Criteria Mapping

| Spec Requirement               | Planned Implementation                                                          |
| ------------------------------ | ------------------------------------------------------------------------------- |
| FR-001 Trigger condition       | DashboardPage passes/enforces condition in hook-enabled state                   |
| FR-002/FR-006 Dynamic interval | Hook reads each response `suggestPollMs` and schedules next timeout accordingly |
| FR-003/FR-004 Continue/stop    | Hook polls until `allSettled === true`, then clears timer and halts             |
| FR-005 Refresh reset           | Full page refresh remounts hook, restarting timing cycle naturally              |
| FR-007 Retries                 | Non-429 failures retried with 1000/2000/4000ms then error/stop                  |
| FR-008 Boundaries              | Minimum guard for non-positive intervals; no maximum cap                        |
| FR-010 Hook interface          | Hook returns status/loading/error + start/stop/reset controls                   |
| FR-011 HTTP 429                | Treated as normal cadence path (no special backoff override)                    |

## Complexity Tracking

No constitution violations and no exceptional complexity requiring justification.
