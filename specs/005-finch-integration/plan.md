# Implementation Plan: Finch Integration

**Branch**: `005-finch-integration` | **Date**: 2026-03-31 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/005-finch-integration/spec.md`

## Summary

Wire the Finch Connect SDK (`@tryfinch/react-connect`) into the existing **Dashboard** ("Start with Finch" button) and **Get More** ("Let's get started" with Finch plan selected) pages. A single custom hook `useFinchConnect` encapsulates the entire flow: fetch a session ID from the backend (stub for now), call `open({ sessionId })` from the SDK, handle `onSuccess` by POSTing the authorization code to the backend (stub), then redirect to `/additional-questions`. Errors at any step are surfaced as toast notifications via sonner (to be added via shadcn/ui). The hook owns all toasting so components only need to consume `isLoading` and the trigger function. Both stub service functions are drop-in replaceable with real API calls.

## Technical Context

**Language/Version**: TypeScript (strict mode) + React 19.2.0  
**Primary Dependencies**: `@tryfinch/react-connect` (NEW), `sonner` via shadcn/ui `pnpm dlx shadcn@latest add sonner` (NEW), axios 1.13.2 (HTTP stubs), react-router-dom 7 (navigation)  
**Storage**: N/A — authorization code is in-flight only; no client-side persistence  
**Testing**: vitest 4.0 + @testing-library/react 16.3 + @testing-library/react-hooks (existing setup)  
**Target Platform**: Web SPA, all modern browsers (same as project-wide target)  
**Project Type**: Single web application (frontend-only — backend stubs in service files)  
**Performance Goals**: Finch overlay must open within one network round-trip of button click; redirect occurs immediately after code exchange resolves  
**Constraints**: Button must be non-interactive (disabled + loading) during all async operations to prevent duplicate submissions (FR-013); hook resets to idle on any terminal event (success redirect, error, or close)  
**Scale/Scope**: 1 new hook, 2 new stub service functions, 2 modified page components, 1 new shadcn component (sonner Toaster), tests for hook + stubs + page integration

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle                           | Status  | Evidence                                                                                                                                                                                                                                                                 |
| ----------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **I. Component-First Architecture** | ✅ PASS | `useFinchConnect` is a self-contained hook with a clear TypeScript interface. Dashboard and Get More page components only receive and call the hook's trigger function — no SDK internals leak into them. Stub services are isolated files with typed return shapes.     |
| **II. User-Centric Design**         | ✅ PASS | 3 prioritized user stories with acceptance criteria and independent tests (P1 Dashboard, P2 Get More, P3 Stubs). Each story is independently testable and delivers standalone value. Loading state and toast errors give users clear feedback at every step.             |
| **III. Test-Driven Development**    | ✅ PASS | Tests are written before implementation. Coverage includes hook happy path, session ID failure, `onError`, `onClose`, code-exchange failure, Dashboard button behavior, Get More Finch + Manual Entry paths, and both stub service functions.                            |
| **IV. Type Safety & Code Quality**  | ✅ PASS | All hook return types, service response types (`FinchSessionResponse`, `FinchConnectResponse`), and callback parameter types (`FinchSuccessEvent`, `FinchErrorEvent`) are explicitly typed. No `any`. Existing `UseFinchConnectReturn` interface exported for consumers. |
| **V. Performance & Accessibility**  | ✅ PASS | Buttons disabled during loading (ARIA `disabled` attribute). Sonner toast is accessible (ARIA live region). No additional bundle weight beyond two new packages, both well-established and tree-shakeable.                                                               |
| **VI. State Management Discipline** | ✅ PASS | All state is local to the hook (`isLoading`, `status`). No global state introduced. Side effects (session fetch, code exchange) live in the trigger function and SDK callbacks. State updates are immutable.                                                             |
| **Technology Standards**            | ✅ PASS | Uses existing axios client pattern, react-router-dom `useNavigate`, vitest, React 19, TypeScript strict mode. New packages (`@tryfinch/react-connect`, `sonner`) are targeted additions with no conflicts.                                                               |

**Post-Phase 1 Re-check**: All gates remain PASS. Design confirmed that the hook fully owns error toasting (components export zero error UI), stub services follow the identical shape as existing API service files, and sonner's `<Toaster />` is a one-time addition to `App.tsx` or root layout.

## Project Structure

### Documentation (this feature)

```text
specs/005-finch-integration/
├── plan.md              # This file
├── research.md          # Phase 0: architectural decisions
├── data-model.md        # Phase 1: entities and state machine
├── quickstart.md        # Phase 1: implementation guide
├── contracts/
│   ├── finch-session.md     # Phase 1: POST /api/finch/sessions contract (stub + future real)
│   └── finch-connect.md     # Phase 1: POST /api/finch/connect contract (stub + future real)
├── checklists/
│   └── requirements.md      # Requirements traceability
└── tasks.md             # Phase 2 output (speckit.tasks — NOT created by speckit.plan)
```

### Source Code (repository root)

```text
src/
├── services/
│   └── api/
│       └── finchApi.ts                         # NEW: getFinchSessionId() + exchangeFinchCode() stubs
├── hooks/
│   └── useFinchConnect.ts                      # NEW: Custom hook — full Finch flow
├── pages/
│   ├── dashboard/
│   │   └── DashboardPage.tsx                   # MODIFIED: replace handleFinchStarted with hook trigger
│   └── getMore/
│       └── GetMore.tsx                         # MODIFIED: replace direct navigate with hook trigger for Finch plan
└── App.tsx (or root layout)                    # MODIFIED: add <Toaster /> from sonner

tests/
├── hooks/
│   └── useFinchConnect.test.ts                 # NEW: Unit tests for hook (all paths)
├── services/
│   └── finchApi.test.ts                        # NEW: Unit tests for stub service functions
└── pages/
    ├── DashboardPage.test.tsx                  # MODIFIED: add Finch flow test scenarios
    └── GetMore.test.tsx                        # NEW or MODIFIED: Finch + Manual Entry navigation tests
```

**Structure Decision**: Single web application (frontend-only). All new source files follow the established `src/hooks/` and `src/services/api/` pattern already used by `useStatesLookup.ts` and `dashboardApi.ts`.

## Complexity Tracking

> No constitution violations. No entries required.
