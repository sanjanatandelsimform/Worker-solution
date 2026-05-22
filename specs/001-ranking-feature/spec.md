# Feature Specification: Ranking Feature — Additional Questions Goals Section

**Feature Branch**: `001-ranking-feature`  
**Created**: 2026-04-13  
**Status**: Draft  
**Input**: User description: "Implement a ranking feature in the additional-questions form. In the last question (2. Rank your company's top three workforce goals (from above list).) — use the RankingList component same as DynamicQuestionRenderer.tsx. Under the Goals section, when user selects any goal item the items should be draggable. Minimum three items should be there when user wants to click next. Remove static WORKFORCE_GOALS_RANKING from finchAssessmentPayload.ts and use dynamic value."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Drag-and-Drop Goal Ranking (Priority: P1)

A company admin filling out the Additional Questions form navigates to the Goals section. After selecting workforce goals from the checkbox list (Question 1), they see those selected goals appear in Question 2 as a draggable ranking list. They can reorder the items by dragging to express their top priorities. The ranked order is captured and submitted as part of the assessment payload.

**Why this priority**: This is the core feature — without it, the ranking question (Question 2) has no interactive element and goal ranking data cannot be collected dynamically.

**Independent Test**: Can be fully tested by navigating to `/additional-questions`, selecting 3+ goals in Question 1, then dragging items in the ranking list and verifying the order is reflected in the submitted payload.

**Acceptance Scenarios**:

1. **Given** the user has selected 3 or more goals in Question 1, **When** they view Question 2, **Then** a draggable list appears showing only the goals they selected, in their current ranked order.
2. **Given** the draggable ranking list is visible, **When** the user drags an item to a new position, **Then** the list reorders instantly and the new order is preserved.
3. **Given** the user reorders the list, **When** they click "Next", **Then** the submitted payload's `workforceGoalsRanking` field reflects the dragged order (top 3 items), not the old static hardcoded values.

---

### User Story 2 - Minimum Selection Gate (Priority: P2)

A company admin selects fewer than 3 goals in Question 1 and attempts to proceed. The form prevents navigation and shows a placeholder state in Question 2 indicating that at least 3 goals must be selected before ranking is possible.

**Why this priority**: Data integrity — submitting fewer than 3 ranked goals would produce an incomplete `workforceGoalsRanking` array. This guard ensures the form collects the minimum required data.

**Independent Test**: Can be tested by selecting 0–2 goals and clicking "Next", verifying an error or disabled state prevents submission.

**Acceptance Scenarios**:

1. **Given** the user has selected fewer than 3 goals, **When** they view Question 2, **Then** a placeholder message is shown (e.g., "Select at least 3 goals from the list above to rank them"), not a draggable list.
2. **Given** the user has selected fewer than 3 goals, **When** they click "Next", **Then** submission is blocked and a validation message explains that at least 3 goals must be ranked.
3. **Given** the user had selected fewer than 3 goals and then adds more to reach 3, **When** they view Question 2, **Then** the ranking list appears with all selected goals available to drag.

---

### User Story 3 - Dynamic Payload Ranking (Priority: P3)

The `buildFinchAssessmentPayload` utility no longer relies on the hardcoded static `WORKFORCE_GOALS_RANKING` array. Instead, the `workforceGoalsRanking` field in the submitted payload is populated from the user's actual drag-ordered top 3 selections.

**Why this priority**: Correctness — the old static array always sends the same 3 goals regardless of what the user selected, making the ranking data meaningless.

**Independent Test**: Can be verified by selecting and ranking different goals, submitting the form, and confirming the payload's `workforceGoalsRanking` matches the user's actual ranked order.

**Acceptance Scenarios**:

1. **Given** the user has selected and ranked goals, **When** the form is submitted, **Then** `workforceGoalsRanking` in the payload equals the top 3 goal labels in the order the user arranged them in the ranking list.
2. **Given** the static `WORKFORCE_GOALS_RANKING` constant is removed from `finchAssessmentPayload.ts`, **When** the payload is built, **Then** there are no TypeScript errors and all tests pass.

---

### Edge Cases

- What happens when user deselects a goal that was already ranked in position 1 or 2? The ranking list must update to remove that goal and shift remaining items.
- What happens when user selects exactly 3 goals? All 3 appear in the ranking list and all 3 are included in `workforceGoalsRanking`.
- What happens when user selects more than 3 goals? All selected goals appear in the draggable list; only the top 3 (by current order) are included in `workforceGoalsRanking`.
- What happens if the user reorders goals and then deselects one? The remaining selected goals preserve their previously set drag order.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The Goals section Question 2 MUST render a `RankingList` component when 3 or more goals are selected in Question 1.
- **FR-002**: The `RankingList` MUST receive `availableOptions` derived exclusively from the goals the user checked in Question 1, in their current ranked order.
- **FR-003**: Users MUST be able to reorder the ranking list items via drag and drop to express their preferred priority order.
- **FR-004**: The form MUST prevent submission and display a validation message when fewer than 3 goals have been selected (i.e., the ranking list cannot provide 3 ranked items).
- **FR-005**: When fewer than 3 goals are selected, Question 2 MUST show a placeholder state explaining that at least 3 goals must be selected before ranking.
- **FR-006**: The `workforceGoalsRanking` field in the Finch assessment payload MUST be populated from the user's drag-ordered top 3 goal selections, not from a static hardcoded array.
- **FR-007**: The static `WORKFORCE_GOALS_RANKING` constant in `finchAssessmentPayload.ts` MUST be removed and replaced with the dynamic `goalsAnswers.topThreeGoals` value.
- **FR-008**: Only the files strictly necessary to implement this feature MUST be modified (i.e., `AdditionalQuestions.tsx` and `finchAssessmentPayload.ts`).
- **FR-009**: The ranking list MUST show ALL goals that the user selected in Question 1 (not limited to 3 visible items); only the top 3 by current order are sent in the payload.
- **FR-010**: When the user's goal selections change (add or remove), the ranking list MUST update to reflect only the currently selected goals, preserving the relative order of goals that remain selected.

### Key Entities

- **Selected Goals** (`goalsAnswers.selectedGoals`): Array of goal ID strings representing all goals the user checked in Question 1. These IDs are identical to the goal label strings in `goalsData`.
- **Top Three Goals** (`goalsAnswers.topThreeGoals`): Array of up to 3 goal ID strings representing the user's ranked top 3, in priority order. This is the dynamic replacement for the static `WORKFORCE_GOALS_RANKING`.
- **Goals Data** (`goalsData`): Static reference data mapping goal IDs to labels, grouped by category. Used to build the `availableOptions` array for `RankingList`.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Users can select 3 or more goals and immediately see a draggable ranking list in Question 2 with zero manual steps or page refresh.
- **SC-002**: Users can complete goal ranking in under 30 seconds by dragging items to their preferred positions.
- **SC-003**: 100% of submitted assessments include a `workforceGoalsRanking` array that matches the user's actual drag-ordered selection (not the legacy static values).
- **SC-004**: The form blocks submission in 100% of cases where fewer than 3 goals are selected, with a clear explanation shown to the user.
- **SC-005**: No TypeScript compilation errors are introduced; `tsc --noEmit` passes after the change.
- **SC-006**: Only 2 files are modified (`AdditionalQuestions.tsx` and `finchAssessmentPayload.ts`), keeping the change scope minimal.

## Assumptions

- Goal IDs in `goalsData` are identical to their label strings (e.g., `id: "Retain Talent"`, `label: "Retain Talent"`), so the same values work for both the ranking list and the payload.
- The `RankingList` component from `src/components/common/RankList.tsx` is already available and working; no modifications to it are required.
- The `maxItems` prop for the ranking list is 3, consistent with the "top three" requirement.
- The existing `goalsAnswers.topThreeGoals` field in component state is the correct place to store ranked output; no new state is needed.
- The `@dnd-kit` dependency is already installed in the project (used by `RankingList`).
