# Quickstart: Ranking Feature — Additional Questions Goals Section

**Branch**: `001-ranking-feature`  
**Date**: 2026-04-13

---

## Verify the Feature Locally

### 1. Start the dev server

```bash
pnpm dev
```

### 2. Navigate to the Additional Questions form

Open your browser at `http://localhost:5173/additional-questions` (or your Vite dev server port).

### 3. Scroll to the Goals section

Scroll past the Workforce, Compensation, Benefits, and Retirement sections to reach **Goals**.

### 4. Test Question 2 — start with fewer than 3 goals

- With no goals checked, **Question 2** should show the placeholder:

  > "Select at least 3 goals from the list above to rank them"

- Select 1–2 goals, then click **Next**. Expect a validation error:
  > "Please select at least 3 workforce goals to rank them."

### 5. Test the drag-and-drop ranking list

- Check 3 or more goals in Question 1.
- **Question 2** should immediately show a draggable list containing exactly those selected goals.
- Drag items to reorder them.
- Verify reordering works correctly and the order persists.

### 6. Test goal deselection

- After ranking, uncheck a goal that appears in the ranking list.
- The ranking list should update to remove that goal and show the remaining selected goals.

### 7. Test submission

- Select exactly 3 goals, drag them into your desired order, fill out all other required fields, and click **Next**.
- Open the browser devtools Network tab, find the Finch assessment API call, and verify that `goals.workforceGoalsRanking` matches the order you set via drag-and-drop (not the old static `["Retain Talent", "Attract Talent", "Reduce Absenteeism"]`).

---

## Run Type Check

```bash
pnpm run type-check
```

Expected: zero errors.

---

## Run Tests

```bash
pnpm test
```

Expected: all tests pass, including the updated `finchAssessmentPayload.test.ts`.

---

## Files Changed

| File                                                    | Change Description                                                                                                                          |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/pages/additionalQuestions/AdditionalQuestions.tsx` | Import `RankingList`; replace Question 2 placeholder with `RankingList` component; wire `onChange` → `topThreeGoals`; add submit validation |
| `src/utils/finchAssessmentPayload.ts`                   | Remove `WORKFORCE_GOALS_RANKING` constant; use `goalsAnswers.topThreeGoals` for `workforceGoalsRanking`                                     |
| `tests/utils/finchAssessmentPayload.test.ts`            | Update complete-payload test to supply `topThreeGoals` and expect dynamic ranked values                                                     |
