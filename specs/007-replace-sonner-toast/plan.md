# Implementation Plan: Replace Sonner Toast with ErrorMessage Component in Finch Feature

**Branch**: `007-replace-sonner-toast` | **Date**: 2026-04-07 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/007-replace-sonner-toast/spec.md`

## Summary

Remove the `sonner` toast library from the Finch integration and replace all four `toast.error()` call sites in `useFinchConnect` with an `error: string | null` field exposed from the hook's return interface. A companion `clearError: () => void` callback is also exposed. `DashboardPage.tsx` reads `finchError` and renders `<ErrorMessage />` co-located inside each of the two Finch connect UI sections. `App.tsx` loses the `<Toaster />` global mount and its import. `src/components/ui/sonner.tsx` is deleted. `pnpm remove sonner` removes the package from the manifest. Existing `useFinchConnect` and `DashboardPage` tests are updated to remove Sonner mocks and add `error`-state assertions. No new packages, no API changes.

## Technical Context

**Language/Version**: TypeScript (strict mode) + React 19.2.0  
**Primary Dependencies**: **No new packages**. All needed: `useState`, `useCallback` (React built-ins), `<ErrorMessage />` (`src/components/common/ErrorMessage.tsx`), `AlertCircle` (`@untitledui/icons`)  
**Storage**: N/A — no persistence  
**Testing**: vitest 4.x + @testing-library/react 16.x (existing project setup)  
**Target Platform**: Web SPA, all modern browsers  
**Project Type**: Single web application (frontend-only)  
**Performance Goals**: No change to performance profile — removes a package, reduces bundle size marginally  
**Constraints**: `useFinchConnect` hook must own its `error` state (not lifted to Redux or DashboardPage local state); `clearError` must be a stable `useCallback`-memoized function; `error` must be cleared at the start of each new `connectWithFinch()` call (FR-002); no changes to `<ErrorMessage />` component itself (SC-004)  
**Scale/Scope**: 2 source files modified, 1 source file deleted, 1 wrapper file deleted, 2 test files modified — smallest possible change footprint

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle                           | Status  | Evidence                                                                                                                                                                                                                                          |
| ----------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **I. Component-First Architecture** | ✅ PASS | `useFinchConnect` is a self-contained hook; `error` and `clearError` are clean additions to its public interface. `DashboardPage` consumes only the derived values — no internal hook state leaks to the component. `<ErrorMessage />` unchanged. |
| **II. User-Centric Design**         | ✅ PASS | 2 prioritized user stories with acceptance criteria. P1 covers inline error display across all 4 error paths. P2 ensures full dependency removal. Each story is independently testable.                                                           |
| **III. Test-Driven Development**    | ✅ PASS | Hook tests updated first (remove Sonner mock, assert `result.current.error`). Dashboard tests updated first (add `error` to mock default, add error display cases). Both fail before implementation; both pass after.                             |
| **IV. Type Safety & Code Quality**  | ✅ PASS | `UseFinchConnectReturn` interface explicitly typed. `error: string \| null` — no `any`. `clearError: () => void` — stable type. `console.log` removed (eliminates `no-console` lint warning). All TypeScript strict mode checks maintained.       |
| **V. Performance & Accessibility**  | ✅ PASS | `<ErrorMessage />` follows existing WCAG-compliant pattern (seen in `SignInForm.tsx`, `DashboardPage.tsx`). Bundle size decreases (sonner removed). `AlertCircle` icon already imported on DashboardPage.                                         |
| **VI. State Management Discipline** | ✅ PASS | Ephemeral error state lives in hook-local `useState` — correct scope for UI feedback that doesn't need to survive navigation. No Redux involvement. Cleared on retry (FR-002). No direct state mutation.                                          |
| **Technology Standards**            | ✅ PASS | No new packages. Uses existing React hooks, existing `<ErrorMessage />`, existing `AlertCircle` import. Removes a non-standard dependency (sonner).                                                                                               |

**Post-Phase 1 Re-check**: All gates remain PASS. Design confirmed in `data-model.md`: `clearError` exposed to support `onClose` prop; error placed co-located in each Finch section (Research §2); `console.log` removal included in same edit (Research §6).

## Project Structure

### Documentation (this feature)

```text
specs/007-replace-sonner-toast/
├── plan.md              # This file (/speckit.plan command output)
├── spec.md              # Feature specification
├── research.md          # Phase 0: 6 decisions — error surface, placement, file deletion, package removal, test refactor, console.log
├── data-model.md        # Phase 1: UseFinchConnectReturn interface diff, state transitions, placement details
├── quickstart.md        # Phase 1: TDD step-by-step implementation guide (8 steps)
├── contracts/
│   └── README.md        # No API contract changes — pure frontend refactor
├── checklists/
│   └── requirements.md  # Spec quality checklist (already completed)
└── tasks.md             # Phase 2 output (/speckit.tasks — NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── hooks/
│   └── useFinchConnect.ts           # MODIFIED: remove sonner import + toast.error calls + console.log;
│                                    #   add error state, clearError callback; expose both in return
├── pages/
│   └── dashboard/
│       └── DashboardPage.tsx        # MODIFIED: destructure error + clearError; render <ErrorMessage />
│                                    #   inside "Connect with Finch" column and "Connect to Finch" card section
├── App.tsx                          # MODIFIED: remove Toaster import + <Toaster /> JSX mount
└── components/
    └── ui/
        └── sonner.tsx               # DELETED: no consumers after App.tsx cleanup

tests/
├── hooks/
│   └── useFinchConnect.test.tsx     # MODIFIED: remove vi.mock("sonner") + mockToastError assertions;
│                                    #   replace with result.current.error checks; add clearError + auto-clear tests
└── pages/
    └── DashboardPage.test.tsx       # MODIFIED: add error + clearError to mock default; add Finch error display tests
```

**Structure Decision**: Single web application (frontend-only). All changes follow existing `src/` conventions. No new directories created.

## Complexity Tracking

> No constitution violations. No entries required.
