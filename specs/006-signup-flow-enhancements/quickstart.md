# Quickstart: MVP Signup Flow Enhancements

**Feature**: `006-signup-flow-enhancements`
**Date**: 2 April 2026

---

## What This Feature Does

Three changes to the signup/verification flow, all extending existing patterns:

1. **Auto-login after registration**: Users are authenticated immediately after signup and taken to the dashboard (skipping the sign-in page).
2. **Email verified modal on dashboard**: After clicking the verification link, users land on the dashboard with a "Your email has been verified!" modal instead of the generic success page.
3. **Consistent verification for returning users**: Users who verify later (after logging out and back in) see the same modal experience.

---

## Files Changed

| File | Change | Why |
|---|---|---|
| `src/services/api/authApi.ts` | Update `signup()` return type and response parsing | Backend now returns tokens with user |
| `src/components/auth/RegistrationForm.tsx` | Capture signup response, pass user+tokens to success page, change `buttonPath` to `/dashboard` | Enable auto-login flow |
| `src/pages/auth/VerifyEmailPage.tsx` | Change navigation from `/success` to `/dashboard` with `{ emailVerified: true }` state | Redirect to dashboard with modal trigger |
| `src/hooks/useModalConfig.tsx` | Add `"emailVerified"` modal type | Configure verification confirmation modal |
| `src/pages/dashboard/DashboardPage.tsx` | Detect `emailVerified` navigation state, show modal, clear state | Display verification modal on dashboard |

---

## How to Test Manually

### Flow 1: Auto-Login After Registration
1. `pnpm dev` → navigate to `/sign-up`
2. Fill valid form data and submit
3. **Expected**: See "Account created successfully!" success page
4. Click "Let's Get Started"
5. **Expected**: Land on `/dashboard` (not `/sign-in`). Dashboard shows "Verify your email" card.

### Flow 2: Email Verification Modal
1. Complete Flow 1 (or already be logged in with unverified email)
2. Click "Verify" on dashboard → check email inbox
3. Click verification link
4. **Expected**: Land on `/dashboard` with "Your email has been verified!" modal
5. Click "Return to dashboard"
6. **Expected**: Modal closes. "Verify your email" card is gone.
7. Refresh page
8. **Expected**: Modal does NOT reappear.

### Flow 3: Returning Unverified User
1. Register, skip verification, log out
2. Log in again
3. **Expected**: Dashboard shows "Verify your email" card (existing behaviour)
4. Click verify link from email
5. **Expected**: Same modal as Flow 2

---

## Key Design Decisions

- **No new components**: The "email verified" modal uses the existing `BaseModalWithIcon` + `useModalConfig` pattern.
- **SuccessPage unchanged**: Auto-login works because `SuccessPage` already authenticates when `user` + `tokens` are in navigation state.
- **Transient modal trigger**: Navigation state (`location.state.emailVerified`) triggers the modal and is immediately cleared — no persistence, no re-trigger on refresh.
- **Cross-browser verification works**: `VerifyEmailPage` already handles cross-browser auth (stores tokens in both Redux and localStorage before navigating).

---

## Prerequisites

- Backend `/users/create` must return the updated response shape with `tokens` (see `contracts/signup-response.md`)
- No other backend changes required
