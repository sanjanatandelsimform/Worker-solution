# Implementation Plan: Finch Status API Integration — Dashboard Visibility Control

**Branch**: `006-finch-status` | **Date**: 2026-04-02 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/006-finch-status/spec.md`

## Summary

Add a `GET /api/v1/finch/status` polling call to the Dashboard. A new `finchStatusSlice` stores `connection` and `latestSyncJob` state in Redux. A `useFinchStatus` hook dispatches `fetchFinchStatus` on mount and sets up a 15-second `setInterval`, exposing `isConnected` (true only when `connection.status === "connected"`). `DashboardPage.tsx` reads `isConnected` to conditionally hide the two onboarding choice cards and the "Connect to Finch" banner card when a Finch connection is active. The `isDashboardReady` gate controlling the Recommendations/Industry tabs remains fully unchanged. Additionally, the existing "Connect to Finch" DashboardCard button is wired to call `connectWithFinch()` from the existing `useFinchConnect` hook.

## Technical Context

**Language/Version**: TypeScript (strict mode) + React 19.2.0
**Primary Dependencies**: @reduxjs/toolkit 2.11.2 (existing), axios 1.13.2 via existing `apiClient` from `authApi.ts` — **no new packages required**
**Storage**: Redux in-memory only — finch status is NOT persisted to localStorage
**Testing**: vitest 4.x + @testing-library/react 16.x (existing project setup)
**Target Platform**: Web SPA, all modern browsers (same as project-wide target)
**Project Type**: Single web application (frontend-only)
**Performance Goals**: First poll response returns within one network round-trip of Dashboard mount; 15-second interval generates one lightweight GET request per cycle (~400 req/min at 100 concurrent users — acceptable load)
**Constraints**: No polling stop condition (FR-009); no loading skeleton for initial fetch (Clarification Q1); errors keep polling silently with no UI indicator (Clarification Q2); `isDashboardReady` gate for tabs unchanged (Clarification Q4); card hiding applies only within the `assessmentData.status === "completed"` branch for the banner card (Clarification Q3)
**Scale/Scope**: 1 new type file, 1 service function added to existing file, 1 new Redux slice, 1 new selector file, 1 new hook, 2 file modifications (DashboardPage.tsx, store.ts)

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle                           | Status  | Evidence                                                                                                                                                                                                                                                                     |
| ----------------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **I. Component-First Architecture** | ✅ PASS | `useFinchStatus` is a self-contained hook with a clear TypeScript return interface. `finchStatusSlice` encapsulates all polling-adjacent state. `DashboardPage.tsx` only consumes the derived `isConnected` boolean — no slice or polling internals leak into the component. |
| **II. User-Centric Design**         | ✅ PASS | 4 prioritized user stories with acceptance criteria and independent tests. P1 covers the primary outcome (hide cards when connected). P2 guarantees backward compatibility. P3 wires the existing button. P4 validates the polling lifecycle.                                |
| **III. Test-Driven Development**    | ✅ PASS | Tests specified before implementation for all layers: `finchApi.test.ts` (service), `finchStatusSlice.test.ts` (reducer/thunk), `useFinchStatus.test.ts` (hook + polling lifecycle with fake timers), `DashboardPage.test.tsx` additions (card visibility + button wiring).  |
| **IV. Type Safety & Code Quality**  | ✅ PASS | All types explicit: `FinchConnectionStatus` and `FinchSyncJobStatus` as union literals, `FinchStatusState`, `UseFinchStatusReturn`. No `any`. `isConnected` is a boolean derived at the hook level, not inferred as a string comparison at the component level.              |
| **V. Performance & Accessibility**  | ✅ PASS | No new bundle weight. 15-second polling is minimal CPU overhead. The `buttonIsDisabled={isFinchLoading}` prop correctly propagates a disabled ARIA attribute on the Connect button. Card hiding/showing involves no animation or layout shift risk.                          |
| **VI. State Management Discipline** | ✅ PASS | Redux Toolkit slice follows the identical pattern as `dashboardSlice.ts`. Polling side-effect lives in `useEffect` with proper cleanup (`clearInterval`). No direct state mutation. `finchStatus` slice not persisted to localStorage (keeps auth-session-scoped).           |
| **Technology Standards**            | ✅ PASS | Uses existing `apiClient` (axios interceptor-based), `react-redux`, `@reduxjs/toolkit`, `vitest`. No new packages. Conforms to `src/store/selectors/` directory convention (see Research §4).                                                                                |

**Post-Phase 1 Re-check**: All gates remain PASS. Design confirmed: selector file in `src/store/selectors/finchStatusSelectors.ts` (project convention, not co-located in slice — see Research §4). `useFinchStatus` dispatches `fetchFinchStatus` synchronously on mount before interval starts (guarantees immediate first poll). Dashboard visibility rules confirmed against all 4 clarification answers.

## Project Structure

### Documentation (this feature)

```text
specs/006-finch-status/
├── plan.md              # This file (/speckit.plan command output)
├── spec.md              # Feature specification
├── research.md          # Phase 0: key decisions and alternatives
├── data-model.md        # Phase 1: entities, types, state shapes
├── quickstart.md        # Phase 1: TDD implementation guide
├── contracts/
│   └── finch-status-api.md  # Phase 1: GET /api/v1/finch/status contract
├── checklists/
│   └── requirements.md      # Requirements traceability
└── tasks.md             # Phase 2 output (/speckit.tasks — NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── types/
│   └── finchStatusTypes.ts                  # NEW: FinchConnection, FinchSyncJob, FinchStatusState, ...
├── services/
│   └── api/
│       └── finchApi.ts                      # MODIFIED: add getFinchStatus()
├── store/
│   ├── slices/
│   │   └── finchStatusSlice.ts              # NEW: fetchFinchStatus thunk + reducer
│   ├── selectors/
│   │   └── finchStatusSelectors.ts          # NEW: selectFinchConnection, selectFinchStatusLoading, ...
│   └── store.ts                             # MODIFIED: register finchStatus reducer
├── hooks/
│   └── useFinchStatus.ts                    # NEW: polling hook — mount fetch + 15s interval
└── pages/
    └── dashboard/
        └── DashboardPage.tsx                # MODIFIED: consume isConnected, wire Connect button

tests/
├── hooks/
│   └── useFinchStatus.test.ts               # NEW: polling lifecycle (fake timers), isConnected derivation
├── services/
│   └── finchApi.test.ts                     # MODIFIED: add getFinchStatus test cases
├── store/
│   └── finchStatusSlice.test.ts             # NEW: reducer transitions, logout reset
└── pages/
    └── DashboardPage.test.tsx               # MODIFIED: card visibility + button wiring scenarios
```

**Structure Decision**: Single web application (frontend-only). All new files follow established `src/` conventions. Selector file placed in `src/store/selectors/` per project convention (not co-located in slice — documented in Research §4).

## Complexity Tracking

> No constitution violations. No entries required.
