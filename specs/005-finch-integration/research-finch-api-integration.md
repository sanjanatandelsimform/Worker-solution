# Research: Finch Connect API Integration

**Feature**: 005-finch-integration (update)  
**Date**: 2026-04-01  
**Spec**: spec-finch-api-integration.md

---

## 1. Shared `apiClient` — Import Pattern

**Decision**: Import the default-exported `apiClient` from `@/services/api/authApi` and make all Finch HTTP calls through it. Do not create a new Axios instance in `finchApi.ts`.

**Rationale**: `dashboardApi.ts` already establishes this as the correct pattern for all non-auth API service files. The shared `apiClient` has the base URL (`VITE_API_BASE_URL || "https://dev-api.benestats.com/api/v1"`), a 10-second timeout, `withCredentials: true`, and a request interceptor that attaches the Bearer token from localStorage. Reusing it means `finchApi.ts` gets auth and configuration for free with zero duplication.

**Alternatives considered**:

- Create a new Axios instance in `finchApi.ts` (like `profileApi.ts` does) — rejected; `profileApi.ts` is an older pattern that predates the shared client. `dashboardApi.ts` is the current reference pattern.
- Inline `fetch()` calls — rejected; inconsistent with project-wide Axios approach and loses the request interceptor.

---

## 2. Response Validation: `status` Field

**Decision**: After each API call, check `response.data.status === true` in addition to the HTTP status code. Treat a falsy `status` as a failure regardless of the HTTP code.

**Rationale**: The backend API contract (defined in the spec) uses a top-level `status` boolean to signal application-level success. This mirrors what `authApi.ts` does for several endpoints (e.g., token refresh validates `newTokens` presence rather than trusting HTTP 200 alone). A `status: false` with HTTP 200 must be surfaced as an error so the user isn't silently stuck.

**Implementation pattern**:

```typescript
const response = await apiClient.post<FinchSessionApiResponse>("/finch/connect-session");
if (!response.data.status || !response.data.data?.sessionId) {
  throw new Error(response.data.message || "Failed to start Finch Connect. Please try again.");
}
return response.data.data;
```

**Alternatives considered**:

- Trust HTTP 2xx alone — rejected per FR-005 and FR-006; backend can return HTTP 200 with `status: false` to signal business-level errors.

---

## 3. Error Message Strategy: Fixed Fallbacks

**Decision**: Define two fixed fallback error strings as module-level constants in `finchApi.ts`:

- `SESSION_ERROR_MSG = "Failed to start Finch Connect. Please try again."` — thrown when `connect-session` fails or returns invalid data.
- `CALLBACK_ERROR_MSG = "Failed to complete Finch connection. Please try again."` — thrown when `callback` fails.

When the backend response includes a `message` field, prefer that; otherwise use the constant.

**Rationale**: Fixed fallback strings are required by FR-014 and clarification Q5. Centralizing them as constants in the service file ensures consistent wording and makes future updates a one-line change. The hook already uses `toast.error(errorMessage || fallback)` for Finch SDK `onError` events; the same pattern applies to API errors that are caught and rethrown from the service layer.

**Alternatives considered**:

- Leave fallback wording to implementation judgment — rejected by clarification Q5 (Option A chosen: define fixed strings).
- Define strings in the hook rather than the service — rejected; service errors are thrown as `Error` objects with the message already set, so the hook simply rethrows or propagates, keeping error wording co-located with the operation that can fail.

---

## 4. Function Signatures: Preserve Exactly

**Decision**: Retain the exact exported function names and signatures:

```typescript
export const getFinchSessionId = async (): Promise<FinchSessionResponse> => { ... }
export const exchangeFinchCode = async (code: string): Promise<FinchConnectResponse> => { ... }
```

Only update the internal types (`FinchSessionResponse`, `FinchConnectResponse`) to reflect the real response shapes. The return type visible to the hook must remain structurally compatible so the hook requires no changes.

**Rationale**: FR-011 mandates no signature changes. The hook (`useFinchConnect.ts`) and all existing test mocks reference these names. Changing them would require cascading updates that are outside the scope of this feature and risk introducing regressions.

**Type evolution**:

| Type                   | Old (stub)              | New (real API)                                                                                                                                |
| ---------------------- | ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `FinchSessionResponse` | `{ sessionId: string }` | `{ sessionId: string; connectUrl: string }` (adds field, remains compatible)                                                                  |
| `FinchConnectResponse` | `{ success: boolean }`  | `{ connectionId: string; connectionStatus: string; providerId: string; syncJobId: string; syncJobStatus: string }` (replaces `success` field) |

The hook currently checks nothing on the `exchangeFinchCode` return value (it just awaits and then navigates). The new type is a richer object — the hook's `await exchangeFinchCode(code)` call still compiles without any hook changes.

**Alternatives considered**:

- Rename types to avoid collisions with old stubs — unnecessary since the old types are only in `finchApi.ts` itself.

---

## 5. GetMore Finch Code Removal Scope

**Decision**: Remove from `GetMore.tsx`:

1. The `import { useFinchConnect } from "@/hooks/useFinchConnect"` import
2. The `const { connectWithFinch, isLoading: isFinchLoading } = useFinchConnect()` statement
3. The `connectWithFinch()` call in the Finch plan branch of the submit handler
4. The `isFinchLoading` usage in the button's disabled / loading prop

Replace the Finch plan branch with the same simple `navigate` approach used by the Manual Entry branch (or remove the Finch plan option entirely if it is no longer selectable). All other page content stays unchanged.

**Rationale**: FR-008 and clarification Q1/Q3 — keep the page, only strip Finch-specific code. The rest of the page (Manual Entry plan, accordion UI, etc.) is unaffected.

**Alternatives considered**:

- Remove the entire Finch plan accordion item from the UI — deferred; clarification Q3 says "leave the rest of the page content completely unchanged." The Finch accordion entry stays; only the flow trigger code is removed.

---

## 6. Test Disposition for GetMore

**Decision**: In `GetMore.test.tsx`:

- **Delete** T021: "clicking 'Let's Get Started' with Finch plan calls connectWithFinch"
- **Delete** T023: "'Let's Get Started' button has data-disabled when Finch plan is loading"
- **Retain** T022: "clicking 'Let's Get Started' with Manual Entry plan navigates to /assessment"
- **Remove** the `mockUseFinchConnect` / `mockConnectWithFinch` mock setup since the hook import will no longer be in the component

**Rationale**: FR-013 — delete tests covering the Finch flow from `/get-more`. T022 is a non-Finch test and must be kept. With the hook removed from GetMore, mocking it is unnecessary and would cause unused-variable lint errors.

**Alternatives considered**:

- Update T021/T023 to assert Finch is absent (Option B from clarification Q4) — rejected; Q4 selected Option A (delete, not repurpose).
