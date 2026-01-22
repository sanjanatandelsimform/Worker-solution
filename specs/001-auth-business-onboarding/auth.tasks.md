# Tasks: Authentication Module - Business Onboarding & Sign-In

**Branch**: `001-auth-business-onboarding`  
**Input**: [auth.spec.md](auth.spec.md), [auth.plan.md](auth.plan.md)  
**Scope**: Frontend implementation only (Backend APIs available)

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure for authentication module

- [X] T001 Install dependencies: `react-hook-form`, `@hookform/resolvers`, `zod`, `axios` (if not already installed)
- [X] T002 [P] Create directory structure: `src/components/auth/`, `src/pages/auth/`, `src/services/`, `src/hooks/`, `src/types/`
- [X] T003 [P] Configure environment variables in `.env`: `VITE_API_BASE_URL`, `VITE_GOOGLE_CLIENT_ID`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 Create TypeScript types in `src/types/auth.ts` (UserAccount, Industry, AuthMethod, AuthSession interfaces)
- [X] T005 Create Zod validation schemas in `src/services/validation/authSchemas.ts` (registration, signIn, businessInfo schemas)
- [X] T006 Configure Axios client in `src/services/api/authApi.ts` (baseURL, timeout: 10s, withCredentials: true)
- [X] T007 Add Axios response interceptor in `src/services/api/authApi.ts` for 401 handling (redirect to sign-in)
- [X] T008 Create authentication API functions in `src/services/api/authApi.ts` (signup, signin, signout, getCurrentUser, checkEmailAvailability)
- [X] T009 Create `useAuth` hook in `src/hooks/useAuth.ts` for authentication state management
- [X] T010 Add authentication routes to router in `src/App.tsx` or routing config (`/register`, `/sign-in`, `/onboarding/business-info`)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Business Account Registration (Priority: P1) 🎯 MVP

**Goal**: Users can register with business details and create an account with email/password authentication

**Independent Test**: Navigate to `/register`, fill all 10 fields with valid data, submit form, see success modal, and be redirected to email verification page

### Tests for User Story 1 (TDD - Write FIRST)

- [ ] T011 [P] [US1] Component test for RegistrationForm in `tests/components/auth/RegistrationForm.test.tsx` (validation errors, password mismatch, terms checkbox, successful submission)
- [ ] T012 [P] [US1] Integration test for registration flow in `tests/integration/registration-flow.test.tsx` (complete registration journey with API mocks)
- [ ] T013 [P] [US1] Unit test for validation schemas in `tests/unit/validation/authSchemas.test.ts` (password requirements, email format, phone number, zip code)

### Implementation for User Story 1

- [X] T014 [P] [US1] Create utility functions in `src/utils/phoneFormatter.ts` (format phone number to 10 digits) and `src/utils/passwordValidator.ts` (calculate password strength)
- [X] T016 [US1] Create RegistrationForm component in `src/components/auth/RegistrationForm.tsx` (10 fields: firstName, lastName, businessName, email, phoneNumber, industry dropdown, zipCode, password with strength indicator, confirmPassword, acceptTerms checkbox)
- [X] T017 [US1] Integrate React Hook Form with Zod resolver in RegistrationForm (mode: 'onBlur', real-time validation)
- [X] T018 [US1] Add ARIA attributes to RegistrationForm fields (aria-invalid, aria-describedby for error messages, role="alert" for errors)
- [X] T019 [US1] Implement form submission logic in RegistrationForm (call authApi.signup, handle success/error, clear password from state after success)
- [X] T020 [US1] Create RegisterPage in `src/pages/auth/RegisterPage.tsx` (wrap RegistrationForm, include "Sign In" link, handle success modal, redirect to email verification)
- [X] T021 [US1] Create EmailVerificationPage stub in `src/pages/auth/EmailVerificationPage.tsx` (placeholder for future implementation)

**Checkpoint**: At this point, User Story 1 should be fully functional - users can register accounts

---

## Phase 4: User Story 2 - Business Account Sign-In (Priority: P1) 🎯 MVP

**Goal**: Existing users can sign in with email/password and optionally be remembered for 30 days

**Independent Test**: Navigate to `/sign-in`, enter valid credentials, check "Remember for 30 days", submit, verify redirect to dashboard with active session

### Tests for User Story 2 (TDD - Write FIRST)

- [ ] T022 [P] [US2] Component test for SignInForm in `tests/components/auth/SignInForm.test.tsx` (email validation, invalid credentials error, remember me option, successful sign-in)
- [ ] T023 [P] [US2] Integration test for sign-in flow in `tests/integration/signin-flow.test.tsx` (complete sign-in journey with API mocks, session persistence)

### Implementation for User Story 2

- [X] T024 [US2] Create SignInForm component in `src/components/auth/SignInForm.tsx` (email, password, rememberMe checkbox, "Forgot password?" link, "Sign up" link)
- [X] T025 [US2] Integrate React Hook Form with Zod resolver in SignInForm (signInSchema, mode: 'onBlur')
- [X] T026 [US2] Add ARIA attributes to SignInForm fields (aria-invalid, aria-describedby, keyboard navigation support)
- [X] T027 [US2] Implement form submission logic in SignInForm (call authApi.signin with rememberMe, handle success/error, show loading state)
- [X] T028 [US2] Create SignInPage in `src/pages/auth/SignInPage.tsx` (wrap SignInForm, handle redirect to dashboard on success)
- [X] T029 [US2] Create PasswordResetPage stub in `src/pages/auth/PasswordResetPage.tsx` (placeholder for future implementation)
- [X] T030 [US2] Update useAuth hook to fetch current user on app mount (call authApi.getCurrentUser, set authentication state)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - users can register and sign in

---

## Phase 5: User Story 4 - Google SSO Authentication (Priority: P1) 🎯 MVP

**Goal**: Users can authenticate using Google OAuth, with automatic registration for new users and profile completion flow

**Independent Test**: Click "Sign in with Google", authorize on Google, verify redirect to business info form (new users) or dashboard (existing users)

### Tests for User Story 4 (TDD - Write FIRST)

- [ ] T031 [P] [US4] Component test for GoogleSSOButton in `tests/components/auth/GoogleSSOButton.test.tsx` (initiates OAuth flow, generates state parameter)
- [ ] T032 [P] [US4] Component test for BusinessInfoForm in `tests/components/auth/BusinessInfoForm.test.tsx` (4 fields validation, successful submission)
- [ ] T033 [P] [US4] Integration test for Google SSO flow in `tests/integration/google-sso-flow.test.tsx` (OAuth initiation, callback handling, profile completion)

### Implementation for User Story 4

- [X] T034 [P] [US4] Create `useGoogleSSO` hook in `src/hooks/useGoogleSSO.ts` (initiateGoogleSignIn function, generate random state, redirect to Google OAuth URL)
- [X] T035 [P] [US4] Add Google SSO API function in `src/services/api/authApi.ts` (submitBusinessInfo endpoint)
- [X] T036 [US4] Create GoogleSSOButton component in `src/components/auth/GoogleSSOButton.tsx` (styled button, calls useGoogleSSO hook on click)
- [X] T037 [US4] Add GoogleSSOButton to RegisterPage and SignInPage (below main form, "or" divider)
- [X] T038 [US4] Create BusinessInfoForm component in `src/components/auth/BusinessInfoForm.tsx` (businessName, phoneNumber, industry dropdown, zipCode fields)
- [X] T039 [US4] Integrate React Hook Form with Zod resolver in BusinessInfoForm (businessInfoSchema, mode: 'onBlur')
- [X] T040 [US4] Add ARIA attributes to BusinessInfoForm fields (aria-invalid, aria-describedby, keyboard navigation)
- [X] T041 [US4] Implement form submission logic in BusinessInfoForm (call authApi.submitBusinessInfo, handle success, redirect to dashboard)
- [X] T042 [US4] Create BusinessInfoPage in `src/pages/auth/BusinessInfoPage.tsx` (wrap BusinessInfoForm, show for incomplete Google SSO profiles)
- [X] T043 [US4] Add route for business info page in router: `/onboarding/business-info`

**Checkpoint**: At this point, User Stories 1, 2, AND 4 work - complete authentication flows implemented

---

## Phase 6: User Story 3 - Form Accessibility & Validation Feedback (Priority: P2)

**Goal**: Ensure all authentication forms meet WCAG 2.1 Level AA standards with excellent keyboard navigation and screen reader support

**Independent Test**: Navigate forms using keyboard only (Tab, Enter), verify focus indicators, test with screen reader (NVDA/VoiceOver), confirm error announcements

### Tests for User Story 3 (TDD - Write FIRST)

- [ ] T044 [P] [US3] Accessibility test for RegistrationForm in `tests/components/auth/RegistrationForm.test.tsx` (keyboard navigation, ARIA attributes, focus management)
- [ ] T045 [P] [US3] Accessibility test for SignInForm in `tests/components/auth/SignInForm.test.tsx` (keyboard navigation, ARIA attributes, error announcements)
- [ ] T046 [P] [US3] Accessibility test for BusinessInfoForm in `tests/components/auth/BusinessInfoForm.test.tsx` (keyboard navigation, ARIA attributes)

### Implementation for User Story 3

- [ ] T047 [US3] Audit RegistrationForm for accessibility (verify logical tab order, visible focus indicators, proper label associations)
- [ ] T048 [US3] Audit SignInForm for accessibility (verify keyboard navigation, focus trap in modal states, error focus management)
- [ ] T049 [US3] Audit BusinessInfoForm for accessibility (verify ARIA attributes, screen reader announcements)
- [ ] T050 [US3] Add focus management on form submission errors (auto-focus first invalid field in all forms)
- [ ] T051 [US3] Ensure color contrast ratios meet WCAG AA standards (4.5:1 for text, 3:1 for UI components)
- [ ] T052 [US3] Test with screen readers (NVDA on Windows or VoiceOver on macOS) and document any issues
- [ ] T053 [US3] Run automated accessibility audit using axe-core or Lighthouse and fix violations

**Checkpoint**: All authentication forms meet WCAG 2.1 Level AA accessibility standards

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final quality assurance

- [ ] T054 [P] Add responsive design testing for all pages (mobile 320px, tablet 768px, desktop 1920px)
- [X] T055 [P] Implement error boundary for auth pages to catch and handle React errors gracefully
- [ ] T056 Performance optimization: lazy load auth pages using React.lazy() for code splitting
- [ ] T057 Add loading skeletons for auth forms during API calls
- [ ] T058 Implement session timeout detection and display "Your session has expired" message
- [ ] T059 Add email uniqueness check (debounced call to authApi.checkEmailAvailability) in RegistrationForm
- [X] T060 Security audit: verify passwords are cleared from form state after submission
- [X] T061 Security audit: verify no sensitive data logged to console
- [ ] T062 [P] Add unit tests for utility functions in `tests/unit/utils/` (phoneFormatter.test.ts, passwordValidator.test.ts)
- [ ] T063 Run full test suite and ensure all tests pass (Jest + React Testing Library)
- [ ] T064 Manual QA: Test complete registration → sign-out → sign-in flow
- [ ] T065 Manual QA: Test Google SSO flow end-to-end with real Google account
- [X] T066 Update README.md with authentication module documentation and setup instructions

---

## Update: Removed Files

The following files have been removed from the project:
- `BusinessInfoForm.tsx`
- `PasswordStrengthIndicator.tsx`

These components are no longer part of the authentication module. Any references to these files in the documentation have been updated accordingly.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - **BLOCKS all user stories**
- **User Stories (Phase 3, 4, 5, 6)**: All depend on Foundational phase completion
  - US1 (Registration) and US2 (Sign-In) are independent after Phase 2
  - US4 (Google SSO) can start in parallel but integrates with US1 & US2 pages
  - US3 (Accessibility) enhances US1, US2, US4 - should come after their basic implementation
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **US1 (Registration - P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **US2 (Sign-In - P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories  
- **US4 (Google SSO - P1)**: Can start after Foundational (Phase 2) - Integrates with RegisterPage and SignInPage from US1/US2
- **US3 (Accessibility - P2)**: Should start after US1, US2, US4 basic implementation - Enhances all forms

### Within Each User Story

- **Tests MUST be written FIRST** and should FAIL before implementation (TDD)
- Utility functions and helpers before components
- Form components before page components
- Basic functionality before accessibility enhancements
- Story complete before moving to next priority

### Parallel Opportunities

- **Phase 1 (Setup)**: All 3 tasks can run in parallel
- **Phase 2 (Foundational)**: T004 and T005 can run in parallel, T006-T010 are sequential
- **Once Foundational complete**:
  - US1 and US2 can be developed in parallel (different files)
  - US4 can start in parallel but needs US1/US2 pages for integration
  - US3 accessibility work can start after basic US1/US2/US4 components exist
- **Within each user story**:
  - All tests marked [P] can be written in parallel
  - Component tests can be written/run in parallel

---

## Implementation Strategy

### MVP First (P1 Stories Only)

1. **Complete Phase 1**: Setup (T001-T003)
2. **Complete Phase 2**: Foundational (T004-T010) - **CRITICAL**
3. **Complete Phase 3**: US1 Registration (T011-T021)
4. **VALIDATE**: Test registration flow independently
5. **Complete Phase 4**: US2 Sign-In (T022-T030)  
6. **VALIDATE**: Test sign-in flow independently
7. **Complete Phase 5**: US4 Google SSO (T031-T043)
8. **VALIDATE**: Test Google SSO flow independently
9. **Deploy MVP**: All P1 stories functional

### Incremental Delivery

- After Phase 2 → Foundation ready for parallel development
- After Phase 3 → Registration works (partial MVP)
- After Phase 4 → Registration + Sign-In works (functional MVP)
- After Phase 5 → Full authentication suite with Google SSO (complete MVP)
- After Phase 6 → Accessibility-compliant (enhanced MVP)
- After Phase 7 → Production-ready with polish

### Parallel Team Strategy

With 2-3 developers:

1. **Together**: Complete Setup (Phase 1) + Foundational (Phase 2)
2. **Once Foundational done**:
   - Developer A: US1 Registration (Phase 3)
   - Developer B: US2 Sign-In (Phase 4)
   - Developer C: US4 Google SSO (Phase 5 - needs A & B pages)
3. **After P1 stories**:
   - Any developer: US3 Accessibility (Phase 6)
4. **Final**: Polish (Phase 7) - shared across team

---

## Notes

- Backend APIs already implemented - frontend consumes REST endpoints
- All API contracts documented in backend team's specification
- HttpOnly cookies used for session management (no localStorage)
- 10-second timeout on all API calls
- Follow TDD: Write tests first, see them fail, implement, see them pass
- Each user story should be independently testable and deployable
- Commit frequently after logical task completion
- [P] tasks can run in parallel (different files, no conflicts)
- Stop at any checkpoint to validate story independence
