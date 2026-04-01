# Data Model: Finch Connect API Integration

**Feature**: 005-finch-integration (update)  
**Date**: 2026-04-01  
**Spec**: spec-finch-api-integration.md

---

## Entities

### 1. FinchSessionApiResponse

The raw HTTP response envelope returned by `POST /api/v1/finch/connect-session`.

| Field             | Type      | Required                  | Description                                                                                                                 |
| ----------------- | --------- | ------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `status`          | `boolean` | Yes                       | Application-level success flag. `true` = success; `false` = failure even if HTTP 200.                                       |
| `data`            | `object`  | Yes (when `status: true`) | Session payload                                                                                                             |
| `data.sessionId`  | `string`  | Yes                       | Short-lived session identifier. Passed to `open({ sessionId })` in the Finch Connect SDK. Must be non-empty.                |
| `data.connectUrl` | `string`  | Yes                       | Finch-hosted authorization URL. Stored for future use (e.g., fallback redirect); not consumed by the SDK in this iteration. |
| `message`         | `string`  | No                        | Human-readable backend message. Used as toast error text when present; fixed fallback string used otherwise.                |

**TypeScript interface**:

```typescript
export interface FinchSessionApiResponse {
  status: boolean;
  message?: string;
  data: {
    sessionId: string;
    connectUrl: string;
  };
}
```

**What the hook consumes**: `data.sessionId` only. `connectUrl` is preserved in the return type for forward compatibility.

---

### 2. FinchSessionResponse (hook-visible return type)

The shape returned by `getFinchSessionId()` to the hook. Derived from `FinchSessionApiResponse.data`.

| Field        | Type     | Description                                              |
| ------------ | -------- | -------------------------------------------------------- |
| `sessionId`  | `string` | Finch session identifier passed to `open({ sessionId })` |
| `connectUrl` | `string` | Reserved for future use                                  |

**TypeScript interface** (replaces the old stub-only type):

```typescript
export interface FinchSessionResponse {
  sessionId: string;
  connectUrl: string;
}
```

> **Backward compatibility**: The old type was `{ sessionId: string }`. The new type adds `connectUrl`. The hook only accesses `sessionId`, so no hook changes are needed.

---

### 3. FinchCallbackApiResponse

The raw HTTP response envelope returned by `POST /api/v1/finch/callback`.

| Field                   | Type      | Required                  | Description                                                                                                                                                      |
| ----------------------- | --------- | ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `status`                | `boolean` | Yes                       | Application-level success flag.                                                                                                                                  |
| `message`               | `string`  | Yes                       | Server message (e.g., "Payroll provider connected successfully"). Used as toast error text on failure; the hook navigates away on success without displaying it. |
| `data`                  | `object`  | Yes (when `status: true`) | Connection result payload                                                                                                                                        |
| `data.connectionId`     | `string`  | Yes                       | Unique identifier for the established connection                                                                                                                 |
| `data.connectionStatus` | `string`  | Yes                       | `"connected"` on success. Stored for forward compatibility.                                                                                                      |
| `data.providerId`       | `string`  | Yes                       | Payroll provider identifier (e.g., `"gusto"`)                                                                                                                    |
| `data.syncJobId`        | `string`  | Yes                       | Identifier of the triggered sync job                                                                                                                             |
| `data.syncJobStatus`    | `string`  | Yes                       | Initial sync job status (e.g., `"pending"`)                                                                                                                      |

**TypeScript interface**:

```typescript
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
```

---

### 4. FinchConnectResponse (hook-visible return type)

The shape returned by `exchangeFinchCode()` to the hook. Derived from `FinchCallbackApiResponse.data`.

| Field              | Type     | Description                                      |
| ------------------ | -------- | ------------------------------------------------ |
| `connectionId`     | `string` | Unique identifier for the established connection |
| `connectionStatus` | `string` | `"connected"` on success                         |
| `providerId`       | `string` | Payroll provider identifier                      |
| `syncJobId`        | `string` | Sync job identifier                              |
| `syncJobStatus`    | `string` | Initial sync job status                          |

**TypeScript interface** (replaces the old `{ success: boolean }` stub type):

```typescript
export interface FinchConnectResponse {
  connectionId: string;
  connectionStatus: string;
  providerId: string;
  syncJobId: string;
  syncJobStatus: string;
}
```

> **Backward compatibility**: The old type was `{ success: boolean }`. The hook currently does `await exchangeFinchCode(code)` without reading the return value — it navigates unconditionally on resolve. The new richer type is fully backward-compatible: the hook compiles without change, and the full data is available for future consumers.

---

## State Transitions (hook — unchanged from original design)

```
idle
  └─[user clicks "Start with Finch"]──► fetching-session
                                              │
                          ┌─── success ───────┘
                          │
                   connecting (SDK open called)
                          │
                   ┌──────┴──────────────────────┐
              onSuccess                      onClose / onError
                   │                              │
           exchanging-code                      idle ◄─ (onClose: silent; onError: toast)
                   │
            ┌──────┴────────────────┐
         success                 failure
            │                      │
     navigate("/additional-questions")   idle ◄─ (toast error)

Any error at fetching-session → idle ◄─ (toast error)
```

No state machine changes are required. This diagram reflects the existing implementation.

---

## Error Constants

Defined in `finchApi.ts` as module-level constants (FR-014):

| Constant             | Value                                                      | Used when                                       |
| -------------------- | ---------------------------------------------------------- | ----------------------------------------------- |
| `SESSION_ERROR_MSG`  | `"Failed to start Finch Connect. Please try again."`       | `connect-session` fails or returns invalid data |
| `CALLBACK_ERROR_MSG` | `"Failed to complete Finch connection. Please try again."` | `callback` fails or returns `status: false`     |
