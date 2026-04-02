# Research: MVP Signup Flow Enhancements

**Feature**: `006-signup-flow-enhancements`
**Date**: 2 April 2026
**Status**: Complete — all unknowns resolved

---

## Research Question 1: How should `signup()` return type change to include tokens?

### Context
The current `signup()` function in `src/services/api/authApi.ts` (L279–298) returns `Promise<UserAccount>`. The backend now returns tokens in the `/users/create` response alongside user data. The API response shape (provided by the user) wraps both in `data: { user, tokens }`.

### Decision
Update `signup()` to return `Promise<{ user: UserAccount; tokens: { accessToken: string; refreshToken: string } }>` and extract the nested `response.data.data` structure (same pattern as `signin()`). Define a `SignupResponse` type alias if needed for clarity.

### Rationale
- Follows the exact same response-unwrapping pattern as `signin()` (L303–330) which already handles `data.data.user` and `data.data.tokens`.
- The actual API response shape is `{ status, message, data: { user, tokens } }`. The Axios response gives us `response.data` = `{ status, message, data: { user, tokens } }`, so we access `response.data.data.user` and `response.data.data.tokens`.
- TypeScript strict typing requires matching the return type to what callers will consume.

### Alternatives Considered
1. **Return raw `AxiosResponse`** — Rejected: leaks transport details, inconsistent with existing API function patterns.
2. **Add optional `tokens` field to `UserAccount`** — Rejected: tokens are not part of the user entity; conflates two concerns.

---

## Research Question 2: How should RegistrationForm handle tokens after signup?

### Context
`RegistrationForm.tsx` (L131–168) currently calls `await signup(registrationData)` and discards the return value. It then navigates to `/success` with only display text (no user/tokens in state). The `SuccessPage` already supports receiving `user` and `tokens` in navigation state and dispatching `setUser()` on button click.

### Decision
1. Capture the response from `signup()`: `const { user, tokens } = await signup(registrationData)`
2. Pass `user` and `tokens` in the navigation state to `/success` (same pattern as `signin()` in `SignInForm.tsx`)
3. Change `buttonPath` from `"/sign-in"` to `"/dashboard"`
4. The `SuccessPage` already dispatches `setUser({ user, tokens })` on button click when these are present — no changes needed to `SuccessPage.tsx`.

### Rationale
- Reuses the existing `SuccessPage` authentication flow — zero changes to `SuccessPage.tsx`.
- The `setUser` reducer in `authSlice.ts` (L163–172) handles all persistence: sets Redux state AND calls `persistAuth()` to write to localStorage.
- This is the exact same pattern used by the sign-in flow, ensuring consistency.

### Alternatives Considered
1. **Dispatch `setUser` directly in RegistrationForm** — Rejected: the SuccessPage already does this on button click. Doing it in both places creates redundancy and a confusing auth timeline (user authenticated before seeing success page).
2. **Skip the success page entirely** — Rejected: the user requirement explicitly keeps the "Account created successfully!" success page with "Let's Get Started" button.
3. **Create a new post-registration page** — Rejected: unnecessary complexity when SuccessPage already supports the flow.

---

## Research Question 3: How should VerifyEmailPage redirect to dashboard with modal trigger?

### Context
`VerifyEmailPage.tsx` (L26–97) currently handles verification success by dispatching `updateUser()` + `setTokens()` to Redux, then navigating to `/success` with user/tokens/title. The new requirement is to navigate to `/dashboard` instead and trigger a modal.

### Decision
1. Keep the existing token/user dispatch logic unchanged (both same-browser and cross-browser paths).
2. Replace `navigate("/success", { state: {...} })` with `navigate("/dashboard", { state: { emailVerified: true } })`.
3. In `DashboardPage.tsx`, detect `location.state?.emailVerified === true` and show the verification modal.
4. After showing the modal, clear the navigation state using `window.history.replaceState({}, document.title)` to prevent re-trigger on refresh.

### Rationale
- Navigation state is the standard React Router pattern for passing transient inter-page signals.
- `window.history.replaceState()` is the idiomatic way to clear location state without causing a re-render or navigation.
- The dashboard already uses `useLocation()` for other purposes (via hooks), so this fits naturally.
- No new Redux state or localStorage persistence needed — the trigger is intentionally transient.

### Alternatives Considered
1. **URL query parameter (`?emailVerified=true`)** — Rejected: visible in URL, would persist across refreshes, requires manual cleanup.
2. **Redux state flag** — Rejected: adds persistent global state for a one-time transient event. Over-engineered.
3. **localStorage flag** — Rejected: same persistence problem. Requires manual cleanup race conditions.
4. **SessionStorage** — Considered but rejected: navigation state is simpler and more idiomatic in React Router.

---

## Research Question 4: Which modal pattern to use for "Your email has been verified!" modal?

### Context
The codebase has an established `BaseModalWithIcon` component and a `useModalConfig` hook that maps modal type strings to pre-configured `BaseModalWithIconProps`. The dashboard already uses this pattern for `resendSuccess` and `cooldown` modals.

### Decision
1. Add a new modal type `"emailVerified"` to the `ModalType` union in `useModalConfig.tsx`.
2. Configure it with:
   - `title`: "Your email has been verified!"
   - `subtitle`: "Welcome aboard! Start your success journey with BeneStats."
   - `messageImg`: The existing `checkmarkIcon` (`@/assets/finch-checkmark.svg`) — same green checkmark used elsewhere.
   - `buttons`: Single button `{ text: "Return to dashboard", onClick: onClose, color: "primary" }`
   - `backgroundPattern`: `"success"` (green gradient, same as resend success modal)
3. In `DashboardPage.tsx`, add a new `isEmailVerifiedModalOpen` state, set it based on `location.state?.emailVerified`, and render `<BaseModalWithIcon {...emailVerifiedModalConfig} isOpen={isEmailVerifiedModalOpen} onClose={handleCloseEmailVerifiedModal} />`.

### Rationale
- Exact same pattern as the 10 existing modal types — zero new abstractions.
- `BaseModalWithIcon` already renders the icon/title/subtitle/button layout matching the provided design screenshot.
- The `useModalConfig` hook centralizes all modal configurations, making them easy to find and maintain.
- No new component needed.

### Alternatives Considered
1. **Create a standalone `EmailVerifiedModal` component** — Rejected: violates the established pattern where all simple modals use `BaseModalWithIcon` with `useModalConfig`.
2. **Use a toast/notification instead of modal** — Rejected: the design explicitly shows a centered modal with overlay.
3. **Render the modal in VerifyEmailPage instead** — Rejected: the user needs to see the dashboard behind the modal, not a loading spinner.

---

## Research Question 5: Cross-browser verification — is the existing pattern sufficient?

### Context
`VerifyEmailPage.tsx` already handles cross-browser verification (L56–79): when no existing user is found in localStorage, it writes a full auth session directly to localStorage and dispatches to Redux. After this, it navigates away.

### Decision
The existing cross-browser handling is sufficient. The only change is the navigation destination: from `/success` to `/dashboard` with `{ state: { emailVerified: true } }`. Since the tokens and user are already stored in both Redux and localStorage before navigation, `ProtectedRoute` will allow access to `/dashboard`.

### Rationale
- `ProtectedRoute` checks for `tokens.accessToken` in both Redux state AND localStorage (belt-and-suspenders approach). The cross-browser code writes to both.
- The `initializeAuth` thunk (which runs on app load) will validate the stored tokens and refresh if needed.
- No additional handling needed.

### Alternatives Considered
1. **Add explicit `ProtectedRoute` bypass for verification** — Rejected: unnecessary; tokens are set before navigation.

---

## Research Question 6: What about the `signup()` API response shape mismatch?

### Context
The current `signup()` function types its Axios call as `apiClient.post<UserAccount>(...)` — meaning `response.data` is typed as `UserAccount`. But the actual API response is `{ status, message, data: { user, tokens } }`, wrapped by Axios as `response.data = { status, message, data: { user, tokens } }`.

### Decision
Update the Axios generic type parameter in `signup()` to match the actual API envelope: `apiClient.post<{ status: boolean; message: string; data: { user: UserAccount; tokens: { accessToken: string; refreshToken: string } } }>(...)`. Then return `{ user: response.data.data.user, tokens: response.data.data.tokens }`.

### Rationale
- This matches the exact pattern used in `signin()` (L303–330) which already handles the same envelope structure.
- Type accuracy prevents runtime errors and provides IDE autocompletion.

### Alternatives Considered
1. **Use `as unknown as` type assertion** — Rejected: defeats the purpose of TypeScript; hides shape mismatches.
2. **Create a wrapper function** — Rejected: direct type correction is simpler and follows the existing pattern.
