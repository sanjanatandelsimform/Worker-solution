# Implementation Plan: Fix Finch Modal Loading State

**Branch**: `022-fix-finch-modal-loader` | **Date**: 2026-04-24 | **Spec**: [spec.md](spec.md)  
**Input**: Feature specification from `/specs/022-fix-finch-modal-loader/spec.md`

## Summary

The `useFinchConnect` hook currently exposes `isLoading = status !== "idle"`, which is `true` for the entire Finch connection flow including while the Finch Connect modal is open. `DashboardPage.tsx` uses this flag to render a full-screen `<LoadingSpinner>`, causing the spinner to run visibly behind the open modal.

**Fix**: Add a new `isPageLoading` derived boolean to the hook's return value — `true` only during the `fetching-session` and `exchanging-code` phases (server round-trips), `false` while the modal is open (`connecting`). Update `DashboardPage.tsx` to use `isPageLoading` (instead of `isLoading`) for the spinner guard only. Button disabled state continues to use `isLoading` (unchanged).

**Scope**: 2 source files, 2 test files. No new imports, no new components, no routing or API changes.

## Technical Context

**Language/Version**: TypeScript 5 + React 19  
**Primary Dependencies**: `useFinchConnect` hook (`src/hooks/useFinchConnect.ts`), `@tryfinch/react-connect` SDK  
**Storage**: N/A  
**Testing**: Vitest + React Testing Library (`pnpm test`)  
**Target Platform**: Web (React SPA, Vite)  
**Project Type**: Single web application (`src/`)  
**Performance Goals**: No performance impact — one additional boolean derivation per render cycle  
**Constraints**: Must not break existing T009–T016 hook tests or T017 Dashboard button-disabled test  
**Scale/Scope**: 4 files changed, ~30 lines total

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle                       | Status  | Notes                                                                   |
| ------------------------------- | ------- | ----------------------------------------------------------------------- |
| I. Component-First Architecture | ✅ PASS | Hook return interface extended cleanly; no prop-drilling introduced     |
| II. User-Centric Design         | ✅ PASS | Spec written with user stories; acceptance criteria defined             |
| III. Test-Driven Development    | ✅ PASS | 5 new tests written before implementation; all existing tests preserved |
| IV. Type Safety & Code Quality  | ✅ PASS | `UseFinchConnectReturn` interface updated; strict TypeScript; no `any`  |
| V. Performance & Accessibility  | ✅ PASS | One extra boolean derivation per render; no accessibility impact        |
| VI. State Management Discipline | ✅ PASS | No new global state; derived value from existing `status` local state   |

**Gate result**: All gates pass. No violations to document.

## Project Structure

### Documentation (this feature)

```text
specs/022-fix-finch-modal-loader/
├── plan.md         ← this file
├── spec.md
├── research.md     ← Phase 0 output
├── data-model.md   ← Phase 1 output
├── quickstart.md   ← Phase 1 output
└── checklists/
    └── requirements.md
```

### Source Code (files changed)

```text
src/
├── hooks/
│   └── useFinchConnect.ts        ← add isPageLoading to interface + derivation + return
└── pages/
    └── dashboard/
        └── DashboardPage.tsx     ← destructure isPageLoading; use in spinner guard only

tests/
├── hooks/
│   └── useFinchConnect.test.tsx  ← add T017a–T017d (isPageLoading assertions)
└── pages/
    └── DashboardPage.test.tsx    ← add isPageLoading to mock default; add T018
```

No new files created. No contracts directory needed (no API changes).

## Complexity Tracking

No constitution violations. No complexity justification required.
