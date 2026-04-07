# Contract: POST /api/v1/finch/connect-session

**Feature**: 005-finch-integration (update)  
**Date**: 2026-04-01  
**Status**: REAL — replaces stub in `src/services/api/finchApi.ts`  
**Previous contract**: `contracts/finch-session.md` (stub, endpoint was `/api/finch/sessions`)

---

## Purpose

Obtain a short-lived Finch Connect session from the backend. Returns a `sessionId` that is passed directly to the Finch Connect SDK's `open({ sessionId })` to authorize and open the overlay. Also returns a `connectUrl` for future use.

---

## Request

```
POST /api/v1/finch/connect-session
Authorization: Bearer <access_token>   ← injected automatically by apiClient interceptor
Content-Type: application/json

(no request body)
```

---

## Response — 200 OK (success)

```json
{
  "status": true,
  "data": {
    "sessionId": "sess_abc123",
    "connectUrl": "https://connect.tryfinch.com/authorize/sess_abc123"
  }
}
```

| Field             | Type      | Notes                                                                         |
| ----------------- | --------- | ----------------------------------------------------------------------------- |
| `status`          | `boolean` | `true` signals application-level success. MUST be checked even with HTTP 200. |
| `data.sessionId`  | `string`  | Non-empty. Passed to `open({ sessionId })`.                                   |
| `data.connectUrl` | `string`  | Finch-hosted authorization URL. Preserved for future use.                     |

---

## Response — 200 OK (business-level failure)

```json
{
  "status": false,
  "message": "Unable to create session at this time"
}
```

**Client handling**: `status: false` MUST be treated as failure. Display toast: `"Failed to start Finch Connect. Please try again."` (or backend `message` if present). Reset hook to idle.

---

## Response — 401 Unauthorized

```json
{
  "error": "Unauthorized",
  "message": "Invalid or expired token"
}
```

**Client handling**: Toast `"Failed to start Finch Connect. Please try again."`. Reset hook to idle.

---

## Response — 5xx Server Error

```json
{
  "error": "Internal Server Error",
  "message": "Something went wrong"
}
```

**Client handling**: Toast `message` if present, else `"Failed to start Finch Connect. Please try again."`. Reset hook to idle.

---

## Real Implementation

```typescript
// src/services/api/finchApi.ts

import apiClient from "@/services/api/authApi";

const SESSION_ERROR_MSG = "Failed to start Finch Connect. Please try again.";

export interface FinchSessionApiResponse {
  status: boolean;
  message?: string;
  data: {
    sessionId: string;
    connectUrl: string;
  };
}

export interface FinchSessionResponse {
  sessionId: string;
  connectUrl: string;
}

export const getFinchSessionId = async (): Promise<FinchSessionResponse> => {
  const response = await apiClient.post<FinchSessionApiResponse>("/finch/connect-session");
  if (!response.data.status || !response.data.data?.sessionId) {
    throw new Error(response.data.message || SESSION_ERROR_MSG);
  }
  return response.data.data;
};
```

---

## Notes

- The base URL is `VITE_API_BASE_URL/api/v1` (configured in `apiClient`). The path passed to `apiClient.post()` must be `/finch/connect-session` (no `/api/v1` prefix — that is already the base URL).
- No request body is required. Passing no second argument to `apiClient.post()` sends an empty body, which is correct for this endpoint.
