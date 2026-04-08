# Data Model: Finch Status API Integration

**Feature**: 006-finch-status
**Date**: 2026-04-02

---

## Entities

### FinchConnection

The live HR provider connection record for the user's account. Drives all dashboard visibility decisions in this feature.

| Field          | Type                                                 | Notes                                         |
| -------------- | ---------------------------------------------------- | --------------------------------------------- |
| `id`           | `string`                                             | Unique connection identifier (UUID)           |
| `status`       | `"connected" \| "reauth_required" \| "disconnected"` | Drives `isConnected` derivation               |
| `providerId`   | `string`                                             | Slug of the HR provider (e.g., `"gusto"`)     |
| `lastSyncedAt` | `string \| null`                                     | ISO 8601 date of last completed sync, or null |
| `createdAt`    | `string`                                             | ISO 8601 date the connection was established  |

**Dashboard visibility rule**: `isConnected = connection?.status === "connected"`.
`"reauth_required"` and `"disconnected"` are both treated as non-connected — identical UI behaviour (existing onboarding cards shown).

---

### FinchSyncJob

The most recent Fargate data synchronisation job, if one exists.

| Field          | Type                                                   | Notes                                              |
| -------------- | ------------------------------------------------------ | -------------------------------------------------- |
| `id`           | `string`                                               | Unique job identifier (UUID)                       |
| `status`       | `"pending" \| "processing" \| "completed" \| "failed"` | Stored in Redux; no UI treatment in this iteration |
| `errorMessage` | `string \| null`                                       | Non-null when `status === "failed"`                |
| `startedAt`    | `string \| null`                                       | ISO 8601 date job began processing, or null        |
| `completedAt`  | `string \| null`                                       | ISO 8601 date job finished, or null                |
| `createdAt`    | `string`                                               | ISO 8601 date the job was created                  |

**Note**: `latestSyncJob` may be `null` in the API response if no sync has been initiated yet. The UI treats `null` identically to `pending` — no visible change.

---

## TypeScript Types (`src/types/finchStatusTypes.ts`)

```typescript
// ── Status union types ────────────────────────────────────────────────────

export type FinchConnectionStatus = "connected" | "reauth_required" | "disconnected";

export type FinchSyncJobStatus = "pending" | "processing" | "completed" | "failed";

// ── Domain entities ───────────────────────────────────────────────────────

export interface FinchConnection {
  id: string;
  status: FinchConnectionStatus;
  providerId: string;
  lastSyncedAt: string | null;
  createdAt: string;
}

export interface FinchSyncJob {
  id: string;
  status: FinchSyncJobStatus;
  errorMessage: string | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
}

// ── API envelope ─────────────────────────────────────────────────────────

export interface FinchStatusApiResponse {
  status: boolean;
  data: {
    connection: FinchConnection | null;
    latestSyncJob: FinchSyncJob | null;
  };
}

// ── Redux slice state ─────────────────────────────────────────────────────

export interface FinchStatusState {
  connection: FinchConnection | null;
  latestSyncJob: FinchSyncJob | null;
  loading: boolean;
  error: string | null;
}
```

---

## Redux Slice State Shape

**Slice key**: `finchStatus` (registered in `src/store/store.ts`)

**Initial state**:

```typescript
const initialState: FinchStatusState = {
  connection: null,
  latestSyncJob: null,
  loading: false,
  error: null,
};
```

**State transitions**:

| Action                       | `loading` | `connection`          | `latestSyncJob`       | `error`      |
| ---------------------------- | --------- | --------------------- | --------------------- | ------------ |
| `fetchFinchStatus.pending`   | `true`    | unchanged             | unchanged             | `null`       |
| `fetchFinchStatus.fulfilled` | `false`   | updated from response | updated from response | `null`       |
| `fetchFinchStatus.rejected`  | `false`   | unchanged             | unchanged             | error string |
| `auth/logout`                | reset     | `null`                | `null`                | `null`       |

---

## Hook Interface (`useFinchStatus`)

```typescript
export interface UseFinchStatusReturn {
  /** Raw connection status value, or null before first poll response */
  connectionStatus: FinchConnectionStatus | null;
  /** Raw sync job status value, or null if no job exists */
  syncJobStatus: FinchSyncJobStatus | null;
  /** True only when connection.status === "connected" */
  isConnected: boolean;
  /** True while fetchFinchStatus thunk is in-flight */
  isLoading: boolean;
  /** Error string from last failed fetch, or null */
  error: string | null;
}
```

---

## Selector File (`src/store/selectors/finchStatusSelectors.ts`)

```typescript
// Simple field selectors (no memoisation needed — primitive values)
export const selectFinchConnection = (state: RootState): FinchConnection | null =>
  state.finchStatus.connection;

export const selectFinchLatestSyncJob = (state: RootState): FinchSyncJob | null =>
  state.finchStatus.latestSyncJob;

export const selectFinchStatusLoading = (state: RootState): boolean => state.finchStatus.loading;

export const selectFinchStatusError = (state: RootState): string | null => state.finchStatus.error;
```

---

## Dashboard Visibility Logic

| Condition                         |                 Basic Plan card                 |             Connect with Finch card             |             Connect to Finch banner             |                               Tabs                               |
| --------------------------------- | :---------------------------------------------: | :---------------------------------------------: | :---------------------------------------------: | :--------------------------------------------------------------: |
| `isConnected === false` (default) | Per `emailVerify && assessment !== "completed"` | Per `emailVerify && assessment !== "completed"` | Per `emailVerify && assessment === "completed"` |       Per `assessment === "completed" && isDashboardReady`       |
| `isConnected === true`            |                   **hidden**                    |                   **hidden**                    |                   **hidden**                    | Per `assessment === "completed" && isDashboardReady` (unchanged) |

Key: The `isDashboardReady` gate for tabs is never affected by `isConnected`.
