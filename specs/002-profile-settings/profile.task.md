# Tasks: Profile Settings Module

**Input**: Design documents from `/specs/002-profile-settings/`  
**Prerequisites**: profile.plan.md (complete), profile.spec.md (complete)

**Tests**: Tests are included as this is a comprehensive feature with security requirements

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Single project structure with `src/` and `tests/` at repository root
- Frontend-only feature (APIs already exist)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and foundational type definitions

- [X] T001 Create TypeScript types in src/types/profile.types.ts (User, ProfileUpdatePayload, EmailUpdatePayload, PasswordChangePayload interfaces)
- [X] T002 [P] Create profile selectors in src/store/selectors/profileSelectors.ts (selectProfileData, selectProfileLoading, selectProfileError)
- [X] T003 [P] Add validation functions in src/utils/validation.ts (validateEmail, validatePassword, validateName)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core state management and API infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 Create Redux slice in src/store/slices/profile.slice.ts (actions: fetchProfile, updateProfile, updateEmail, updatePassword, deleteAccount, reducers with loading/error/success states)
- [X] T005 Create API service in src/services/api/profileService.ts (getProfile, updateProfile, updateEmail, updatePassword, deleteAccount with auth headers and error handling)
- [X] T006 Add profile reducer to store configuration in src/store/store.ts
- [X] T007 Implement auto-retry logic in src/services/api/profileService.ts (retry once on network failure, preserve form data)
- [ ] T008 [P] Create unit tests for profile slice in tests/unit/store/profile.slice.test.ts
- [ ] T009 [P] Create unit tests for profile service in tests/unit/services/profileService.test.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - View and Update Basic Profile Information (Priority: P1) 🎯 MVP

**Goal**: Enable users to view their profile and update first name and last name

**Independent Test**: Navigate to Settings, edit first/last name, click Save, verify success modal appears with "Update Complete" message

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T010 [P] [US1] Integration test for profile view/update flow in tests/integration/profile-update-flow.test.tsx (test fetch profile, display data, edit names, save, show success modal)
- [ ] T011 [P] [US1] Component test for Settings page profile display in tests/components/profile/ProfileView.test.tsx (test rendering first name, last name, disabled email, masked password placeholder)
- [ ] T012 [P] [US1] Component test for profile update form in tests/components/profile/ProfileUpdateForm.test.tsx (test validation, save button, error handling)

### Implementation for User Story 1

- [x] T013 [US1] Modify Settings page in src/pages/settings/settingPage.tsx to fetch and display user profile on mount (first name, last name, email disabled, password as "••••••••" masked placeholder)
- [x] T014 [US1] Add profile update form with validation in src/pages/settings/settingPage.tsx (first name and last name editable, trim whitespace, validate not empty, max 50 chars)
- [x] T015 [US1] Integrate "Save" button in src/pages/settings/settingPage.tsx (calls updateProfile action, disabled until fields change)
- [x] T016 [US1] Open success modal display in src/pages/settings/settingPage.tsx using BaseModalWithIcon (title: "Update Complete", subtitle: "All set! Your changes have been saved.", checkmark icon, "Back to Settings" button)
- [x] T017 [US1] open error handling in src/pages/settings/settingPage.tsx using ErrorMessage component (show on API failure, include "Retry" button with preserved form data)
- [x] T018 [US1] Add "Back to Settings" redirect in on modal(closes modal, refreshes profile data)

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently - Users can view and update their profile names

---

## Phase 4: User Story 2 - Update Email Address (Priority: P2)

**Goal**: Enable users to update their email address with verification flow

**Independent Test**: Click "Update Email" link, enter new email, submit, verify link changes to "Resend Verification Email" and success message appears

### Tests for User Story 2

- [ ] T019 [P] [US2] Integration test for email update flow in tests/integration/email-update-flow.test.tsx (test open modal, enter new email, submit, show success, link state change)
- [ ] T020 [P] [US2] Component test for UpdateYourEmailModal integration in tests/components/profile/EmailUpdate.test.tsx (test email validation, duplicate email error, success handling)

### Implementation for User Story 2

- [x] T021 [P] [US2] Add "Update Email" link to Settings page in src/pages/settings/settingPage.tsx (next to email field, opens UpdateYourEmailModal)
- [x] T022 [US2] Integrate UpdateYourEmailModal in src/pages/settings/settingPage.tsx (pre-fill current email disabled, new email field with validation)
- [x] T023 [US2] Add email validation in UpdateYourEmailModal (regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, max 255 chars, not empty, different from current)
- [x] T024 [US2] Connect UpdateYourEmailModal to updateEmail action in src/pages/settings/index.tsx
- [x] T025 [US2] Handle duplicate email error (409 Conflict) in src/pages/settings/settingPage.tsx (show "This email is already in use" error message using errorcomponent)
- [x] T026 [US2] Implement success handling in src/pages/settings/index.tsx (show success modal, change link to "Resend Verification Email")
- [x] T027 [US2] Add email verification state to Redux slice in src/store/slices/profile.slice.ts (track if verification sent)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Change Password (Priority: P2)

**Goal**: Enable users to change their password with security rate limiting

**Independent Test**: Click "Change Password" link, enter current and new passwords, submit, verify success modal appears

### Tests for User Story 3

- [ ] T028 [P] [US3] Integration test for password change flow in tests/integration/password-change-flow.test.tsx (test open modal, enter passwords, validation, success, rate limiting)
- [ ] T029 [P] [US3] Component test for ChangePasswordModal integration in tests/components/profile/PasswordChange.test.tsx (test validation rules, attempt tracking, lockout behavior)

### Implementation for User Story 3

- [x] T031 [US3] Integrate ChangePasswordModal in src/pages/settings/settingPage.tsx (fields for current password and new password)
- [x] T032 [US3] Add password validation in ChangePasswordModal (min 8 chars, uppercase, lowercase, number, special char, not same as current)
- [x] T033 [US3] Connect ChangePasswordModal to updatePassword action in src/pages/settings/settingPage.tsx
- [x] T034 [US3] Implement attempt tracking in src/store/slices/profile.slice.ts (max 5 attempts, track remaining attempts)
- [x] T035 [US3] Handle incorrect password error (401 Unauthorized) in src/pages/settings/settingPage.tsx (show error with remaining attempts count)
- [x] T036 [US3] Handle account lockout (429 Too Many Requests) in src/pages/settings/settingPage.tsx (show "Account locked for 15 minutes" message with lockout duration)
- [x] T037 [US3] Open success modal in src/pages/settings/index.tsx (show success modal with "Back to Settings" button)

**Checkpoint**: All critical user stories (P1, P2) should now be independently functional

---

## Phase 6: User Story 4 - Retake Assessment (Priority: P3)

**Goal**: Enable users to retake their workforce assessment with confirmation

**Independent Test**: Click "Retake the Assessment" button, confirm warning modal appears, click "Yes, Retake Assessment", verify redirect to dashboard

### Tests for User Story 4

- [ ] T038 [P] [US4] Integration test for retake assessment flow in tests/integration/retake-assessment-flow.test.tsx (test button click, modal display, confirm redirect, cancel behavior)

### Implementation for User Story 4

- [x] T039 [P] [US4] b"Retake the Assessment" button already there when user click on it open modal
- [x] T040 [US4] open retake confirmation modal in src/pages/settings/settingPage.tsx using BaseModalWithIcon (title: "Retake Assessment?", subtitle: "Your current results will be replaced", warning styling, "Yes, Retake Assessment" and "Cancel" buttons)
- [x] T041 [US4] Implement dashboard redirect in src/pages/settings/index.tsx (on "Yes" click, navigate to /dashboard)
- [x] T042 [US4] Implement cancel behavior in src/pages/settings/index.tsx (close modal, remain on settings page)

**Checkpoint**: User Story 4 functional and testable independently

---

## Phase 7: User Story 5 - Delete Account (Priority: P3)

**Goal**: Enable users to permanently delete their account with data cleanup

**Independent Test**: Click "Delete my Account" button, confirm warning modal, click "Yes, Delete my account", verify redirect to account-deleted-success page with proper cleanup

### Tests for User Story 5

- [ ] T043 [P] [US5] Integration test for delete account flow in tests/integration/delete-account-flow.test.tsx (test button click, modal display, confirm deletion, state cleanup, redirect, login prevention)

### Implementation for User Story 5

- [x] T044 [P] [US5] "Delete my Account" button to already in src/pages/settings/settingPage.tsx
- [x] T045 [US5] open delete confirmation modal in src/pages/settings/settingPage.tsx using BaseModalWithIcon (title: "Delete Account?", subtitle: "This will permanently delete your account and all data", warning styling, "Yes, Delete my account" and "Cancel" buttons)
- [x] T046 [US5] Connect delete button to deleteAccount action in src/pages/settings/settingPage.tsx
- [x] T047 [US5] Implement state cleanup in src/store/slices/profile.slice.ts (clear all user data from Redux store, clear authentication tokens)
- [x] T048 [US5] REdirect account-deleted-success page in src/pages/sucessPage/sucessPage.tsx (display "Your account has been successfully deleted" message, links to homepage/sign-up, no navigation to authenticated pages)
- [x] T049 [US5] Implement redirect to account-deleted-success page in src/pages/sucessPage/sucessPage.tsx  (after successful deletion)
- [x] T050 [US5] Implement cancel behavior in src/pages/settings/settingPage.tsx (close modal, remain on settings page)

**Checkpoint**: All user stories (1-5) should now be independently functional

---

## Phase 8: Edge Cases & Advanced Features (Cross-Cutting)

**Purpose**: Handle edge cases that affect multiple user stories

### Tests for Edge Cases

- [ ] T051 [P] Test network failure retry logic in tests/unit/services/profileService.test.ts (test auto-retry once, show error with "Retry" button, preserve form data)
- [ ] T052 [P] Test session expiry handling in tests/integration/session-expiry.test.tsx (test detection, warning display, redirect to login, modal context restoration)
- [ ] T053 [P] Test cross-tab synchronization in tests/integration/cross-tab-sync.test.tsx (test BroadcastChannel, notification display, refresh button)
- [ ] T054 [P] Test concurrent updates in tests/integration/concurrent-updates.test.tsx (test "Profile updated in another tab" notification)

### Implementation for Edge Cases

- [ ] T055 [P] Implement session expiry detection in src/pages/settings/settingPage.tsx (check before API calls, show warning, redirect to login)
- [ ] T056 [P] Implement modal context restoration in src/store/slices/profile.slice.ts (save which modal was open in sessionStorage, restore after re-auth, clear sensitive fields)
- [ ] T057 [P] Implement cross-tab communication in src/pages/settings/index.tsx (BroadcastChannel or localStorage events, detect profile updates in other tabs)
- [ ] T058 [P] Add "Profile updated in another tab" notification in src/pages/settings/index.tsx (with refresh button to reload data)
- [ ] T059 [P] Implement refresh functionality in src/pages/settings/index.tsx (reload profile data when refresh button clicked)

**Checkpoint**: All edge cases handled, feature is production-ready

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements and quality assurance

- [ ] T060 [P] Run full test suite and verify all tests pass (unit, integration, component tests)
- [ ] T061 [P] Verify all 43 functional requirements (FR-001 through FR-038) are implemented
- [ ] T062 [P] Manual QA testing for all 6 user stories (verify acceptance scenarios)
- [ ] T063 [P] Verify all 12 success criteria metrics (SC-001 through SC-012)
- [ ] T064 [P] Cross-browser testing (Chrome, Firefox, Safari)
- [ ] T065 [P] Mobile responsiveness testing (ensure all modals and forms work on mobile)
- [ ] T066 [P] Accessibility audit (WCAG 2.1 AA compliance, keyboard navigation, ARIA labels)
- [ ] T067 [P] Performance profiling (verify 2s page load, 3s API response, 500ms validation)
- [ ] T068 Code cleanup and refactoring (remove console.logs, unused code, improve readability)
- [ ] T069 [P] Documentation updates in README.md (add profile settings usage, API patterns)
- [ ] T070 [P] Add inline code comments for complex logic (session handling, cross-tab sync)
- [ ] T071 Generate test coverage report (target > 85%)
- [ ] T072 Create pull request with detailed description and screenshots
- [ ] T073 Address PR feedback and merge to main branch

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - User Story 1 (Phase 3): Can start after Foundational - No dependencies on other stories
  - User Story 2 (Phase 4): Can start after Foundational - No dependencies on other stories
  - User Story 3 (Phase 5): Can start after Foundational - No dependencies on other stories
  - User Story 4 (Phase 6): Can start after Foundational - No dependencies on other stories
  - User Story 5 (Phase 7): Can start after Foundational - No dependencies on other stories
- **Edge Cases (Phase 8)**: Depends on at least User Stories 1-3 being complete
- **Polish (Phase 9)**: Depends on all desired user stories being complete

### User Story Dependencies

All user stories can proceed in parallel after Foundational phase (Phase 2) completion, as they are independently implementable and testable:

- **User Story 1 (P1)**: Independent - View/update profile names
- **User Story 2 (P2)**: Independent - Update email address
- **User Story 3 (P2)**: Independent - Change password
- **User Story 4 (P3)**: Independent - Retake assessment
- **User Story 5 (P3)**: Independent - Delete account

Each story should be tested independently before moving to the next priority.

### Within Each User Story

1. Tests MUST be written and FAIL before implementation
2. Integration/component tests before implementation
3. Implementation tasks in order (modal → validation → API integration → error handling → success handling)
4. Story complete and tested before moving to next priority

### Parallel Opportunities

**Phase 1 (Setup)**: T002 and T003 can run in parallel

**Phase 2 (Foundational)**: T008 and T009 can run in parallel (test creation)

**Phase 3 (User Story 1)**: T010, T011, T012 can run in parallel (test creation)

**Phase 4 (User Story 2)**: T019 and T020 can run in parallel, T021 can run in parallel

**Phase 5 (User Story 3)**: T028 and T029 can run in parallel, T030 and T031 can run in parallel

**Phase 6 (User Story 4)**: T038 and T039 can run in parallel

**Phase 7 (User Story 5)**: T043 and T044 can run in parallel

**Phase 8 (Edge Cases)**: T051, T052, T053, T054 can run in parallel (tests), T055, T056, T057, T058 can run in parallel (implementation)

**Phase 9 (Polish)**: T060-T067 can run in parallel (testing/QA), T069, T070, T071 can run in parallel (documentation)

**Parallel User Stories**: Once Phase 2 completes, multiple developers can work on User Stories 1-5 simultaneously (different files, independent features)

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task T010: "Integration test for profile view/update flow in tests/integration/profile-update-flow.test.tsx"
Task T011: "Component test for Settings page profile display in tests/components/profile/ProfileView.test.tsx"
Task T012: "Component test for profile update form in tests/components/profile/ProfileUpdateForm.test.tsx"

# After tests written and failing, implementation proceeds sequentially:
Task T013 → T014 → T015 → T016 → T017 → T018
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T003)
2. Complete Phase 2: Foundational (T004-T009) - CRITICAL
3. Complete Phase 3: User Story 1 (T010-T018)
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready - Users can now view and update profile names

### Incremental Delivery (Recommended)

1. **Foundation**: Complete Phase 1 + Phase 2 → Foundation ready
2. **MVP**: Add User Story 1 (Phase 3) → Test independently → **Deploy/Demo (MVP!)**
3. **Email**: Add User Story 2 (Phase 4) → Test independently → Deploy/Demo
4. **Password**: Add User Story 3 (Phase 5) → Test independently → Deploy/Demo
5. **Assessment**: Add User Story 4 (Phase 6) → Test independently → Deploy/Demo
6. **Delete**: Add User Story 5 (Phase 7) → Test independently → Deploy/Demo
7. **Robustness**: Add Edge Cases (Phase 8) → Test thoroughly
8. **Polish**: Complete Phase 9 → Final QA → Merge

Each story adds value without breaking previous stories. Can stop and deploy after any story completion.

### Parallel Team Strategy

With multiple developers after Foundation (Phase 2) completes:

- **Developer A**: User Story 1 (Phase 3) - View/Update Profile
- **Developer B**: User Story 2 (Phase 4) - Email Update
- **Developer C**: User Story 3 (Phase 5) - Password Change
- **Developer D**: User Story 4 (Phase 6) - Retake Assessment
- **Developer E**: User Story 5 (Phase 7) - Delete Account

All stories integrate seamlessly as they use the same foundation (Redux slice, API service) but operate on different features.

---

## Total Task Count

- **Phase 1 (Setup)**: 3 tasks
- **Phase 2 (Foundational)**: 6 tasks
- **Phase 3 (User Story 1)**: 9 tasks
- **Phase 4 (User Story 2)**: 9 tasks
- **Phase 5 (User Story 3)**: 10 tasks
- **Phase 6 (User Story 4)**: 5 tasks
- **Phase 7 (User Story 5)**: 7 tasks
- **Phase 8 (Edge Cases)**: 9 tasks
- **Phase 9 (Polish)**: 14 tasks

**Total**: 73 tasks

**Estimated Time**: 24-32 hours (based on profile.plan.md)

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing (TDD approach)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- User Story 6 (Resend Email Verification) is BLOCKED - not included in tasks
- All tasks follow file naming convention: `profile.*` prefix
- Focus on component reuse: BaseModalWithIcon, ErrorMessage, existing modals
- NO new UI components to be created per design constraints
