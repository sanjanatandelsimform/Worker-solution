# API Contract: Dashboard Status — `finchConnectionStatus` Field

**Feature**: `031-finch-reauth-status`  
**Date**: 2026-05-01  
**Scope**: Frontend type additions only. Backend contract provided by API team.

---

## `GET /dashboards/status` — Response Extension

The existing `GET /dashboards/status` endpoint response is extended with one new field.

### New Field

| Field                   | Type            | Required      | Description                                                     |
| ----------------------- | --------------- | ------------- | --------------------------------------------------------------- |
| `finchConnectionStatus` | `string` (enum) | No (optional) | Current health of the Finch payroll connection for this company |

### `finchConnectionStatus` Enum Values

| Value               | Meaning                                                              |
| ------------------- | -------------------------------------------------------------------- |
| `"connected"`       | Finch authorization is valid; payroll data is syncing normally       |
| `"reauth_required"` | Finch authorization has expired or been revoked; user must reconnect |
| `"disconnected"`    | Finch connection was intentionally removed                           |
| `"pending"`         | Finch connection is being established; initial sync in progress      |

### Full Response Shape (extended)

```json
{
  "recommendation": {
    "status": "completed | pending | not_applicable",
    "updatedAt": "2026-05-01T10:00:00Z | null"
  },
  "workforce": {
    "status": "completed | pending | not_applicable",
    "updatedAt": "2026-05-01T10:00:00Z | null"
  },
  "industry": {
    "status": "completed | pending | not_applicable",
    "updatedAt": "2026-05-01T10:00:00Z | null"
  },
  "allSettled": true,
  "suggestPollMs": 5000,
  "updatedAt": "2026-05-01T10:05:00Z",
  "createdAt": "2026-05-01T10:00:00Z",
  "source": "finch",
  "providerType": "automated | assisted | null",
  "finchConnectionStatus": "connected | reauth_required | disconnected | pending"
}
```

### Backward Compatibility

- `finchConnectionStatus` is **optional**. Responses that omit it are valid (non-Finch users, older API versions).
- Frontend treats absent field identically to `"connected"` for display purposes — the "Reconnect" card only shows on explicit `"reauth_required"`.

---

## TypeScript Types (Frontend)

```typescript
// src/types/dashboardStatusTypes.ts

export type FinchConnectionStatus = "connected" | "reauth_required" | "disconnected" | "pending";

export interface DashboardStatusResponse {
  // ... existing fields ...
  finchConnectionStatus?: FinchConnectionStatus; // NEW
}

export interface UseDashboardStatusPollingReturn {
  // ... existing fields ...
  isReauthRequired: boolean; // NEW
}

// src/hooks/useFinchConnect.ts

export interface UseFinchConnectReturn {
  connectWithFinch: () => Promise<void>;
  reconnectWithFinch: () => Promise<void>; // NEW
  isLoading: boolean;
  isPageLoading: boolean;
  error: string | null;
  clearError: () => void;
}
```
