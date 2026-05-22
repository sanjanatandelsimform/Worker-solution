# Feature Specification: Keep Salary Band Label When No Data

**Feature Branch**: `034-keep-salary-band-label`  
**Created**: 2026-05-07  
**Status**: Draft  
**Input**: User description: "Currently if there's no data then we are hiding the bar and the salary band label as well. Want to implement: Hide the bar but keep the salary band at the bottom. Make sure to update/run the test cases pnpm run test. And fix if any failing after implementing."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Salary Band Label Always Visible (Priority: P1)

A user viewing the Salary Range Chart on the Workforce page should always see the salary band labels (e.g., "10th–25th", "25th–50th") at the bottom of the chart, even when some salary bands have no data available. Currently, the label is hidden along with the bar when data is absent, leaving visual gaps that make the chart confusing.

**Why this priority**: Core visual correctness — without the label, users cannot understand which salary band is missing data versus which bands exist. Keeping labels visible at all times ensures the chart layout is consistent and readable.

**Independent Test**: Navigate to the Workforce page and view the Salary Range Chart when one or more salary bands have all-null data (min, max, boxStart, boxEnd all null). Confirm the salary band label appears at the bottom of the chart column position even though no bar, whisker, or numeric value labels are drawn.

**Acceptance Scenarios**:

1. **Given** a salary band with no data (all numeric fields are null), **When** the chart renders, **Then** the bar, whiskers, and numeric value labels for that band are NOT drawn, but the salary band label IS drawn at the bottom of the chart.
2. **Given** a salary band with complete data, **When** the chart renders, **Then** the bar, whiskers, numeric value labels, and salary band label ALL appear as before (no regression).
3. **Given** all salary bands have no data, **When** the chart renders, **Then** only the grid lines are shown and all salary band labels appear at the bottom with no bars.
4. **Given** a mix of bands with and without data, **When** the chart renders, **Then** bands with data show full bars + labels, and bands without data show only labels.

---

### Edge Cases

- What happens when `item.label` itself is an empty string? Label is drawn but appears blank — acceptable, as the label content is controlled by the API.
- What happens when the canvas is not yet mounted or context is unavailable? No change from current behavior; the early return guard remains intact.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The salary band label MUST always be rendered at the bottom of its column position on the chart, regardless of whether the corresponding data (min, max, boxStart, boxEnd) is null.
- **FR-002**: When a salary band has any null numeric field, the bar (filled rectangle), whiskers (vertical lines), and numeric value labels ($boxEnd top, $boxStart bottom) MUST NOT be rendered.
- **FR-003**: When a salary band has complete numeric data, all existing rendering behavior (bar, whiskers, value labels, salary band label) MUST remain unchanged.
- **FR-004**: Existing unit/integration tests for `SalaryChart` MUST be updated to reflect the new label-always-visible behavior and all tests MUST pass after the change.
- **FR-005**: No new visual elements other than the salary band label may be introduced for empty-data columns (no placeholder bars, no "N/A" text, no empty rectangles).

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: All existing passing tests continue to pass after the change.
- **SC-002**: New or updated test cases cover the scenario where a salary band with null data still renders its label, and these tests pass.
- **SC-003**: When viewing the Workforce page with partial data, 100% of salary band labels appear at the bottom of the chart regardless of data availability.
- **SC-004**: No visual regression occurs for salary bands that already have full data — their rendering is pixel-identical to the current behavior.

## Assumptions

- The salary band label position in the canvas is always `y = 420` (as currently coded). No change to this position is required.
- The column x-position calculation for labels uses the same formula as bars: `chartLeft + columnSpacing * (index + 0.75)`.
- Tests are run with `pnpm run test` and must all pass before the feature is considered complete.
- Only `SalaryChart.tsx` and its associated test file(s) need to be modified.
