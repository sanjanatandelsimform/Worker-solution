# Implementation Plan: Profile Settings Module

**Branch**: `002-profile-settings` | **Date**: 2026-01-30 | **Spec**: [profile.spec.md](./profile.spec.md)  
**Input**: Feature specification from `/specs/002-profile-settings/profile.spec.md`

## Summary

The Profile Settings Module provides comprehensive user profile management capabilities including updating personal information (first name, last name), email address changes with verification, password management with security rate limiting, assessment retake functionality, and account deletion. This feature integrates with existing authentication patterns, leverages Redux Toolkit for state management, and follows the established design system using existing modal and error handling components.

**Primary Requirements**:
- View and update basic profile information (name fields)
- Update email address with verification flow  
- Change password with validation and brute-force protection (5 attempts, 15-min lockout)
- Retake workforce assessment with confirmation
- Delete account with data cleanup and success page
- Handle edge cases: duplicate emails, network failures, session expiry, concurrent tab updates

**Technical Approach**:
- Frontend-only feature extending existing React 19 + TypeScript + Vite application
- Redux Toolkit slice for profile state management (following existing authSlice pattern)
- API integration using existing service layer patterns from authApi
- Component reuse: BaseModalWithIcon, ErrorMessage, existing page components
- File naming: All files use `profile.*` prefix for consistency

## Technical Context

**Language/Version**: TypeScript 5.x with React 19  
**Primary Dependencies**: 
- React 19, React Router v7, Redux Toolkit  
- Tailwind CSS v4 (@tailwindcss/vite)
- Existing components: BaseModalWithIcon, ErrorMessage, UpdateYourEmailModal, ChangePasswordModal

**Storage**: Redux store (client state), localStorage (cross-tab communication)  
**Testing**: Jest + React Testing Library  
**Target Platform**: Web application (responsive: mobile, tablet, desktop)  
**Project Type**: Web application (frontend only - backend APIs already exist)  
**Performance Goals**:  
- Initial page load < 2 seconds
- API response handling < 3 seconds
- Validation feedback < 500ms
- 95% first-attempt success rate

**Constraints**:
- NO design changes permitted - use existing UI/modals exactly
- All pages and modals already exist - do NOT create new ones
- Must follow existing auth module API calling patterns
- File naming convention: `profile.*` prefix mandatory

**Scale/Scope**:
- 6 user stories (5 fully specified, 1 blocked)
- 43 functional requirements (FR-001 through FR-038)
- 6 API endpoints with authentication
- 8 edge cases handled with retry logic and user feedback

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I: Component-First Architecture ✅
- **Status**: PASS
- **Evidence**: Feature reuses existing components (BaseModalWithIcon, ErrorMessage, UpdateYourEmailModal, ChangePasswordModal) and Settings page
- **Commitment**: No new components to be created per Design Constraints DC-002; follow existing component patterns

### Principle II: User-Centric Design ✅
- **Status**: PASS
- **Evidence**: 6 user stories with clear acceptance criteria, prioritized P1-P3, independently testable
- **Commitment**: Each story delivers standalone value; all flows mapped in Navigation & Redirects section

### Principle III: Test-Driven Development ✅
- **Status**: PASS
- **Commitment**: Write tests BEFORE implementation for all profile features
  - Unit tests for profile slice actions/reducers
  - Component tests for modal interactions and form validation
  - Integration tests for API calls and error handling
  - Tests for concurrent tab updates and session expiry

### Principle IV: Type Safety & Code Quality ✅
- **Status**: PASS
- **Commitment**: 
  - Create `profile.types.ts` with TypeScript interfaces for all API requests/responses
  - Use strict TypeScript mode (no `any` types)
  - Follow existing code patterns from authSlice and authApi
  - ESLint + Prettier enforcement via pre-commit hooks

### Principle V: Performance & Accessibility ✅
- **Status**: PASS
- **Commitment**:
  - Maintain WCAG 2.1 Level AA compliance (use existing accessible components)
  - Implement auto-retry logic (1 retry) for network failures
  - Success criteria include performance metrics (2s load, 3s API response, 500ms validation)
  - Follow existing responsive design patterns

### Principle VI: State Management Discipline ✅
- **Status**: PASS
- **Commitment**:
  - Create Redux Toolkit slice (`profile.slice.ts`) following authSlice pattern
  - Manage modal state, loading states, and error states
  - Implement cross-tab communication using BroadcastChannel or localStorage events
  - All state updates immutable

**Gates Status**: ✅ ALL GATES PASS - Feature aligns with all constitution principles

## Project Structure

### Documentation (this feature)

```text
specs/002-profile-settings/
├── profile.plan.md          # This file
├── profile.spec.md          # Feature specification (complete)
└── checklists/
    └── requirements.md      # Spec validation (complete)
```

### Source Code (repository root)

**Web application** (frontend only). Backend APIs already exist.

```text
src/
├── store/
│   ├── slices/
│   │   ├── authSlice.ts                   # Existing - reference
│   │   └── profileSlice.ts               # NEW
│   ├── selectors/
│   │   └── profileSelectors.ts           # NEW
│   └── store.ts                           # Modify - add reducer
│
├── services/api/
│   ├── authApi.ts                         # Existing - reference
│   └── profileService.ts                 # NEW
│
├── types/
│   └── profileTypes.ts                   # NEW
│
├── hooks/
│   └── useProfile.ts                      # NEW (optional)
│
├── pages/settings/
│   └── index.tsx                          # Modify
│
├── components/modals/
│   ├── BaseModalWithIcon.tsx              # Existing - reuse
│   ├── UpdateYourEmailModal.tsx           # Existing - reuse
│   └── ChangePasswordModal.tsx            # Existing - reuse
│
└── utils/
    ├── errorHandler.ts                    # Existing - reuse
    └── validation.ts                      # Modify
│
```

**Structure Decision**: Web application - Frontend extends existing React app. Profile feature integrates into existing `src/` structure following auth module patterns.

## Implementation Phases

### Phase 0: Research & Setup (1-2 hours)
**Goal**: Understand existing patterns and setup development environment

**Tasks**:
1. Study existing `authSlice.ts` patterns for Redux implementation
2. Study existing `authApi.ts` patterns for API service layer
3. Analyze existing modal components (BaseModalWithIcon, UpdateYourEmailModal, ChangePasswordModal)
4. Review existing ErrorMessage component usage
5. Document findings in `research.md`
6. Setup branch: `002-profile-settings` (already created)

**Deliverables**: 
- `research.md` documenting existing patterns
- Development environment ready

---

### Phase 1: Core Profile Data & State Management (3-4 hours)
**Goal**: Setup Redux slice and API service for basic profile operations

**Tasks**:
1. Create `profileTypes.ts` with TypeScript interfaces for all API contracts
2. Create `profileService.ts` following `authApi.ts` patterns
3. Create `profileSlice.ts` following `authSlice.ts` patterns
4. Add profile reducer to `store.ts`
5. Create `profileSelectors.ts` for state access
6. Write unit tests for slice and service

**Dependencies**: Phase 0 complete

**Testing**:
- Unit tests for profile slice reducers/actions
- Unit tests for API service methods
- Mock API responses for success/error scenarios
- Test coverage target: > 80%

**Deliverables**:
- Redux slice with loading/error states
- API service with all 6 endpoints
- TypeScript types for all API contracts
- Test files: `profileSlice.test.ts`, `profileService.test.ts`

**Acceptance Criteria**:
- FR-002: All API requests use accessToken in headers
- FR-028: Redux Toolkit manages modal state
- All types strictly typed (no `any`)

---

### Phase 2: Settings Page - View & Update Profile (4-5 hours)
**Goal**: Implement User Story 1 - View and update basic profile information

**Tasks**:
1. Modify Settings page to dispatch profile fetch action on mount
2. Display first name, last name, email (disabled)
3. Display password as masked placeholder "••••••••" (read-only) with "Change Password" link
4. Implement edit functionality for first name and last name
5. Add form validation (required fields, max 50 chars, trim whitespace)
6. Integrate "Save" button with PATCH /profile API
7. Handle success: show BaseModalWithIcon with success message
8. Handle errors: show ErrorMessage component
9. Implement "Back to Settings" redirect after success
10. Write component tests

**Dependencies**: Phase 1 complete

**Testing**:
- Component tests for rendering profile data
- Integration tests for API calls
- Tests for validation logic
- Tests for success/error handling
- Test file: `ProfileUpdateForm.test.tsx`

**Test Cases**:
- ✅ Should fetch and display user profile data on mount
- ✅ Should show loading state while fetching
- ✅ Should display error message if fetch fails
- ✅ Should display password as "••••••••" (masked)
- ✅ Should enable Save button only when name fields change
- ✅ Should validate first name is not empty
- ✅ Should validate last name is not empty
- ✅ Should enforce max length 50 characters
- ✅ Should trim whitespace from name fields
- ✅ Should call PATCH /profile with correct payload
- ✅ Should show success modal after successful save
- ✅ Should redirect to settings after clicking "Back to Settings"
- ✅ Should preserve form data on network error
- ✅ Should show "Retry" button on failure

**Acceptance Criteria**:
- User Story 1 acceptance scenarios 1-4 pass
- FR-001, FR-004, FR-004a, FR-005, FR-006, FR-007, FR-008, FR-009 implemented
- SC-001, SC-002 metrics met (load < 2s, update < 3s)

**Deliverables**:
- Functional profile view/edit on Settings page
- Success modal integration
- Error handling with retry logic

---

### Phase 3: Email Update Flow (3-4 hours)
**Goal**: Implement User Story 2 - Update email address

**Tasks**:
1. Add "Update Email" link to Settings page
2. Integrate UpdateYourEmailModal (existing component - wire to Redux)
3. Pre-fill current email (disabled) in modal
4. Add email validation (regex format, max 255 chars, required)
5. Integrate with PATCH /profile/email API
6. Handle success: show success modal, change link to "Resend Verification Email"
7. Handle duplicate email error (409 Conflict) - show "This email is already in use"
8. Handle other errors with ErrorMessage component
9. Store email verification state in Redux
10. Write tests for modal integration and validation

**Dependencies**: Phase 2 complete

**Testing**:
- Modal integration tests
- Email validation tests (regex, required, max length)
- API error handling tests (409 duplicate email)
- Link state change tests
- Test file: `EmailUpdate.test.tsx`

**Test Cases**:
- ✅ Should open UpdateYourEmailModal when clicking "Update Email" link
- ✅ Should pre-fill current email in disabled field
- ✅ Should validate email format with regex
- ✅ Should reject empty email
- ✅ Should reject email > 255 characters
- ✅ Should call PATCH /profile/email with correct payload
- ✅ Should show "This email is already in use" error on 409
- ✅ Should show success modal after successful update
- ✅ Should change link to "Resend Verification Email" after success
- ✅ Should close modal on cancel

**Acceptance Criteria**:
- User Story 2 acceptance scenarios 1-5 pass
- FR-011 to FR-016, FR-014a implemented
- SC-003, SC-005 metrics met (update < 3s, validation < 500ms)
- Duplicate email edge case handled

**Deliverables**:
- Functional email update with verification flow
- Link state management (Update Email ↔ Resend Verification)
- 409 Conflict error handling

---

### Phase 4: Password Change Flow (3-4 hours)
**Goal**: Implement User Story 3 - Change password with brute-force protection and real-time validation

**Validation Requirements**:
- **Current Password**: Required field, minimum 8 characters
- **New Password**: Required field, minimum 8 characters, must contain uppercase, lowercase, number, special character, different from current
- **Confirm Password**: Required field, must match new password exactly
- **Error Display**: All validation errors MUST be displayed inside the modal (consistent with Update Email Modal)
  - Error location: Inside ModalBody, below/adjacent to corresponding input
  - Real-time validation: Display errors as user types, clear immediately when corrected
  - Styling: Text-only, no visual border changes or icons
  - Button disabled: Submit button disabled when any validation error exists

**Tasks**:
1. Add "Change Password" link next to password placeholder on Settings page
2. Integrate ChangePasswordModal (existing component - wire to Redux)
3. Implement real-time password validation (current, new, confirm):
   - Current password: Required, min 8 chars
   - New password: Required, min 8 chars, strength requirements (upper, lower, number, special)
   - Confirm password: Required, must match new password
4. Display validation errors inside modal body (consistent with UpdateYourEmailModal pattern)
5. Implement confirm password matching validation
6. Disable submit button when any validation error exists
7. Integrate with PATCH /profile/password API
8. Implement attempt tracking in Redux (max 5 attempts)
9. Handle incorrect current password error (401) - show remaining attempts
10. Handle account lockout (429 Too Many Requests) - show lockout duration
11. Show success modal after successful change
12. Clear attempt counter on success
13. Write tests including brute-force protection scenarios

**Dependencies**: Phase 3 complete

**Testing**:
- Password validation tests (all requirements including real-time error display)
- Confirm password matching tests
- Validation error display tests (errors appear in modal)
- Button disabled state tests
- Attempt tracking tests
- Lockout behavior tests (429 response)
- Success/error flow tests
- Test file: `PasswordChange.test.tsx`

**Test Cases**:
- ✅ Should open ChangePasswordModal when clicking "Change Password" link
- ✅ Should display validation error "Current password is required" when empty
- ✅ Should display validation error "Current password must be at least 8 characters" when too short
- ✅ Should display validation error "New password is required" when empty
- ✅ Should display validation error "New password must be at least 8 characters" when too short
- ✅ Should display validation error for missing uppercase letter
- ✅ Should display validation error for missing lowercase letter
- ✅ Should display validation error for missing number
- ✅ Should display validation error for missing special character
- ✅ Should display validation error "New password cannot be the same as current password"
- ✅ Should display validation error "Confirm password is required" when empty
- ✅ Should display validation error "Passwords do not match" when confirm differs from new
- ✅ Should clear validation errors immediately as user corrects input
- ✅ Should disable submit button when any validation error exists
- ✅ Should enable submit button only when all fields are valid
- ✅ Should show errors inside modal body (not outside)
- ✅ Should call PATCH /profile/password with correct payload on valid submission
- ✅ Should show error with remaining attempts on incorrect current password
- ✅ Should decrement attempts counter on each failure
- ✅ Should show lockout message after 5 failures (429)
- ✅ Should display lockout duration (15 minutes)
- ✅ Should show success modal after successful change
- ✅ Should reset attempt counter on success

**Acceptance Criteria**:
- User Story 3 acceptance scenarios 1-5 pass
- FR-017 to FR-020a, FR-036 to FR-038 implemented
- SC-004, SC-006 metrics met (change < 3s, validation < 500ms)
- Real-time validation errors displayed inside modal (consistent with email modal)
- Confirm password validation working correctly
- Incorrect password edge case with rate limiting handled

**Deliverables**:
- Functional password change with real-time validation error display
- Confirm password field with matching validation
- Validation errors displayed inside modal (consistent with UpdateYourEmailModal)
- Brute-force protection (5 attempts, 15-min lockout)
- Attempt tracking in Redux state
- Submit button disabled when validation errors exist

---

### Phase 5: Retake Assessment & Delete Account (2-3 hours)
**Goal**: Implement User Stories 4 & 5 - Retake assessment and delete account

**Tasks**:
1. Add "Retake the Assessment" button to Settings page
2. Create confirmation modal using BaseModalWithIcon (warning style, backgroundPattern="unsuccess")
3. Implement dashboard redirect on confirm
4. Add "Delete my Account" button to Settings page
5. Create delete confirmation modal using BaseModalWithIcon (warning style)
6. Integrate with DELETE /users/{userId} API
7. Clear Redux state (all slices) on successful deletion
8. Clear authentication tokens from localStorage
9. Redirect to `/success` page
10. Create `/success` page with message and links
11. Write tests for both flows

**Dependencies**: Phase 4 complete

**Testing**:
- Confirmation modal tests (both retake and delete)
- Redirect behavior tests
- Account deletion API integration tests
- State cleanup tests
- Token removal tests
- Test file: `RetakeDelete.test.tsx`

**Test Cases**:
- ✅ Should show warning modal when clicking "Retake the Assessment"
- ✅ Should redirect to /dashboard on retake confirm
- ✅ Should close modal on retake cancel
- ✅ Should show warning modal when clicking "Delete my Account"
- ✅ Should call DELETE /users/{userId} on delete confirm
- ✅ Should clear all Redux state after deletion
- ✅ Should clear authentication tokens after deletion
- ✅ Should redirect to /account-deleted-success after deletion
- ✅ Should display success message on deleted page
- ✅ Should prevent navigation back to authenticated pages
- ✅ Should prevent re-login with deleted credentials
- ✅ Should close modal on delete cancel

**Acceptance Criteria**:
- User Story 4 acceptance scenarios 1-3 pass
- User Story 5 acceptance scenarios 1-6 pass
- FR-021 to FR-027e implemented
- SC-009 (100% confirmation prompts) met
- Account deletion flow edge case handled

**Deliverables**:
- Retake assessment confirmation flow
- Account deletion with cleanup and success page
- `/account-deleted-success` page component

---

### Phase 6: Edge Cases & Advanced Features (4-5 hours)
**Goal**: Handle all edge cases and advanced scenarios

**Tasks**:
1. Implement auto-retry logic (1 retry on network failure) in API service
2. Add "Retry" button with form data preservation to ErrorMessage
3. Implement session expiry detection (proactive check before API calls)
4. Store modal context in sessionStorage for restoration
5. Clear sensitive data (passwords) on session expiry
6. Redirect to login on session expiry with warning message
7. Implement cross-tab communication (BroadcastChannel with localStorage fallback)
8. Show "Profile updated in another tab" notification
9. Add refresh button for cross-tab updates
10. Handle concurrent update scenarios
11. Write comprehensive edge case tests

**Dependencies**: Phase 5 complete

**Testing**:
- Network failure retry tests
- Session expiry handling tests
- Modal context restoration tests
- Cross-tab communication tests
- Concurrent update tests
- Test file: `EdgeCases.test.tsx`

**Test Cases**:
- ✅ Should retry failed request once automatically
- ✅ Should show "Retry" button after auto-retry fails
- ✅ Should preserve form data on network failure
- ✅ Should detect session expiry before API call
- ✅ Should show session expired warning
- ✅ Should store modal context in sessionStorage
- ✅ Should restore modal after re-authentication
- ✅ Should clear password fields after session expiry
- ✅ Should broadcast profile updates to other tabs
- ✅ Should show notification in other tabs
- ✅ Should reload data when clicking refresh button
- ✅ Should handle BroadcastChannel not supported (fallback)

**Acceptance Criteria**:
- All edge cases from spec resolved
- FR-010a (retry logic), FR-032 to FR-035 (session/cross-tab) implemented
- SC-007 (error handling within 2s) met
- Network failure, session expiry, and concurrent update edge cases handled

**Deliverables**:
- Robust error handling with retry logic
- Cross-tab synchronization
- Session management with context restoration

---

### Phase 7: Testing & Quality Assurance (3-4 hours)
**Goal**: Comprehensive testing and bug fixes

**Tasks**:
1. Run full test suite (unit + integration + component)
2. Verify all 43 functional requirements (FR-001 to FR-038)
3. Test all 6 user stories manually (acceptance scenarios)
4. Verify all 12 success criteria metrics (timing, percentages)
5. Cross-browser testing (Chrome, Firefox, Safari, Edge)
6. Mobile responsiveness testing (phone, tablet)
7. Accessibility audit (WCAG 2.1 AA - keyboard nav, screen readers)
8. Performance profiling (React DevTools Profiler)
9. Fix identified bugs
10. Code review and refactoring

**Dependencies**: Phase 6 complete

**Testing**:
- Full regression testing
- Manual QA for all user flows
- Performance benchmarking (lighthouse)
- Accessibility compliance check (axe DevTools)

**Quality Metrics**:
- Test coverage > 85%
- Zero critical/high bugs
- Lighthouse score > 90
- All WCAG 2.1 AA checks pass

**Acceptance Criteria**:
- All 6 user stories pass acceptance scenarios
- All 43 FRs implemented and verified
- All 12 SCs metrics met
- Zero breaking changes to existing features

**Deliverables**:
- Production-ready feature
- Test coverage report
- QA sign-off
- Performance report


---

## Phase Dependencies Diagram

```
Phase 0 (Research & Setup)
    ↓
Phase 1 (Core State & API)
    ↓
Phase 2 (Profile View/Edit)
    ↓
Phase 3 (Email Update)
    ↓
Phase 4 (Password Change)
    ↓
Phase 5 (Retake/Delete)
    ↓
Phase 6 (Edge Cases)
    ↓
Phase 7 (Testing/QA)
    ↓
Phase 8 (Documentation/Deploy)
```


---

## Risks & Mitigations

### Risk 1: Cross-Tab Communication Complexity
**Likelihood**: Medium | **Impact**: High  
**Description**: BroadcastChannel API may not be supported in older browsers; localStorage events can be unreliable

**Mitigation**: 
- Use BroadcastChannel API as primary method (modern browsers)
- Implement localStorage events as fallback (broad compatibility)
- Add comprehensive tests for both methods
- Provide graceful degradation (manual refresh if sync fails)
- Document browser support requirements

**Contingency**: If both methods fail, show manual refresh prompt

---

### Risk 2: Session Expiry During Modal Interaction
**Likelihood**: Medium | **Impact**: Medium  
**Description**: User session expires while filling out forms, losing data and context

**Mitigation**: 
- Implement proactive session check before API calls (check token expiry)
- Store modal context (which modal was open) in sessionStorage
- Clear sensitive data (passwords) on expiry for security
- Show clear warning message before redirecting to login
- Restore modal state after successful re-authentication

**Contingency**: If restoration fails, user starts flow over but sees helpful error message

---

### Risk 3: Password Lockout False Positives
**Likelihood**: Low | **Impact**: High  
**Description**: Users may get locked out due to legitimate password errors

**Mitigation**: 
- Backend handles attempt counting (not frontend) for accuracy
- Show clear error messages with remaining attempts (e.g., "4 attempts remaining")
- Display lockout duration clearly (15 minutes)
- Provide email verification unlock process (backend feature)
- Log lockout events for monitoring

**Contingency**: Support team can manually unlock accounts via backend

---

### Risk 4: Existing Component API Mismatch
**Likelihood**: Medium | **Impact**: Medium  
**Description**: Existing modal components may not support required props or behaviors

**Mitigation**: 
- Phase 0 research: thoroughly document existing component APIs
- Analyze BaseModalWithIcon, UpdateYourEmailModal, ChangePasswordModal props
- Create compatibility layer if needed (wrapper component)
- Prefer extending existing components over creating new ones
- Test with actual components early in Phase 1

**Contingency**: Request Design Constraints exception if components can't support requirements (unlikely given DC-002)

---

### Risk 5: API Response Format Inconsistency
**Likelihood**: Low | **Impact**: Medium  
**Description**: Backend API responses may differ from documented contracts

**Mitigation**: 
- Phase 1: Create TypeScript types with strict validation
- Add runtime validation for API responses (e.g., zod)
- Write integration tests with mock API responses
- Coordinate with backend team to verify contracts
- Document actual vs expected response formats in `contracts/`

**Contingency**: Create adapter layer to normalize API responses

---

### Risk 6: Performance Degradation with Large State
**Likelihood**: Low | **Impact**: Low  
**Description**: Redux state may grow large with profile data and modal states

**Mitigation**: 
- Use Redux Toolkit createSlice for optimized updates
- Implement memoized selectors (reselect) for derived state
- Clear unused state when modals close
- Profile React DevTools Profiler to identify bottlenecks
- Follow SC-001 and SC-002 metrics (2s load, 3s API response)

**Contingency**: Optimize re-renders with React.memo and useMemo if needed

---

## Complexity Tracking

**Status**: No violations - All constitution gates pass ✅

This feature demonstrates exemplary adherence to constitution principles:
- Reuses existing components (BaseModalWithIcon, UpdateYourEmailModal, ChangePasswordModal)
- Follows established Redux patterns (authSlice as template)
- Maintains strict TypeScript typing (profile.types.ts)
- Implements comprehensive error handling (auto-retry, manual retry, clear messages)
- Addresses all 8 edge cases systematically
- Security-first approach (rate limiting, token management, data cleanup)
- Test-driven development (tests written for each phase)

---

## Next Steps

**Current Phase**: Phase 0 - Research & Setup

### Immediate Actions:
1. ✅ **profile.plan.md created** - Comprehensive implementation plan complete
2. ⏳ **Phase 0**: Research existing patterns (authSlice, authApi, modal components)
   - Study existing code in `src/store/slices/authSlice.ts`
   - Study API patterns in `src/services/api/authApi.ts`
   - Analyze modal components usage
   - Create `research.md` documentation
3. ⏳ **Phase 1**: Core setup (profileSlice.ts, profileService.ts, profileTypes.ts)
4. ⏳ **Phase 2-8**: Follow implementation phases as outlined above

### Command Progression:
- ✅ `/speckit.specify` - Created profile.spec.md
- ✅ `/speckit.clarify` - Resolved 5 critical ambiguities  
- ✅ `/speckit.plan` - This file (profile.plan.md)
- ⏳ **Next**: Begin Phase 0 (Research existing patterns) or use `/speckit.tasks` for task breakdown

**Deliverables Status**:
- ✅ profile.spec.md (43 FRs, 6 user stories, 12 success criteria)
- ✅ profile.plan.md (this file - 8 phases, 6 risks, comprehensive testing)
- ⏳ research.md (Phase 0 deliverable)
- ⏳ data-model.md (Phase 8 deliverable)
- ⏳ quickstart.md (Phase 8 deliverable)
- ⏳ contracts/ (Phase 8 deliverable - 5 API schemas)
- ⏳ profile.tasks.md (via `/speckit.tasks` command)

**Branch**: `002-profile-settings` (active)  
**Specification**: profile.spec.md - ✅ Complete (43 FRs, 8 edge cases resolved)  
**Constitution**: ✅ All 6 principles compliant  
**Estimated Timeline**: 24-32 hours (3-4 working days)

### Success Criteria Mapping:
- SC-001 to SC-003: Phases 2-4 (performance timing)
- SC-004 to SC-006: Phases 3-4 (validation timing)
- SC-007: Phase 6 (error handling)
- SC-008: Phases 2-5 (user success rate)
- SC-009: Phase 5 (confirmation prompts)
- SC-010: Phases 2-5 (modal consistency)
- SC-011: Phase 1 (auth headers)
- SC-012: Phases 2-7 (workflow timing)
