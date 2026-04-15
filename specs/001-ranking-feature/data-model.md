# Data Model: Ranking Feature — Additional Questions Goals Section

**Branch**: `001-ranking-feature`  
**Date**: 2026-04-13

---

## Entities & State

### GoalsAnswer (existing — no type changes)

Defined in `src/utils/finchAssessmentPayload.ts` and used in `AdditionalQuestions.tsx`.

```ts
interface GoalsAnswer {
  selectedGoals: string[]; // All checked goal IDs from Question 1 (never trimmed)
  topThreeGoals: string[]; // Top 3 IDs in drag order from Question 2 (was always [])
}
```

**Change**: `topThreeGoals` was always `[]` (unused). After this feature it contains the user's ranked top 3 IDs from the `RankingList` component in the order they dragged them.

---

### GoalOption (derived at render time — no new type)

Used as the `availableOptions` prop for `RankingList`. Derived from `goalsData` filtered by `selectedGoals`.

```ts
type GoalOption = { label: string; value: string };
```

| Field   | Type     | Description                                                        |
| ------- | -------- | ------------------------------------------------------------------ |
| `value` | `string` | Goal ID (`GoalItem.id` from `goalsData`) — equals the label string |
| `label` | `string` | Display name for drag item                                         |

**Derivation**:

```ts
const allGoalOptions: GoalOption[] = goalsData.flatMap(cat =>
  cat.goals.map(g => ({ label: g.label, value: g.id }))
);
const availableOptions: GoalOption[] = allGoalOptions.filter(opt =>
  goalsAnswers.selectedGoals.includes(opt.value)
);
```

---

### GoalsPayload (sent to Finch API — field semantics change, type unchanged)

Defined in `src/types/finchAssessmentTypes.ts`. No type changes needed.

```ts
interface GoalsPayload {
  workforceGoals: string[]; // All selected goal IDs (unchanged)
  workforceGoalsRanking: string[]; // Was static; now = topThreeGoals (dynamic)
}
```

| Field                   | Before                                                               | After                                                              |
| ----------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `workforceGoals`        | `[...selectedGoals]`                                                 | `[...selectedGoals]` (no change)                                   |
| `workforceGoalsRanking` | `["Retain Talent", "Attract Talent", "Reduce Absenteeism"]` (static) | `[...topThreeGoals]` (dynamic — user's ranked top 3 in drag order) |

---

## State Transitions

### Question 1 → Question 2 Sync

```
User checks goal in Question 1
  → handleGoalToggle(goalId) called
  → goalsAnswers.selectedGoals updated
  → RankingList.availableOptions recalculated
  → RankingList internal useEffect syncs items list
  → if selectedGoals.length < 3: placeholder shown
  → if selectedGoals.length >= 3: drag list shown
```

### Drag Interaction

```
User drags item in RankingList
  → handleDragEnd fires inside RankingList
  → RankingList calls onChange(newItems.slice(0, 3).map(i => i.id))
  → setGoalsAnswers(prev => ({ ...prev, topThreeGoals: value }))
  → goalsAnswers.topThreeGoals = user's ranked top 3
```

### Form Submission Flow

```
User clicks "Next"
  → handleSubmit()
  → if goalsAnswers.selectedGoals.length < 3: setValidationError message, return
  → ... other validations ...
  → buildFinchAssessmentPayload(answers, goalsAnswers, ...)
     → goals.workforceGoalsRanking = [...goalsAnswers.topThreeGoals]
  → submit(payload)
```

---

## Validation Rules

| Rule      | Field                        | Condition    | Error Message                                              |
| --------- | ---------------------------- | ------------ | ---------------------------------------------------------- |
| Min Goals | `goalsAnswers.selectedGoals` | `length < 3` | `"Please select at least 3 workforce goals to rank them."` |

---

## No New Types Required

All required types (`GoalsAnswer`, `GoalsPayload`, `GoalItem`, `GoalCategory`) already exist in the codebase. This feature only wires existing types together.
