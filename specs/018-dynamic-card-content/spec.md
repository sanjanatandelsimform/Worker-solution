# Feature Specification: Dynamic Proven Strategy Card Content

**Feature Branch**: `018-dynamic-card-content`  
**Created**: 2026-04-21  
**Status**: Draft  
**Input**: User description: "For the proven Strategies Cards, there are three cards, the BG colors of the card is dependent on the flag that is coming from API res. Now there is a change in the requirement. The titleIcon will be dependent on the flag — if the flag is true then show LikeIcon otherwise show UserGroupIcon. Also, the descriptionText is dependent on the flag. For nonElectiveMatch and autoEnroll the desc is the same as existing. But for healthcareAffordability, if the flag is true then desc will be 'Your employee-only premium contribution to earnings average is below 11%, which is a positive indicator of healthcare affordability. (IRS affordability is 9.96%)' otherwise it will be 'Consider adjusting employee premiums to income level. QSEHRA and ICHRA plans can offer more flexibility and savings for employers and employees.'"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Flag-Driven Icon Per Card (Priority: P1)

An employer views the Core Benefits Enhancement section on the Recommendations page. Each proven strategy card shows a title icon that reflects whether that specific strategy is already in use. An adopted strategy (flag true) shows an affirming icon; a strategy not yet adopted (flag false) shows a neutral/informational icon. This makes the implementation status immediately distinguishable at a glance, beyond background color alone.

**Why this priority**: The icon is the most prominent visual element in each card header. Mapping it to the flag delivers the core user value of this feature and is a prerequisite context for the description changes (P2).

**Independent Test**: Can be fully tested by rendering the section with varied flag combinations (all-true, all-false, mixed) and verifying the correct icon appears on each card independently.

**Acceptance Scenarios**:

1. **Given** a proven strategy card whose flag is `true`, **When** the employer views it, **Then** the card title shows the "thumbs up / like" icon.
2. **Given** a proven strategy card whose flag is `false`, **When** the employer views it, **Then** the card title shows the "user group" icon.
3. **Given** all three flags are `true`, **When** the employer views the section, **Then** all three cards display the "like" icon.
4. **Given** all three flags are `false`, **When** the employer views the section, **Then** all three cards display the "user group" icon.
5. **Given** a mixed set of flags, **When** the employer views the section, **Then** each card independently shows the icon matching its own flag value.

---

### User Story 2 - Flag-Driven Description for Healthcare Affordability Card (Priority: P2)

An employer views the Healthcare Affordability proven strategy card. The description shown adapts to reflect whether the strategy is already met or still needs attention. When the employer has already achieved affordability (flag true), they see a positive confirmation with specific data. When the strategy is not yet met (flag false), they see an actionable recommendation.

**Why this priority**: The description is the explanatory text that guides employer decision-making. The Healthcare Affordability card is uniquely data-driven — the true/false description texts differ significantly in meaning and intent. The other two cards (Non-elective match, Auto Enrollment) retain their existing static descriptions regardless of flag.

**Independent Test**: Can be fully tested by rendering the section with `healthcareAffordability` flag set to `true` then `false` and asserting the correct description text appears in each case, while verifying the other two cards always show their original descriptions unchanged.

**Acceptance Scenarios**:

1. **Given** the `healthcareAffordability` flag is `true`, **When** the employer views the card, **Then** the description reads: "Your employee-only premium contribution to earnings average is below 11%, which is a positive indicator of healthcare affordability. (IRS affordability is 9.96%)"
2. **Given** the `healthcareAffordability` flag is `false`, **When** the employer views the card, **Then** the description reads: "Consider adjusting employee premiums to income level. QSEHRA and ICHRA plans can offer more flexibility and savings for employers and employees."
3. **Given** any flag value for the `nonElectiveMatch` card, **When** the employer views it, **Then** the description is always: "Employer contributions are often skewed due to high earners's contribution capacity. Separate the employee contribution from employer contribution."
4. **Given** any flag value for the `autoEnroll` card, **When** the employer views it, **Then** the description is always: "80% of employees automatically enrolled in a 3% 401K match stay within the retirement plan."
5. **Given** the `healthcareAffordability` flag is `true`, **When** the employer views the card background, **Then** the background is still the success color (existing behavior unchanged).

---

### Edge Cases

- What happens when a flag value is absent or undefined? The card should default to the "not implemented" visual state (user group icon, false-branch description, warning background) for all three cards.
- What happens while data is loading (`isLoading = true`)? Skeleton placeholders are shown for all cards; icon, description, and background logic are irrelevant until real data arrives.
- What happens when flag values change without a page reload (e.g., after reassessment)? All three card attributes (icon, description, background) must update reactively to reflect the latest flag values.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: Each proven strategy card MUST display a title icon determined by its own individual flag value — `true` shows the affirming icon, `false` (or absent) shows the informational icon.
- **FR-002**: The icon selection MUST be evaluated independently for each card; one card's flag MUST NOT affect another card's icon.
- **FR-003**: The `healthcareAffordability` card MUST display flag-dependent description text: when the flag is `true`, the positive confirmation text; when `false` or absent, the actionable recommendation text.
- **FR-004**: The `nonElectiveMatch` card description MUST remain static regardless of its flag value.
- **FR-005**: The `autoEnroll` card description MUST remain static regardless of its flag value.
- **FR-006**: The existing background color behavior for all three cards (success color when flag is `true`, warning color when flag is `false`) MUST remain unchanged.
- **FR-007**: All three card attributes — icon, description, and background — MUST update reactively when flag values change.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 100% of proven strategy cards display the correct icon for their flag value across all supported combinations (all-true, all-false, mixed).
- **SC-002**: The Healthcare Affordability card displays the correct flag-dependent description in 100% of tested flag states.
- **SC-003**: The Non-elective match and Auto Enrollment cards display their original descriptions regardless of flag state — verified across both `true` and `false` flag values.
- **SC-004**: No regression in existing card behavior: background color, card count, and overall section layout are identical to the pre-change state across all flag combinations.
- **SC-005**: All content changes are immediately visible on page load — no user interaction required to see the correct icon or description.

## Assumptions

- The two icons already imported in the component (`LikeIcon` for `true`, `UserGroupIcon` for `false`) are the correct icons to use — no new icon assets are needed.
- The `provenStrategyFlags` object received from the parent (populated from an API response) remains the single source of truth for all three cards' display state.
- The exact description strings for `healthcareAffordability` are as specified verbatim: no further copy changes are needed.
- The existing static descriptions for `nonElectiveMatch` and `autoEnroll` are correct and do not change.
- This is a pure UI rendering change — no API contract changes, no new state, no new props are required.
