# Tasks: MVP Signup Flow Enhancements

**Input**: Design documents from `/specs/006-signup-flow-enhancements/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/
**Tests**: Not explicitly requested in spec. Constitution requires TDD; task ordering enforces test-first where applicable.
**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: No new project setup needed — this feature modifies an existing codebase. This phase covers prerequisite type/contract updates that multiple user stories depend on.

- [X] T001 Add `SignupResponse` interface to `src/types/auth.ts` with `user: UserAccount` and `tokens: { accessToken: string; refreshToken: string }` fields

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: API layer changes that MUST be complete before user story implementation can begin.

**⚠️ CRITICAL**: US1 depends on the updated `signup()` return type.

- [X] T002 Update `signup()` function in `src/services/api/authApi.ts` — change Axios generic type to match new API envelope `{ status, message, data: { user, tokens } }`, update return type from `Promise<UserAccount>` to `Promise<SignupResponse>`, and extract `response.data.data.user` + `response.data.data.tokens` (follow same pattern as existing `signin()` function at L303–330)

**Checkpoint**: Foundation ready — `signup()` now returns user + tokens. User story implementation can begin.

---

## Phase 3: User Story 1 — Auto-Login After Registration (Priority: P1) 🎯 MVP

**Goal**: After successful registration, user is authenticated and redirected to `/dashboard` instead of `/sign-in`.

**Independent Test**: Register a new account end-to-end. Verify the user lands on the dashboard (authenticated) without visiting the sign-in page. Dashboard shows "Verify your email" card.

### Implementation for User Story 1

- [X] T003 [US1] Update `onSubmit` handler in `src/components/auth/RegistrationForm.tsx` — capture the response from `signup()` call: `const { user, tokens } = await signup(registrationData)` (currently the response is discarded)
- [X] T004 [US1] Update navigation state in `src/components/auth/RegistrationForm.tsx` — add `user` and `tokens` to the `navigate("/success", { state: {...} })` call (alongside existing `messageImg`, `title`, `subtitle`, `buttonText`)
- [X] T005 [US1] Change `buttonPath` from `"/sign-in"` to `"/dashboard"` in the navigate state object in `src/components/auth/RegistrationForm.tsx`

**Checkpoint**: At this point, User Story 1 should be fully functional. Register → Success Page → Click "Let's Get Started" → Dashboard (authenticated, showing "Verify your email" card). No changes to `SuccessPage.tsx` needed — it already dispatches `setUser()` when `user` + `tokens` are in navigation state.

---

## Phase 4: User Story 2 — Email Verified Modal on Dashboard (Priority: P1)

**Goal**: After successful email verification, user lands on `/dashboard` with a "Your email has been verified!" modal instead of the generic `/success` page.

**Independent Test**: Click verification link → land on `/dashboard` with modal displayed. Close modal → no re-trigger on refresh.

### Implementation for User Story 2

- [X] T006 [P] [US2] Add `"emailVerified"` modal type to `useModalConfig` hook in `src/hooks/useModalConfig.tsx` — add to `ModalType` union, configure with: title "Your email has been verified!", subtitle "Welcome aboard! Start your success journey with BeneStats.", `messageImg` using existing checkmark icon (`@/assets/finch-checkmark.svg`), single button `{ text: "Return to dashboard", onClick: onClose, color: "primary" }`, `backgroundPattern: "success"`
- [X] T007 [P] [US2] Update `VerifyEmailPage` in `src/pages/auth/VerifyEmailPage.tsx` — replace `navigate("/success", { state: {...} })` with `navigate("/dashboard", { state: { emailVerified: true }, replace: true })`. Keep all existing token/user dispatch logic (both same-browser and cross-browser paths) completely unchanged. Keep existing error handling unchanged.
- [X] T008 [US2] Add email verification modal handling to `src/pages/dashboard/DashboardPage.tsx` — (a) import `useLocation` and read `location.state?.emailVerified`, (b) add `isEmailVerifiedModalOpen` state initialized from location state, (c) use `useModalConfig("emailVerified", ...)` to get modal config, (d) add `useEffect` to clear navigation state via `window.history.replaceState({}, document.title)` after detecting the flag, (e) render `<BaseModalWithIcon>` with the email verified config at bottom of JSX alongside existing modals
- [X] T009 [US2] Add `handleCloseEmailVerifiedModal` handler in `src/pages/dashboard/DashboardPage.tsx` — sets `isEmailVerifiedModalOpen` to `false` (modal close simply hides it; navigation state already cleared by the useEffect in T008)

**Checkpoint**: At this point, User Story 2 should be fully functional. Verify email → redirect to dashboard → modal with green checkmark + "Return to dashboard" button → close → no re-trigger on refresh. Cross-browser verification also works (tokens already stored before navigation).

---

## Phase 5: User Story 3 — Returning Unverified User Login and Verification (Priority: P2)

**Goal**: Users who register, skip verification, log out, and log back in experience the same verification modal when they eventually verify.

**Independent Test**: Register → skip verification → log out → log in → dashboard shows "Verify email" card → click verify link → dashboard shows verification modal.

### Implementation for User Story 3

No additional code changes required. This story is fully covered by the changes in Phase 3 (US1) and Phase 4 (US2):

- The sign-in flow is unchanged (FR-011) — returning users authenticate normally
- The dashboard "Verify your email" card is unchanged (FR-009) — shown when `emailVerify === false`
- The VerifyEmailPage redirect (T007) applies regardless of when/how the user reaches it
- The dashboard modal (T008/T009) triggers on any navigation with `emailVerified: true` state

- [X] T010 [US3] Manually verify the returning-unverified-user flow end-to-end: register → skip verification → log out → log in → confirm dashboard shows "Verify your email" card → click verification link → confirm redirect to `/dashboard` with "Your email has been verified!" modal → close modal → refresh → confirm modal does not reappear

**Checkpoint**: All user stories should now be independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and cleanup across all stories

- [X] T011 Run `pnpm run type-check` and fix any TypeScript errors introduced by the changes
- [X] T012 Run `pnpm lint:fix` and `pnpm format` to ensure code style compliance
- [X] T013 Verify no regressions: sign-in flow still works (navigate to `/sign-in`, log in, arrive at success page → dashboard)
- [X] T014 Verify no regressions: existing "Email Sent" modal on dashboard still works (click "Verify" on dashboard card → modal shows → 60s cooldown works)
- [X] T015 Verify no regressions: VerifyEmailPage error states still work (visit `/verify-email` without token → error UI shown; visit with expired token → "Verification Failed" shown)
- [X] T016 Run quickstart.md validation — execute all 3 manual test flows from `specs/006-signup-flow-enhancements/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 (T001 → T002) — BLOCKS US1
- **User Story 1 (Phase 3)**: Depends on Phase 2 completion (T002 → T003)
- **User Story 2 (Phase 4)**: Depends on Phase 1 only (needs no foundational changes) — can start in parallel with US1
- **User Story 3 (Phase 5)**: Depends on Phase 3 + Phase 4 completion (verification flow)
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Depends on `signup()` type update (T002). Independent of US2.
- **User Story 2 (P1)**: Independent of US1. Can start after Phase 1 (T001 type definition). T006 and T007 can run in parallel (different files); T008 depends on T006.
- **User Story 3 (P2)**: No code changes — depends on US1 + US2 being complete for end-to-end verification.

### Within Each User Story

- US1: T003 → T004 → T005 (sequential — all in same file `RegistrationForm.tsx`)
- US2: T006 ‖ T007 (parallel — different files), then T008 → T009 (sequential — same file `DashboardPage.tsx`)
- US3: T010 (single verification task)

### Parallel Opportunities

- T006 and T007 can run in parallel (different files: `useModalConfig.tsx` vs `VerifyEmailPage.tsx`)
- US1 (Phase 3) and US2's T006+T007 can run in parallel (different files entirely)
- T011 and T012 can run in parallel (different tools: tsc vs eslint/prettier)

---

## Parallel Example: User Story 2

```text
# Launch T006 and T007 together (different files):
T006: Add "emailVerified" modal type in src/hooks/useModalConfig.tsx
T007: Update VerifyEmailPage redirect in src/pages/auth/VerifyEmailPage.tsx

# Then sequentially (same file):
T008: Add modal handling to src/pages/dashboard/DashboardPage.tsx
T009: Add close handler to src/pages/dashboard/DashboardPage.tsx
```

---

## Parallel Example: Cross-Story

```text
# After Phase 2 (T002) completes, launch US1 and US2 in parallel:

# Developer/Agent A — US1:
T003: Capture signup response in RegistrationForm.tsx
T004: Pass user+tokens to success page navigation state
T005: Change buttonPath to "/dashboard"

# Developer/Agent B — US2:
T006: Add emailVerified modal type to useModalConfig.tsx
T007: Update VerifyEmailPage redirect to /dashboard
T008: Add modal detection to DashboardPage.tsx
T009: Add close handler to DashboardPage.tsx
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Type definition (T001)
2. Complete Phase 2: Update signup() API function (T002)
3. Complete Phase 3: Registration form changes (T003–T005)
4. **STOP and VALIDATE**: Register → success page → click "Let's Get Started" → lands on `/dashboard` authenticated
5. Deploy/demo if ready — users can now auto-login after signup

### Incremental Delivery

1. T001–T002 → Foundation ready
2. T003–T005 → US1 complete → Auto-login works → Deploy/Demo (MVP!)
3. T006–T009 → US2 complete → Verification modal works → Deploy/Demo
4. T010 → US3 verified → Returning user flow confirmed → Deploy/Demo
5. T011–T016 → Polish complete → All regressions verified

### Full Sequential (Single Developer)

T001 → T002 → T003 → T004 → T005 → T006 → T007 → T008 → T009 → T010 → T011 → T012 → T013 → T014 → T015 → T016

---

## Notes

- **No new files created**: All tasks modify existing files
- **SuccessPage.tsx is NOT modified**: It already handles `user` + `tokens` in navigation state
- **authSlice.ts is NOT modified**: Existing reducers (`setUser`, `setTokens`, `updateUser`) handle all state changes
- **T003–T005 are in the same file** (`RegistrationForm.tsx`) — they are listed as separate tasks for clarity but should be implemented as a single atomic change
- **T008–T009 are in the same file** (`DashboardPage.tsx`) — same: separate for clarity, implement atomically
- Commit after each phase or logical group
- Stop at any checkpoint to validate story independently
