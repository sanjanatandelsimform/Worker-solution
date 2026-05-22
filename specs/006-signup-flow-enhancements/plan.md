# Implementation Plan: MVP Signup Flow Enhancements

**Branch**: `006-signup-flow-enhancements` | **Date**: 2 April 2026 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/006-signup-flow-enhancements/spec.md`

## Summary

Enhance the MVP signup flow in three areas: (1) auto-login users after registration by capturing tokens from the updated `/users/create` response and redirecting to `/dashboard` instead of `/sign-in`, (2) replace the post-email-verification redirect to `/success` with a direct redirect to `/dashboard` where a "Your email has been verified!" modal is displayed, and (3) ensure returning unverified users who log in again experience the same verification modal flow. All changes extend existing patterns (Redux auth slice, `BaseModalWithIcon`, `useModalConfig`, navigation state) without modifying any currently-working UI or behaviour.

## Technical Context

**Language/Version**: TypeScript 5.x / React 19
**Primary Dependencies**: React Router v7, Redux Toolkit, Tailwind CSS v4, Vite, shadcn/ui primitives
**Storage**: localStorage (key: `"userDetail"`) — existing persistence via `persistAuth()` helper and `store.subscribe()`
**Testing**: Vitest + React Testing Library (test files co-located in `tests/`)
**Target Platform**: Web (modern browsers)
**Project Type**: Single frontend SPA (Vite + React)
**Performance Goals**: No additional bundle impact; new modal reuses existing `BaseModalWithIcon` component
**Constraints**: Must not break any existing flow; must follow existing auth state management patterns; Tailwind v4 semantic tokens only
**Scale/Scope**: 4 files modified, 0–1 new files created, ~100 net lines changed

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|---|---|---|
| **I. Component-First Architecture** | ✅ PASS | New modal reuses `BaseModalWithIcon`; new modal type added to `useModalConfig` hook. No new component needed — leveraging existing composition. |
| **II. User-Centric Design** | ✅ PASS | 3 user stories documented with priorities and acceptance criteria in spec. Design provided for modal UI. |
| **III. Test-Driven Development** | ⚠️ PARTIAL | TDD discipline requires tests written FIRST. Plan will include test tasks before implementation tasks. However, existing test coverage for the files being modified is minimal — regression tests must be added. |
| **IV. Type Safety & Code Quality** | ✅ PASS | `signup()` return type must be updated from `UserAccount` to include tokens. All new code will use strict TypeScript with explicit types. |
| **V. Performance & Accessibility** | ✅ PASS | No new assets; modal inherits `BaseModalWithIcon` accessibility. No bundle size increase. |
| **VI. State Management Discipline** | ✅ PASS | Uses existing Redux `setUser`, `setTokens`, `updateUser` reducers. Navigation state (transient) used for modal trigger — cleared after display. No new global state. |
| **Technology Standards** | ✅ PASS | React 19, TypeScript, Redux Toolkit, React Router, Tailwind CSS v4, Vitest — all align. |

**Gate Result**: PASS — No violations requiring justification.

**TDD Note (Principle III)**: The constitution mandates TDD. Task ordering in `tasks.md` will enforce test-first discipline: test files are created/updated before implementation files for each user story.

### Post-Design Re-evaluation (Phase 1 complete)

All gates remain PASS after design. No new violations introduced:
- **I**: Confirmed — `BaseModalWithIcon` + `useModalConfig` reused, no new component.
- **III**: Confirmed PARTIAL — pre-existing low test coverage; task ordering will enforce TDD for new code.
- **IV**: Confirmed — `SignupResponse` type defined in contracts; `signup()` signature updated.
- **VI**: Confirmed — transient navigation state for modal trigger; no new persistent state.

## Project Structure

### Documentation (this feature)

```text
specs/006-signup-flow-enhancements/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (API contract updates)
│   └── signup-response.md
├── checklists/
│   └── requirements.md  # Already created during spec phase
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (files to modify/create)

```text
src/
├── components/
│   └── auth/
│       └── RegistrationForm.tsx        # MODIFY: capture tokens, pass to success page
├── hooks/
│   └── useModalConfig.tsx              # MODIFY: add "emailVerified" modal type
├── pages/
│   ├── auth/
│   │   └── VerifyEmailPage.tsx         # MODIFY: redirect to /dashboard instead of /success
│   └── dashboard/
│       └── DashboardPage.tsx           # MODIFY: detect verification state, show modal
├── services/
│   └── api/
│       └── authApi.ts                  # MODIFY: update signup() return type to include tokens
└── types/
    └── auth.ts                         # MODIFY: add SignupResponse type (if needed)

tests/
├── components/
│   └── auth/
│       └── RegistrationForm.test.tsx   # ADD/MODIFY: test auto-login after signup
├── hooks/
│   └── useModalConfig.test.tsx         # ADD/MODIFY: test emailVerified modal config
├── pages/
│   ├── auth/
│   │   └── VerifyEmailPage.test.tsx    # ADD/MODIFY: test redirect to dashboard
│   └── dashboard/
│       └── DashboardPage.test.tsx      # ADD/MODIFY: test verification modal display
└── services/
    └── api/
        └── authApi.test.ts             # ADD/MODIFY: test updated signup response
```

**Structure Decision**: Single frontend SPA with existing directory layout. All changes are modifications to existing files. No new directories needed. Test files follow the existing parallel `tests/` structure.

## Complexity Tracking

> No constitution violations detected — this section is empty.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| _(none)_ | — | — |
