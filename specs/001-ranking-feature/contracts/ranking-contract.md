# Contract: buildFinchAssessmentPayload — workforceGoalsRanking

**Branch**: `001-ranking-feature`  
**Date**: 2026-04-13  
**Scope**: Internal function contract (no backend API changes; the Finch API endpoint and shape are unchanged)

---

## Function Signature (unchanged)

```ts
function buildFinchAssessmentPayload(
  answers: QuestionAnswer,
  goalsAnswers: GoalsAnswer,
  annualRaiseMonth: string,
  payrollProvider: string,
  benefitsEnrollmentMonth: string
): FinchAssessmentPayload;
```

---

## Changed Behaviour: `GoalsPayload.workforceGoalsRanking`

### Before

```ts
// Static — always sends the same 3 hardcoded labels:
workforceGoalsRanking: ["Retain Talent", "Attract Talent", "Reduce Absenteeism"];
```

### After

```ts
// Dynamic — sends the top 3 goal IDs in the order the user ranked them:
workforceGoalsRanking: [...goalsAnswers.topThreeGoals];
```

---

## Input Contract

| Parameter      | Field           | Type       | Meaning                                                                                                                                                                                   |
| -------------- | --------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `goalsAnswers` | `topThreeGoals` | `string[]` | Ordered list of up to 3 goal ID strings from the `RankingList` component. Empty `[]` when fewer than 3 goals are selected (submission is blocked before this state reaches the function). |

---

## Output Contract

| Field                         | Type       | Invariant                                                                                                                   |
| ----------------------------- | ---------- | --------------------------------------------------------------------------------------------------------------------------- |
| `goals.workforceGoals`        | `string[]` | All selected goal IDs (unchanged)                                                                                           |
| `goals.workforceGoalsRanking` | `string[]` | Exactly the value of `goalsAnswers.topThreeGoals` (may be empty; upstream validation prevents submission with fewer than 3) |

---

## Test Contract Updates Required

File: `tests/utils/finchAssessmentPayload.test.ts`

| Test                                                                | Old expectation                                                                                             | New expectation                                                                                                                                                    |
| ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| "produces a complete payload matching FinchAssessmentPayload shape" | `workforceGoalsRanking: ["Retain Talent", "Attract Talent", "Reduce Absenteeism"]` with `topThreeGoals: []` | `workforceGoalsRanking: ["Retain Talent", "Attract Talent", "Reduce Absenteeism"]` with `topThreeGoals: ["Retain Talent", "Attract Talent", "Reduce Absenteeism"]` |

---

## RankingList Component Integration Contract

```ts
<RankingList
  label="Rank your company's top three workforce goals (from above list)."
  isRequired={true}
  displayOrder={2}
  availableOptions={availableOptions}   // goalsData filtered by selectedGoals
  value={goalsAnswers.topThreeGoals}    // controlled value
  onChange={value =>
    setGoalsAnswers(prev => ({ ...prev, topThreeGoals: value }))
  }
  maxItems={3}
/>
```

| Prop               | Value                                                                | Notes                                                        |
| ------------------ | -------------------------------------------------------------------- | ------------------------------------------------------------ |
| `label`            | `"Rank your company's top three workforce goals (from above list)."` | Matches existing Question 2 label text                       |
| `isRequired`       | `true`                                                               | Required for submission                                      |
| `displayOrder`     | `2`                                                                  | Question 2 in the Goals section                              |
| `availableOptions` | `goalsData` flat-mapped, filtered to `selectedGoals`                 | Derived at render time                                       |
| `value`            | `goalsAnswers.topThreeGoals`                                         | Controlled — syncs with component state                      |
| `onChange`         | Updates `topThreeGoals` in `goalsAnswers`                            | `setGoalsAnswers(prev => ({...prev, topThreeGoals: value}))` |
| `maxItems`         | `3`                                                                  | Top 3 only                                                   |
