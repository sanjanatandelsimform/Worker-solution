# Data Model: MVP Signup Flow Enhancements

**Feature**: `006-signup-flow-enhancements`
**Date**: 2 April 2026

---

## Entities

### UserAccount (existing — no changes)

| Field | Type | Description |
|---|---|---|
| `id` | `string` (UUID) | Unique user identifier |
| `firstName` | `string` | User's first name |
| `lastName` | `string` | User's last name |
| `businessName` | `string` | Business name |
| `businessEmail` | `string` (optional) | Business email address |
| `businessPhone` | `string` (optional) | Business phone number |
| `industry` | `Industry` | Industry object `{ id, industry_name, industry_code }` |
| `zipCode` | `number` | Business zip code |
| `emailVerify` | `boolean` | Whether email has been verified |
| `authMethod` | `"email" \| "google"` (optional) | Authentication method |
| `createdAt` | `string` (ISO date) | Account creation timestamp |
| `updatedAt` | `string` (ISO date) | Last update timestamp |

**Note**: No schema changes to `UserAccount`. The `emailVerify` field already drives dashboard conditional rendering.

### AuthTokens (existing — no changes)

| Field | Type | Description |
|---|---|---|
| `accessToken` | `string` | JWT for API authentication |
| `refreshToken` | `string` | JWT for token refresh |

### AuthState (Redux — existing, no changes)

| Field | Type | Description |
|---|---|---|
| `user` | `UserAccount \| null` | Current authenticated user |
| `isAuthenticated` | `boolean` | Whether user is authenticated |
| `isLoading` | `boolean` | Auth operation in progress |
| `authInitAttempted` | `boolean` | Whether initial auth check has run |
| `tokens` | `{ accessToken: string \| null; refreshToken: string \| null }` | Current tokens |

### SignupResponse (new type)

| Field | Type | Description |
|---|---|---|
| `user` | `UserAccount` | The created user account |
| `tokens` | `{ accessToken: string; refreshToken: string }` | Auth tokens issued at registration |

**Purpose**: Types the return value of the updated `signup()` API function. Mirrors the existing `SignInResponse` pattern.

### NavigationState — Email Verified Trigger (transient, no persistence)

| Field | Type | Description |
|---|---|---|
| `emailVerified` | `boolean` | When `true`, triggers the verification modal on dashboard |

**Lifecycle**:
1. Set by `VerifyEmailPage.tsx` when navigating to `/dashboard` after successful verification
2. Read by `DashboardPage.tsx` on mount via `useLocation().state`
3. Cleared immediately after modal display via `window.history.replaceState({}, document.title)`
4. Never persisted to localStorage or Redux

---

## State Transitions

### User.emailVerify Lifecycle

```
false ──[POST /verification/verify]──> true
```

- Set to `false` at registration (`POST /users/create`)
- Set to `true` after successful email verification (`POST /verification/verify`)
- Once `true`, never reverts to `false`
- Drives dashboard conditional rendering:
  - `false` → "Verify your email" card shown
  - `true` → Assessment / recommendations UI shown

### Authentication State Lifecycle (enhanced)

```
Unauthenticated
  │
  ├──[POST /users/create + store tokens]──> Authenticated (emailVerify=false)  ← NEW
  │                                            │
  │                                            ├──[navigate to /success]──> Success Page
  │                                            │    │
  │                                            │    └──[click "Let's Get Started"]──> /dashboard
  │                                            │
  │                                            └──[logout]──> Unauthenticated
  │
  ├──[POST /auth/login]──> Authenticated (emailVerify=current)  ← UNCHANGED
  │
  └──[POST /verification/verify]──> Authenticated (emailVerify=true)  ← UNCHANGED (destination changed)
```

---

## localStorage Schema (unchanged)

Key: `"userDetail"`

```json
{
  "auth": {
    "user": { /* UserAccount */ },
    "isAuthenticated": true,
    "tokens": {
      "accessToken": "eyJ...",
      "refreshToken": "eyJ..."
    }
  },
  "registrationForm": { /* form data */ }
}
```

No changes to the storage schema. The same `persistAuth()` helper and `store.subscribe()` persistence mechanisms are used.
