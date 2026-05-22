# Feature Specification: Dynamic Salary Chart Scale & Null Handling

**Feature Branch**: `032-salary-chart-dynamic`  
**Created**: 2026-05-04  
**Status**: Draft  
**Input**: User description: "Currently the numbers of row is coming as static number (7 currently), and the row comes only till 700. But I want it to be dynamic — fetch the max number from the data, if the number is 545 then the maxValue should be round number 600 for example, and the loop should iterate till 6. Also, if we have null value in the data, in the chart it's coming like $null — we want to show nothing in case of null data from BE; also the wick of the candle/bar should be hidden in case of null."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Dynamic Chart Scale (Priority: P1)

A user viewing the Salary Range Chart sees a Y-axis that automatically adjusts its upper bound and grid line count to match the actual data range. When salary data values peak at, say, 545, the chart's upper bound rounds up to the nearest 100 (600) and displays 6 evenly spaced grid lines instead of always showing 7 lines up to 700.

**Why this priority**: This is the core functionality request. A hardcoded scale of 700 with 7 rows misrepresents data that has a significantly lower or higher actual range, reducing chart accuracy and readability.

**Independent Test**: Can be fully tested by rendering the chart with a dataset whose maximum value differs from 700 and verifying the Y-axis upper bound and grid line count adjust correctly.

**Acceptance Scenarios**:

1. **Given** chart data where the highest value across all items is 545, **When** the chart renders, **Then** the Y-axis maximum is 600 and exactly 6 horizontal grid lines are drawn (at 100, 200, 300, 400, 500, 600).
2. **Given** chart data where the highest value is exactly 700, **When** the chart renders, **Then** the Y-axis maximum remains 700 and 7 grid lines are drawn.
3. **Given** chart data where the highest value is 100, **When** the chart renders, **Then** the Y-axis maximum is 100 and 1 grid line is drawn.
4. **Given** chart data where the highest value is 1050, **When** the chart renders, **Then** the Y-axis maximum is 1100 and 11 grid lines are drawn.

---

### User Story 2 - Null Data Item Suppression (Priority: P1)

A user viewing the Salary Range Chart sees no visual artifact (no label, no whisker, no box) for any data item that has null values returned from the backend. Currently the chart renders text like "$null" and draws partial shapes for null fields.

**Why this priority**: Null values from the backend indicate missing or unavailable data. Displaying "$null" is confusing and visually broken. Suppressing null items entirely is required for a clean, professional chart.

**Independent Test**: Can be fully tested by rendering the chart with one or more items containing null values and confirming no visual output (no box, no whisker, no label) appears for those items.

**Acceptance Scenarios**:

1. **Given** a data item where `boxStart`, `boxEnd`, `min`, and `max` are all null, **When** the chart renders, **Then** no box, whisker, or label is drawn for that item.
2. **Given** a data item where only some fields are null (e.g., `min` and `max` are null but `boxStart` and `boxEnd` have values), **When** the chart renders, **Then** the item is fully suppressed — no partial rendering occurs.
3. **Given** a dataset where some items have null values and others do not, **When** the chart renders, **Then** only valid (non-null) items are drawn; null items leave their column position blank.
4. **Given** a fully valid dataset with no null values, **When** the chart renders, **Then** all items are drawn as before — no regression.

---

### Edge Cases

- What happens when all data items have null values? The chart renders an empty grid with the Y-axis scaling to a minimum sensible maximum (e.g., 100).
- What happens when the dataset is empty? The chart renders an empty grid without errors.
- What happens when the highest value is 0 or negative? The Y-axis defaults to a minimum upper bound of 100 to avoid a degenerate scale.
- What happens when the computed `maxValue` is already an exact multiple of 100 (e.g., 600)? The upper bound stays at 600 with no additional rounding.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The chart MUST compute the Y-axis upper bound dynamically by finding the maximum numeric value across all non-null data item fields and rounding it up to the nearest 100.
- **FR-002**: The chart MUST compute the number of horizontal grid lines as `maxValue / 100`, drawing lines at intervals of 100 from 0 up to `maxValue`.
- **FR-003**: If all data items contain null values or the dataset is empty, the chart MUST fall back to a minimum Y-axis maximum of 100 to prevent a degenerate scale.
- **FR-004**: A data item MUST be treated as null/invalid if any of its numeric fields (`boxStart`, `boxEnd`, `min`, `max`) is null or undefined.
- **FR-005**: For null/invalid data items, the chart MUST render no visual output — no box, no whisker lines, no top/bottom value labels, and no column label text containing "$null".
- **FR-006**: Valid (non-null) data items MUST continue to render exactly as they did before this change — no visual regression.

### Key Entities

- **ChartItem**: Represents one salary range column. Fields: `label` (string), `boxStart` (number | null), `boxEnd` (number | null), `max` (number | null), `min` (number | null).
- **Computed maxValue**: The chart-level ceiling derived from data — the smallest multiple of 100 that is ≥ the highest non-null numeric value in the dataset.
- **Grid row count**: Derived from `maxValue / 100`; determines how many horizontal grid lines and Y-axis labels are drawn.

## Assumptions

- The Y-axis interval is fixed at 100 units per row. No requirement exists to change this interval size dynamically.
- The `label` field of a `ChartItem` is always a non-null string, even when numeric fields are null.
- The existing chart layout, colors, and bar/whisker drawing logic remain unchanged except for null suppression and dynamic scale computation.
- "Null" is defined as JavaScript `null` or `undefined`; zero (0) is a valid numeric value and is not suppressed.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: The Y-axis upper bound equals the smallest multiple of 100 that is ≥ the dataset's actual maximum value, for any valid dataset provided.
- **SC-002**: The number of horizontal grid lines exactly equals `maxValue / 100` for any valid dataset.
- **SC-003**: Zero instances of the text "$null", "null", or any malformed label appear on the chart when null data items are present.
- **SC-004**: All existing non-null chart items render identically to their pre-feature appearance (no visual regression).
- **SC-005**: The chart handles edge cases (all-null dataset, empty dataset, single-item dataset) without throwing errors or rendering broken visuals.
