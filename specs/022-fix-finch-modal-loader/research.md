# Research: Fix Finch Modal Loading State

**Feature**: 022-fix-finch-modal-loader  
**Phase**: 0 — Research  
**Date**: 2026-04-24

## Summary

No external research required. All decisions are derived from reading the existing source code in this repository. All NEEDS CLARIFICATION items from Technical Context are resolved below.

---

## Finding 1: Finch Hook Internal State Machine

**Decision**: Use the existing `status` field in `useFinchConnect.ts` to derive the new indicator.

**Current state machine** (`src/hooks/useFinchConnect.ts`):

```
idle → fetching-session → connecting → exchanging-code → idle
                                    ↘ idle (onClose / onError)
```

| Status             | Meaning                                      | Show page spinner? | Disable button? |
| ------------------ | -------------------------------------------- | ------------------ | --------------- |
| `idle`             | No flow active                               | No                 | No              |
| `fetching-session` | GETs session token from backend              | **Yes**            | Yes             |
| `connecting`       | Finch Connect modal is open / user interacts | **No**             | Yes             |
| `exchanging-code`  | POSTs auth code to backend, awaiting result  | **Yes**            | Yes             |

**Rationale**: The existing `status` discriminant is already fine-grained enough. No new state variable is needed inside the hook — only a new derived boolean exposed in the return value.

**Alternatives considered**:

- Adding an `isModalOpen: boolean` return field (true when `status === "connecting"`) and inverting it at the call site → rejected: leaks internal status semantics to consumers.
- Returning raw `status` from the hook → rejected: breaks encapsulation; consumers would need to import the `FinchConnectStatus` type and branch on string values.
- Moving the spinner decision into the hook via a callback/render prop → rejected: over-engineering for a single boolean.

---

## Finding 2: Naming the New Exported Field

**Decision**: Name the new field `isPageLoading`.

**Rationale**:

- Describes exactly what the field controls: "should a page-level full-screen spinner be shown?"
- Consistent with the existing pattern in the codebase where `isLoadingAssessment` (from `useAssessmentStatus`) drives the same spinner in `DashboardPage.tsx`.
- In `DashboardPage.tsx`, the destructuring alias `isLoading: isFinchLoading` already uses `isFinchLoading` as a local name; the new field becomes `isPageLoading: isFinchPageLoading` — readable at a glance.

**Alternatives considered**:

- `isRequestLoading` → technically accurate but sounds redundant ("request loading").
- `isServerLoading` → implies backend calls only; acceptable but less aligned with the Page/UI framing.
- `isModalOpen` (inverted logic) → rejected (see Finding 1).
- `isConnecting` → ambiguous — the status `"connecting"` means the modal is open, not that a network request is in flight.

**Derived value**:

```ts
const isPageLoading = status === "fetching-session" || status === "exchanging-code";
```

---

## Finding 3: Backward Compatibility of Existing `isLoading`

**Decision**: Keep `isLoading` (`status !== "idle"`) unchanged in the hook's return value.

**Rationale**:

- `isLoading` is used in `DashboardPage.tsx` to disable the "Start with Finch" button (`isDisabled={isFinchLoading}`). This behavior is correct — the button must stay disabled for the entire flow including while the modal is open.
- `tests/pages/DashboardPage.test.tsx` (T017) explicitly tests `isLoading: true` → button is disabled. This test remains valid with no changes.
- `tests/hooks/useFinchConnect.test.tsx` (T010, T011, T012, T013, T016) assert on `isLoading`. All existing assertions remain correct with no changes to the hook's `isLoading` semantics.

**Alternatives considered**:

- Removing `isLoading` and relying solely on `isPageLoading` → rejected: the button-disable logic would need to reconstruct "any non-idle phase" which would require a third derived value.
- Renaming `isLoading` to something else → rejected: unnecessary churn, breaks existing tests.

---

## Finding 4: Dashboard Page Change

**Decision**: Replace `isFinchLoading` with `isFinchPageLoading` only in the early-return spinner guard. Leave all other uses of `isFinchLoading` (button `isDisabled`) unchanged.

**Current code** (`src/pages/dashboard/DashboardPage.tsx`, lines ~233–237):

```tsx
if (isLoadingAssessment || isFinchLoading) {
  return <LoadingSpinner height={80} width={80} bgClass="bg-secondary" ariaLabel="oval-loading" />;
}
```

**Target code**:

```tsx
if (isLoadingAssessment || isFinchPageLoading) {
  return <LoadingSpinner height={80} width={80} bgClass="bg-secondary" ariaLabel="oval-loading" />;
}
```

Only the guard condition changes. The `isFinchLoading` (for button disabled) stays untouched.

---

## Finding 5: Tests to Add

**Decision**: Add 3 new test cases, all in `tests/hooks/useFinchConnect.test.tsx`.

| ID    | What it tests                                                     |
| ----- | ----------------------------------------------------------------- |
| T017a | `isPageLoading` is `false` on initial render                      |
| T017b | `isPageLoading` is `true` during `fetching-session` phase         |
| T017c | `isPageLoading` is `false` during `connecting` phase (modal open) |
| T017d | `isPageLoading` is `true` during `exchanging-code` phase          |

A new Dashboard test (T018) verifies that the spinner is NOT rendered when the hook returns `isPageLoading: false` even when `isLoading: true` (simulating "modal is open" state).

**No changes needed** to the `UseFinchConnectReturn` interface import in Dashboard test — the mock already returns plain objects, so adding `isPageLoading` to the mock default suffices.

---

## Resolved: Technical Context

| Unknown                            | Resolution                                                                                       |
| ---------------------------------- | ------------------------------------------------------------------------------------------------ |
| Name for the new return field      | `isPageLoading` — derived from `status === "fetching-session" \|\| status === "exchanging-code"` |
| Whether `isLoading` stays          | Yes, unchanged — still controls button disabled state                                            |
| Number of files changed            | 2 source files: `useFinchConnect.ts`, `DashboardPage.tsx`; 2 test files                          |
| Dashboard test mock changes needed | Yes — add `isPageLoading: false` to default mock; add 1 new test (T018)                          |
| Hook test changes needed           | Yes — add 4 new `isPageLoading` assertions (T017a–T017d)                                         |
| New imports required               | None                                                                                             |
| API/routing/Redux changes          | None                                                                                             |
