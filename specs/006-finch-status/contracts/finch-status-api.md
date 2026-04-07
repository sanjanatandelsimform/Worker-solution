# Contract: GET /api/v1/finch/status

**Feature**: 006-finch-status
**Date**: 2026-04-02
**Status**: REAL — calls the live backend endpoint (no stub)

---

## Purpose

Poll the current Finch connection state and latest data sync job status for the authenticated user's account. The response determines which UI sections are shown or hidden on the Dashboard. Called immediately on Dashboard mount and every 15 seconds thereafter.

---

## Request

```
GET /api/v1/finch/status
Authorization: Bearer <access_token>   ← injected automatically by apiClient interceptor
Content-Type: application/json

(no query parameters, no request body)
```

---

## Response — 200 OK (success, connected with pending sync)

```json
{
  "status": true,
  "data": {
    "connection": {
      "id": "conn-uuid",
      "status": "connected",
      "providerId": "gusto",
      "lastSyncedAt": null,
      "createdAt": "2026-04-01T10:00:00Z"
    },
    "latestSyncJob": {
      "id": "sync-uuid",
      "status": "pending",
      "errorMessage": null,
      "startedAt": null,
      "completedAt": null,
      "createdAt": "2026-04-01T10:00:00Z"
    }
  }
}
```

---

## Response — 200 OK (success, no connection established)

```json
{
  "status": true,
  "data": {
    "connection": null,
    "latestSyncJob": null
  }
}
```

---

## Response — 200 OK (success, sync completed)

```json
{
  "status": true,
  "data": {
    "connection": {
      "id": "conn-uuid",
      "status": "connected",
      "providerId": "gusto",
      "lastSyncedAt": "2026-04-01T10:15:00Z",
      "createdAt": "2026-04-01T10:00:00Z"
    },
    "latestSyncJob": {
      "id": "sync-uuid",
      "status": "completed",
      "errorMessage": null,
      "startedAt": "2026-04-01T10:00:30Z",
      "completedAt": "2026-04-01T10:15:00Z",
      "createdAt": "2026-04-01T10:00:00Z"
    }
  }
}
```

---

## Field Reference

### Top-Level Envelope

| Field    | Type      | Notes                                                              |
| -------- | --------- | ------------------------------------------------------------------ |
| `status` | `boolean` | `true` = application-level success. Check this even with HTTP 200. |
| `data`   | `object`  | Contains `connection` and `latestSyncJob`.                         |

### `data.connection` (nullable)

| Field          | Type             | Possible Values                                      | Notes                                |
| -------------- | ---------------- | ---------------------------------------------------- | ------------------------------------ |
| `id`           | `string`         | any UUID                                             | Unique identifier for the connection |
| `status`       | `string`         | `"connected"`, `"reauth_required"`, `"disconnected"` | Drives `isConnected` flag            |
| `providerId`   | `string`         | e.g. `"gusto"`, `"rippling"`, `"bamboohr"`           | HR provider slug                     |
| `lastSyncedAt` | `string \| null` | ISO 8601 or `null`                                   | `null` until first sync completes    |
| `createdAt`    | `string`         | ISO 8601                                             | When connection was established      |

### `data.latestSyncJob` (nullable)

| Field          | Type             | Possible Values                                        | Notes                                    |
| -------------- | ---------------- | ------------------------------------------------------ | ---------------------------------------- |
| `id`           | `string`         | any UUID                                               |                                          |
| `status`       | `string`         | `"pending"`, `"processing"`, `"completed"`, `"failed"` | No UI treatment in this iteration        |
| `errorMessage` | `string \| null` | error description or `null`                            | Non-null only when `status === "failed"` |
| `startedAt`    | `string \| null` | ISO 8601 or `null`                                     | Set when Fargate picks up the job        |
| `completedAt`  | `string \| null` | ISO 8601 or `null`                                     | Set when job finishes                    |
| `createdAt`    | `string`         | ISO 8601                                               | When the sync job was enqueued           |

---

## Client Handling Rules

| Scenario                                  | Response       | Dashboard Behaviour                                              |
| ----------------------------------------- | -------------- | ---------------------------------------------------------------- |
| `connection.status === "connected"`       | `status: true` | Hide onboarding cards; keep tabs/data visible per existing gates |
| `connection.status === "disconnected"`    | `status: true` | Show existing onboarding UI unchanged                            |
| `connection.status === "reauth_required"` | `status: true` | Treated same as disconnected — show existing onboarding UI       |
| `connection === null`                     | `status: true` | Show existing onboarding UI unchanged                            |
| `status: false` (business-level error)    | HTTP 200       | Log error to Redux; keep polling; no UI change                   |
| Network failure / non-2xx                 | —              | Log error to Redux; keep polling; no UI change; no toast         |

---

## Service Function Signature

```typescript
// In src/services/api/finchApi.ts

export interface FinchStatusData {
  connection: FinchConnection | null;
  latestSyncJob: FinchSyncJob | null;
}

export const getFinchStatus = async (): Promise<FinchStatusData> => {
  const response = await apiClient.get<FinchStatusApiResponse>("/finch/status");
  if (!response.data.status) {
    throw new Error("Failed to fetch Finch status");
  }
  return response.data.data;
};
```
