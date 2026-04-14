# Research: Ranking Feature — Additional Questions Goals Section

**Branch**: `001-ranking-feature`  
**Date**: 2026-04-13  
**Status**: Complete — all NEEDS CLARIFICATION resolved

---

## Research Items

### R-001: RankingList Component API

**Question**: How does `RankingList` work, what props does it expect, and how does it differ from use in `DynamicQuestionRenderer.tsx`?

**Decision**: Use `RankingList` from `src/components/common/RankList.tsx` directly — no modification needed.

**Findings**:

```ts
interface RankingListProps {
  label: string;
  isRequired: boolean;
  displayOrder: number;
  availableOptions: Array<{ label: string; value: string }>;
  value: string[]; // current ranked IDs (controlled)
  onChange: (value: string[]) => void; // called with top-`maxItems` IDs after each drag
  error?: string;
  maxItems?: number; // defaults to 3
}
```

- When `availableOptions` is empty or has fewer items than `maxItems`, the component renders a placeholder: `"Select at least {maxItems} goals from the list above to rank them"`.
- The `onChange` callback always returns the top `maxItems` IDs in current drag order.
- The component handles item add/remove when `availableOptions` changes (syncs via `useEffect`).
- Import path: `import { RankingList } from "@/components/common/RankList"`.

**Rationale**: The component is already proven in `DynamicQuestionRenderer.tsx` (line 1142). No new drag logic needs to be authored.

**Alternatives considered**: Writing a custom ranked list in `AdditionalQuestions.tsx` — rejected because the existing `RankingList` already handles drag ordering, item sync, and empty states correctly.

---

### R-002: State Shape — `goalsAnswers.topThreeGoals`

**Question**: Is `goalsAnswers.topThreeGoals` already wired in `AdditionalQuestions.tsx`, and what must change?

**Decision**: `topThreeGoals` exists in state but is never set. Wire it via the `RankingList.onChange` prop.

**Findings**:

- `goalsAnswers` is `{ selectedGoals: string[]; topThreeGoals: string[] }`.
- `topThreeGoals` is currently always `[]` because `handleTopThreeGoalChange` is commented out.
- The `RankingList.onChange` will call back with the top 3 IDs in drag order — use it to update `topThreeGoals` via `setGoalsAnswers`.
- No new state fields needed: `setGoalsAnswers(prev => ({ ...prev, topThreeGoals: value }))`.

**Rationale**: The existing state shape already has the correct field. Reusing it avoids introducing new state and remains consistent with the `GoalsAnswer` type exported from `finchAssessmentPayload.ts`.

---

### R-003: Available Options Derivation

**Question**: How to convert `goalsAnswers.selectedGoals` (array of goal ID strings) into `availableOptions: Array<{ label: string; value: string }>` for `RankingList`?

**Decision**: Flat-map `goalsData` and filter by `selectedGoals`.

**Findings**:

```ts
import { goalsData } from "@/data/goalsData";

const allGoalOptions = goalsData.flatMap(cat =>
  cat.goals.map(g => ({ label: g.label, value: g.id }))
);

const availableOptions = allGoalOptions.filter(opt =>
  goalsAnswers.selectedGoals.includes(opt.value)
);
```

Goal IDs in `goalsData` match goal labels exactly (e.g., `id: "Retain Talent"`, `label: "Retain Talent"`), so no additional mapping is needed. The `value` passed to `RankingList` is the same ID sent in the payload.

**Alternatives considered**: Computed during render without useMemo — acceptable since goalsData is static and selectedGoals rarely changes.

---

### R-004: Submission Validation for Minimum Rankings

**Question**: How should the "minimum 3 goals" gate work before the user clicks Next?

**Decision**: Add a check in `handleSubmit`: if `goalsAnswers.selectedGoals.length < 3`, set `validationError` and return early.

**Findings**:

- Current `handleSubmit` already uses `validationError` state with `setValidationError(null)` pattern.
- The form already shows `<ErrorMessage>` when `validationError` is non-null.
- A natural validation message: `"Please select at least 3 workforce goals to rank them."`.
- The `RankingList` itself shows a placeholder when `availableOptions.length === 0` or when fewer than `maxItems` items are present, so there is a visual cue at the component level too. The submit-time validation is the hard gate.

**Note**: We also need `goalsAnswers.topThreeGoals.length >= 3` to ensure ranking is complete. Since `RankingList.onChange` always calls back with exactly `min(items.length, maxItems)` IDs, having `selectedGoals.length >= 3` is sufficient: if 3+ options are present, the component will always produce 3 ranked IDs.

**Alternatives considered**: Disabling "Next" button reactively — rejected because the existing pattern uses submit-time validation consistently across the form.

---

### R-005: `buildFinchAssessmentPayload` — Remove Static Array

**Question**: What exactly changes in `finchAssessmentPayload.ts` and which tests break?

**Decision**: Remove `WORKFORCE_GOALS_RANKING` constant; use `goalsAnswers.topThreeGoals` in its place.

**Findings**:

Current code:

```ts
const WORKFORCE_GOALS_RANKING = ["Retain Talent", "Attract Talent", "Reduce Absenteeism"];
// ...
const goals: GoalsPayload = {
  workforceGoals: [...goalsAnswers.selectedGoals],
  workforceGoalsRanking: WORKFORCE_GOALS_RANKING,
};
```

New code:

```ts
const goals: GoalsPayload = {
  workforceGoals: [...goalsAnswers.selectedGoals],
  workforceGoalsRanking: [...goalsAnswers.topThreeGoals],
};
```

**Tests that need updating** (`tests/utils/finchAssessmentPayload.test.ts`):

| Test                                       | Change Required                                                                                                                                                     |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| "produces a complete payload…" (line ~104) | Change `topThreeGoals: []` to `topThreeGoals: ["Retain Talent", "Attract Talent", "Reduce Absenteeism"]` and update `workforceGoalsRanking` expectation accordingly |

The other tests all pass `topThreeGoals: []` and test specific fields other than `workforceGoalsRanking`. After the change, `workforceGoalsRanking` will be `[]` for those tests — the existing assertions don't check `workforceGoalsRanking` in most cases, so they remain unaffected except for the complete-payload snapshot test.

**Rationale**: The static array always sent the same 3 goals regardless of user input. The dynamic approach sends the user's actual ranked choices, making the data meaningful.

---

## Summary of Files to Modify

| File                                                    | Change                                                                                                                                                 |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/pages/additionalQuestions/AdditionalQuestions.tsx` | Import `RankingList`; replace Question 2 label with `RankingList` component; wire `onChange` to `topThreeGoals`; add submit validation for min 3 goals |
| `src/utils/finchAssessmentPayload.ts`                   | Remove `WORKFORCE_GOALS_RANKING`; use `goalsAnswers.topThreeGoals`                                                                                     |
| `tests/utils/finchAssessmentPayload.test.ts`            | Update complete-payload test snapshot for `workforceGoalsRanking`                                                                                      |

**No other files need modification.**
