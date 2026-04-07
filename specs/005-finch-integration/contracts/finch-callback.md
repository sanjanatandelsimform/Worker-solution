# Contract: POST /api/v1/finch/callback

**Feature**: 005-finch-integration (update)  
**Date**: 2026-04-01  
**Status**: REAL — replaces stub in `src/services/api/finchApi.ts`  
**Previous contract**: `contracts/finch-connect.md` (stub, endpoint was `/api/finch/connect`)

---

## Purpose

Exchange the Finch authorization code (returned by the Finch Connect SDK's `onSuccess` callback) for a confirmed payroll provider connection. On success, the frontend redirects the user to `/additional-questions`.

---

## Request

```
POST /api/v1/finch/callback
Authorization: Bearer <access_token>   ← injected automatically by apiClient interceptor
Content-Type: application/json

{
  "code": "auth_code_abc123"
}
```

| Field  | Type     | Required | Description                                                                       |
| ------ | -------- | -------- | --------------------------------------------------------------------------------- |
| `code` | `string` | Yes      | Single-use authorization code returned by Finch Connect SDK `onSuccess({ code })` |

---

## Response — 200 OK (success)

```json
{
  "status": true,
  "message": "Payroll provider connected successfully",
  "data": {
    "connectionId": "conn-uuid-123",
    "connectionStatus": "connected",
    "providerId": "gusto",
    "syncJobId": "sync-uuid-456",
    "syncJobStatus": "pending"
  }
}
```

| Field                   | Type      | Notes                                                                                   |
| ----------------------- | --------- | --------------------------------------------------------------------------------------- |
| `status`                | `boolean` | `true` signals application-level success. MUST be checked even with HTTP 200.           |
| `message`               | `string`  | Human-readable confirmation. Not displayed to the user on success (user is redirected). |
| `data.connectionId`     | `string`  | Unique identifier for the established payroll connection                                |
| `data.connectionStatus` | `string`  | `"connected"` on success                                                                |
| `data.providerId`       | `string`  | Payroll provider identifier (e.g., `"gusto"`)                                           |
| `data.syncJobId`        | `string`  | Identifier of the triggered background sync job                                         |
| `data.syncJobStatus`    | `string`  | Initial sync job status, typically `"pending"`                                          |

**Client handling**: After successful response, call `navigate("/additional-questions")`.

---

## Response — 200 OK (business-level failure)

```json
{
  "status": false,
  "message": "Invalid or expired authorization code"
}
```

**Client handling**: `status: false` MUST be treated as failure. Display toast using `message` if present, else `"Failed to complete Finch connection. Please try again."`. Reset hook to idle. Do NOT redirect.

---

## Response — 400 Bad Request

```json
{
  "error": "Bad Request",
  "message": "Missing required field: code"
}
```

**Client handling**: Toast `message` if present, else `"Failed to complete Finch connection. Please try again."`. Reset hook to idle.

---

## Response — 401 Unauthorized

```json
{
  "error": "Unauthorized",
  "message": "Invalid or expired token"
}
```

**Client handling**: Toast `"Failed to complete Finch connection. Please try again."`. Reset hook to idle.

---

## Response — 5xx Server Error

```json
{
  "error": "Internal Server Error",
  "message": "Something went wrong"
}
```

**Client handling**: Toast `message` if present, else `"Failed to complete Finch connection. Please try again."`. Reset hook to idle.

---

## Real Implementation

```typescript
// src/services/api/finchApi.ts

import apiClient from "@/services/api/authApi";

const CALLBACK_ERROR_MSG = "Failed to complete Finch connection. Please try again.";

export interface FinchCallbackApiResponse {
  status: boolean;
  message: string;
  data: {
    connectionId: string;
    connectionStatus: string;
    providerId: string;
    syncJobId: string;
    syncJobStatus: string;
  };
}

export interface FinchConnectResponse {
  connectionId: string;
  connectionStatus: string;
  providerId: string;
  syncJobId: string;
  syncJobStatus: string;
}

export const exchangeFinchCode = async (code: string): Promise<FinchConnectResponse> => {
  const response = await apiClient.post<FinchCallbackApiResponse>("/finch/callback", { code });
  if (!response.data.status) {
    throw new Error(response.data.message || CALLBACK_ERROR_MSG);
  }
  return response.data.data;
};
```

---

## Notes

- The base URL is `VITE_API_BASE_URL/api/v1`. The path passed to `apiClient.post()` must be `/finch/callback`.
- The authorization code is single-use. If the code-exchange fails, the user must restart the full Finch Connect flow (new session ID + new overlay) — there is no partial retry for the callback step alone.
- The full `data` payload is returned by `exchangeFinchCode()` for forward compatibility, even though the hook does not currently read it.
