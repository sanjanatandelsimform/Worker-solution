# Feature Specification: Dynamic Proven Strategy Flags

**Feature Branch**: `001-proven-strategy-flags`  
**Created**: 2026-05-05  
**Status**: Draft  
**Input**: User description: "There's change how the provenStrategyFlags come and from which API. In the finch flow (isConnected from useAssessmentStatus), first two (autoEnroll, nonElectiveMatch) values from Recommendation API, third (healthcareAffordability) from Workforce API. In the manual flow (!isConnected), all three values from Recommendation API. Values come as green, yellow, or hidden. Green shows card with green icon, yellow shows yellow card and icon, hidden hides the card. Total strategies count is not always 3; if one is hidden the total would be 2."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Finch Flow: Split API Sources for Strategy Flags (Priority: P1)

A company that has connected via Finch views the Recommendations tab. The "Core Benefits Enhancement" section pulls `autoEnroll` and `nonElectiveMatch` status values from the Recommendations API, and `healthcareAffordability` status from the Workforce API. The three combined flags drive which strategy cards are displayed and with what visual treatment.

**Why this priority**: This is the primary change — strategy flag data no longer comes from a single API. Getting the data source split correct is the foundation for everything else in this feature.

**Independent Test**: Can be fully tested by simulating a Finch-connected session and verifying that `healthcareAffordability` reflects Workforce API data while the other two reflect Recommendations API data, without any other UI changes.

**Acceptance Scenarios**:

1. **Given** a user is on the Recommendations tab with Finch connected, **When** the page loads, **Then** `autoEnroll` and `nonElectiveMatch` flag values come exclusively from the Recommendations API response.
2. **Given** a user is on the Recommendations tab with Finch connected, **When** the page loads, **Then** `healthcareAffordability` flag value comes exclusively from the Workforce API response.
3. **Given** a user is on the Recommendations tab without Finch connected (manual flow), **When** the page loads, **Then** all three flag values (`autoEnroll`, `nonElectiveMatch`, `healthcareAffordability`) come from the Recommendations API.

---

### User Story 2 - Tri-State Flag Visual Rendering (Priority: P1)

A user viewing the Core Benefits Enhancement section sees each strategy card styled and displayed according to its flag status value (`green`, `yellow`, or `hidden`), rather than a simple on/off boolean.

**Why this priority**: This directly changes what users see — cards may disappear entirely or change color — making it a core behavioral change.

**Independent Test**: Can be fully tested independently with mock flag data containing all three states and verifying that green cards render with green styling, yellow cards with yellow styling, and hidden cards are completely absent from the DOM.

**Acceptance Scenarios**:

1. **Given** a strategy flag value is `"green"`, **When** the strategy card renders, **Then** the card and its icon are displayed with green visual styling.
2. **Given** a strategy flag value is `"yellow"`, **When** the strategy card renders, **Then** the card and its icon are displayed with yellow visual styling.
3. **Given** a strategy flag value is `"hidden"`, **When** the Core Benefits Enhancement section renders, **Then** no card is displayed for that strategy — it is completely absent from the page.
4. **Given** all three strategy flags are `"green"`, **When** the section renders, **Then** three cards are visible, all styled green.
5. **Given** one strategy flag is `"hidden"` and the other two are `"green"` or `"yellow"`, **When** the section renders, **Then** only two cards are visible.

---

### User Story 3 - Dynamic Total Strategies Count (Priority: P2)

A user viewing the "Strategies Implemented" counter sees a denominator that reflects only the visible (non-hidden) strategies rather than a fixed value of 3.

**Why this priority**: The count and progress bar must stay accurate relative to the actual strategies shown. This depends on the tri-state rendering being correct first (P1).

**Independent Test**: Can be tested by rendering the section with one flag set to `"hidden"` and verifying the counter reads "X/2" and the progress bar calculation uses 2 as the total.

**Acceptance Scenarios**:

1. **Given** all three flags are `"green"` or `"yellow"` (none hidden), **When** the section renders, **Then** the denominator in the counter reads `3` and the progress bar calculates percentage out of 3.
2. **Given** exactly one flag is `"hidden"`, **When** the section renders, **Then** the denominator reads `2` and the progress bar percentage is calculated out of 2.
3. **Given** two flags are `"hidden"`, **When** the section renders, **Then** the denominator reads `1` and the progress bar percentage is calculated out of 1.
4. **Given** all flags are `"hidden"`, **When** the section renders, **Then** the Core Benefits Enhancement section handles the zero-visible-strategies state gracefully (no division-by-zero, no "0/0" display).
5. **Given** two flags are `"green"` and one is `"yellow"`, **When** the section renders, **Then** `provenStrategiesCount` is 2 (green count) and the denominator is 3 (all non-hidden).

---

### Edge Cases

- What happens when the Workforce API has not yet loaded when the Recommendations tab renders in the Finch flow? (`healthcareAffordability` should remain in a loading/pending state rather than default to `"hidden"` or `"yellow"`)
- What happens when the Recommendations or Workforce API returns a flag value that is not one of the three known states (`green`, `yellow`, `hidden`)? (Should fall back to `"hidden"` to avoid rendering a broken card)
- What happens when all three flags are `"hidden"`? (The section should either not render or display an appropriate empty state rather than showing "0/0" with an empty grid)
- What happens if `isConnected` status changes mid-session? (The page should re-derive flag sources correctly on re-render)

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The system MUST derive `autoEnroll` and `nonElectiveMatch` flag values from the Recommendations API in both the Finch and manual flows.
- **FR-002**: In the Finch flow (`isConnected === true`), the system MUST derive `healthcareAffordability` flag value from the Workforce API — not the Recommendations API.
- **FR-003**: In the manual flow (`isConnected === false`), the system MUST derive `healthcareAffordability` flag value from the Recommendations API.
- **FR-004**: Each strategy flag MUST support three distinct states: `"green"`, `"yellow"`, and `"hidden"`.
- **FR-005**: A strategy card with a `"green"` flag MUST render with green card background and a green icon.
- **FR-006**: A strategy card with a `"yellow"` flag MUST render with yellow card background and a yellow icon.
- **FR-007**: A strategy card with a `"hidden"` flag MUST NOT be rendered in the UI — it must be fully absent from the DOM, not just visually hidden.
- **FR-008**: The `provenStrategiesCount` (numerator in the counter) MUST equal the count of flags that are `"green"`.
- **FR-009**: The total denominator in the "Strategies Implemented" counter MUST equal the count of flags that are NOT `"hidden"` (i.e., flags that are `"green"` or `"yellow"`).
- **FR-010**: The progress bar percentage MUST be calculated as `provenStrategiesCount / visibleFlagsTotal`, where `visibleFlagsTotal` excludes hidden flags.
- **FR-011**: When all flags are `"hidden"`, the Core Benefits Enhancement section MUST handle the zero-visible-strategies state gracefully (no division-by-zero, no "0/0" display).
- **FR-012**: Flag values that are unrecognized or undefined MUST be treated as `"hidden"`.

### Key Entities

- **StrategyFlagStatus**: A tri-state value (`"green"` | `"yellow"` | `"hidden"`) that determines whether a proven strategy card is displayed and with what color treatment.
- **ProvenStrategyFlags**: A composite object of three `StrategyFlagStatus` values keyed by `autoEnroll`, `nonElectiveMatch`, and `healthcareAffordability`.
- **visibleFlagsTotal**: The computed count of flags with a status of `"green"` or `"yellow"` — used as the denominator for the strategies counter and progress bar.
- **provenStrategiesCount**: The computed count of flags with a status of `"green"` — used as the numerator for the strategies counter.

## Assumptions

- The Workforce API already returns (or will return) a field that maps to the `healthcareAffordability` flag status in the Finch flow. The exact field name and response location within the Workforce API response will be confirmed during planning.
- `"green"` means the strategy is already implemented/met by the company; `"yellow"` means it is partially met or recommended; `"hidden"` means it is not applicable or insufficient data exists to evaluate it.
- The existing `isConnected` flag from `useAssessmentStatus` correctly and reliably distinguishes Finch from manual flows at the time the Recommendations page renders.
- The `provenStrategiesCount` numerator represents only fully met ("green") strategies, not yellow ones.
- The Recommendations API response shape for `autoEnroll` and `nonElectiveMatch` will change from boolean to the tri-state string format (`"green"` | `"yellow"` | `"hidden"`).

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: In the Finch flow, the `healthcareAffordability` card reflects Workforce API data 100% of the time — it never shows Recommendations API data for Finch users.
- **SC-002**: In the manual flow, all three strategy cards reflect Recommendations API data 100% of the time.
- **SC-003**: Every rendered strategy card is styled exactly according to its flag status — zero cases where a `"green"` flag renders with yellow styling or vice versa.
- **SC-004**: When any flag is `"hidden"`, the corresponding card is absent from the rendered output in 100% of test cases — no skeleton, no placeholder, no empty card shell.
- **SC-005**: The "Strategies Implemented" counter denominator always equals the number of non-hidden flags — it never statically displays `3` when one or more flags are hidden.
- **SC-006**: The progress bar percentage is always mathematically consistent with the displayed numerator and denominator — no division-by-zero errors or `NaN` values occur under any flag combination.
