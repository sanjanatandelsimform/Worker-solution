# Research: 030-tab-stale-provider

**Generated**: 2026-05-01  
**Purpose**: Resolve all unknowns from Technical Context before Phase 1 design

---

## 1. How is `isStale` currently evaluated and where is `isConnected` used?

**Investigation**:

- `isStale` is passed from `DashboardPage.tsx` to each tab as `isXxxTabStale` (e.g. `isRecommendationTabStale`). It comes from `useDashboardStatusPolling`.
- `isConnected` is returned from `useAssessmentStatus()`, which is already called in `DashboardPage.tsx`. It is `true` when the user has completed the Finch payroll connection.
- Currently `DashboardPage.tsx` passes stale values unconditionally; non-Finch users can receive a `true` stale flag if the polling API happens to return a stale response.

**Decision**: Gate each `isStale` prop with `&& isConnected` at the call site in `DashboardPage.tsx`. No changes needed in the polling hook itself for this guard — `isConnected` is already available in scope.

**Rationale**: Minimal-change fix. The flag meaning is already correct at the hook level; the guard only needs to be applied when forwarding the value to tabs.

---

## 2. Where is `providerType` available and what are its values?

**Investigation**:

- `DashboardStatusResponse` (in `src/types/dashboardStatusTypes.ts`) already includes `providerType: ProviderType` where `type ProviderType = "assisted" | "automated" | null`.
- The polling hook already stores the full response in `status` state.
- No external API call is needed; the value arrives as part of the existing polling response.

**Decision**: Compute `isAutomatedProvider = status?.providerType === "automated"` as a `useMemo` inside `useDashboardStatusPolling`. Return it from the hook and add it to `UseDashboardStatusPollingReturn`.

**Rationale**: Keeps the derived flag co-located with the other tab-readiness flags already computed in the hook. Any consumer can access it without calling a separate hook.

**Alternatives considered**:

- Expose `providerType` raw from the hook and let consumers compare — rejected because consumers would duplicate the string comparison.
- Compute the flag in `DashboardPage.tsx` — rejected because it would be duplicated if other consumers need it.

---

## 3. What text messages should be used and where should they live?

**Investigation**:

- The current `PreparingDashboard` component has the "24-36 hours" message hardcoded.
- The spec requires the message to vary based on provider type.
- All three tab pages (`RecommendationsFinchPage`, `BenchmarkFinchPage`, `WorkforcePage`) render `PreparingDashboard` in their `isStale` branches.

**Decision**: Create `src/constants/preparingDashboardMessages.ts` with two named exports:

```ts
export const PREPARING_MSG_AUTOMATED =
  "Finch is working hard with your payroll provider to create your custom dashboard. This may take 24-36 hours. We'll send an email once your setup is complete.";
export const PREPARING_MSG_NON_AUTOMATED =
  "Finch is working hard with your payroll provider to create your custom dashboard. This may take up to 2 weeks. We'll send an email once your setup is complete.";
```

Each tab selects the correct constant based on the `isAutomatedProvider` prop and passes it as `description` to `<PreparingDashboard>`.

**Rationale**: Single source of truth for copy; avoids string duplication across three files. Easy to update copy in one place.

**Alternatives considered**:

- Inline ternary in each tab — rejected because it duplicates the string literals.
- Move selection logic into `PreparingDashboard` — rejected because it would require `PreparingDashboard` to accept `isAutomatedProvider` instead of generic `description`, coupling it to polling domain.

---

## 4. How should `PreparingDashboard` be modified?

**Investigation**:

- Current signature: `export default function PreparingDashboard()` — no props.
- The `<p>` tag contains a hardcoded string literal.
- Component is used in three places, each currently calling it with no arguments.

**Decision**: Add a `description: string` prop with a default value equal to the current hardcoded string (for backward compatibility during migration, or as the non-automated default). All three tab call sites will start passing the prop explicitly.

**Rationale**: Adding a prop with a default value is non-breaking. All existing tests that render `PreparingDashboard` and check the heading "Preparing your dashboard" continue to pass without modification. Only tests that check the specific message body need to be updated.

**Alternatives considered**:

- `description?: React.ReactNode` — rejected as unnecessary; message is always a plain string.

---

## 5. What tests need updating?

**Investigation**:

- `tests/pages/RecommendationsFinchPage.test.tsx` — has `isStale` tests that check for "Preparing your dashboard" heading. These continue to pass (heading is unchanged). New tests needed for the `description` prop / message content and the `isAutomatedProvider` prop.
- `tests/pages/BenchmarkFinchPage.test.tsx` — same pattern as above.
- `tests/hooks/useDashboardStatusPolling.test.ts` — has tests for all existing flags. New tests needed for `isAutomatedProvider`.
- `tests/pages/DashboardPage.test.tsx` and `tests/pages/DashboardPage.branches.test.tsx` — likely test the stale prop pass-through. Need to verify `isStale && isConnected` logic.
- No existing `WorkforcePage` test file — will add new test coverage for the stale + provider message behavior.

**Decision**: Update existing tests where assertions change (message body text); add new test cases for: `isAutomatedProvider` in the polling hook, message selection in each tab, and stale-guard behavior (`isStale && isConnected`).

---

## 6. TypeScript impact

**Investigation**:

- `UseDashboardStatusPollingReturn` in `src/types/dashboardStatusTypes.ts` must be extended with `isAutomatedProvider: boolean`.
- Each tab page's props interface must be extended with `isAutomatedProvider?: boolean` (default `false`).
- `PreparingDashboard` needs a prop: `description?: string`.

**Decision**: All type additions are additive (no breaking changes). No `any` types introduced.

---

## Summary of Decisions

| Unknown                          | Decision                                                                                                  |
| -------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Where to gate `isConnected`      | In `DashboardPage.tsx` when passing `isStale` to each tab                                                 |
| Where `providerType` comes from  | Already in `DashboardStatusResponse`; expose as `isAutomatedProvider` memoized flag from hook             |
| Where messages live              | `src/constants/preparingDashboardMessages.ts` with two named exports                                      |
| How `PreparingDashboard` changes | Add `description?: string` prop with non-automated default                                                |
| Which tests need updating        | Polling hook tests (new), tab page tests (new + updated), DashboardPage tests (updated)                   |
| TypeScript impact                | Additive only — extend `UseDashboardStatusPollingReturn`, tab prop interfaces, `PreparingDashboard` props |
