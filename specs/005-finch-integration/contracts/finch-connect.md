# Contract: POST /api/finch/connect

**Feature**: 005-finch-integration  
**Date**: 2026-03-31  
**Status**: STUB — replace function body in `src/services/api/finchApi.ts` when backend is ready

## Purpose

Exchange the Finch authorization code (returned by the Finch Connect SDK `onSuccess` callback) with the backend. The backend uses this code to obtain an access token from Finch's API and associate the employer's payroll connection with the user account.

---

## Request

```
POST /api/finch/connect
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Body**:

```json
{
  "code": "finch_auth_code_xxxxxxxx"
}
```

| Field  | Type     | Notes                                                    |
| ------ | -------- | -------------------------------------------------------- |
| `code` | `string` | Non-empty authorization code from Finch SDK `onSuccess`. |

---

## Response — 200 OK

```json
{
  "success": true
}
```

| Field     | Type      | Notes                                      |
| --------- | --------- | ------------------------------------------ |
| `success` | `boolean` | Must be `true` to proceed with navigation. |

**Client handling**: Navigate to `/additional-questions`.

---

## Response — 400 Bad Request

```json
{
  "error": "Bad Request",
  "message": "Invalid or expired authorization code"
}
```

**Client handling**: Show toast error `"Failed to connect with Finch. Please try again."` and reset hook to idle. User restarts the full flow.

---

## Response — 401 Unauthorized

```json
{
  "error": "Unauthorized",
  "message": "Invalid or expired token"
}
```

**Client handling**: Same as 400 — toast error and reset to idle.

---

## Response — 500 Internal Server Error

```json
{
  "error": "Internal Server Error",
  "message": "Something went wrong"
}
```

**Client handling**: Same as 400 — toast error and reset to idle.

---

## Stub Implementation

```typescript
// src/services/api/finchApi.ts
export const exchangeFinchCode = async (code: string): Promise<{ success: boolean }> => {
  // TODO: Replace with real API call when backend /api/finch/connect is ready
  // return apiClient.post<{ success: boolean }>('/finch/connect', { code }).then(r => r.data);
  void code; // suppress unused-variable warning on stub
  return Promise.resolve({ success: true });
};
```
