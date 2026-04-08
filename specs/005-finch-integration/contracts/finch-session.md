# Contract: POST /api/finch/sessions

**Feature**: 005-finch-integration  
**Date**: 2026-03-31  
**Status**: STUB — replace function body in `src/services/api/finchApi.ts` when backend is ready

## Purpose

Obtain a short-lived Finch Connect session ID from the backend. The session ID is passed directly to the Finch Connect SDK's `open({ sessionId })` call to authorize and open the overlay.

---

## Request

```
POST /api/finch/sessions
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Body**: None (or empty JSON object `{}` — confirm with backend team)

---

## Response — 200 OK

```json
{
  "sessionId": "finch_session_xxxxxxxx"
}
```

| Field       | Type     | Notes                                       |
| ----------- | -------- | ------------------------------------------- |
| `sessionId` | `string` | Non-empty. Passed to `open({ sessionId })`. |

---

## Response — 401 Unauthorized

```json
{
  "error": "Unauthorized",
  "message": "Invalid or expired token"
}
```

**Client handling**: Show toast error `"Connection failed. Please try again."` and reset hook to idle.

---

## Response — 500 Internal Server Error

```json
{
  "error": "Internal Server Error",
  "message": "Something went wrong"
}
```

**Client handling**: Show toast error `"Connection failed. Please try again."` and reset hook to idle.

---

## Stub Implementation

```typescript
// src/services/api/finchApi.ts
export const getFinchSessionId = async (): Promise<{ sessionId: string }> => {
  // TODO: Replace with real API call when backend /api/finch/sessions is ready
  // return apiClient.post<{ sessionId: string }>('/finch/sessions').then(r => r.data);
  return Promise.resolve({ sessionId: "stub-session-id-001" });
};
```
