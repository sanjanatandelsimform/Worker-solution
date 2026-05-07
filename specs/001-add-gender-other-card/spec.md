# Feature Specification: Add "Other" Gender Card with Tooltip to Workforce Demographics

**Feature Branch**: `001-add-gender-other-card`  
**Created**: 2026-05-07  
**Status**: Draft  
**Input**: User description: "There will be another card called 'Other' and there will be a tooltip too. Tooltip text would be 'Other includes individuals that choose not to identify or do not identify as man or woman.' The data would be coming from BE and key would be 'other'. NOTE: Make sure to update the types, test cases and run lint, test cases, make sure nothing breaks. pnpm run test"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - View "Other" Gender Card in Demographics (Priority: P1)

An employer or HR user navigating the Workforce > Demographics section sees three gender breakdown cards: Women, Men, and Other. Each card displays a percentage from the backend. The "Other" card includes an informational tooltip icon that, when hovered or focused, reveals the full definition.

**Why this priority**: This is the core deliverable of the feature — displaying inclusive gender representation data alongside the existing gender cards. Everything else supports this user-facing outcome.

**Independent Test**: Navigate to the Workforce tab Demographics section with a dataset that includes an `other` gender percentage. Verify the "Other" card appears with the correct percentage value and the tooltip icon is visible.

**Acceptance Scenarios**:

1. **Given** the backend returns a `gender.other` percentage value, **When** the user views the Workforce Demographics section, **Then** an "Other" card displays with that percentage value alongside the Women and Men cards.
2. **Given** the "Other" card is rendered, **When** the user hovers over or focuses the tooltip icon, **Then** the tooltip reads: "Other includes individuals that choose not to identify or do not identify as man or woman."
3. **Given** the backend returns `gender.other`, **When** the backend value is a percentage string (e.g. "5%"), **Then** the card displays it correctly without modification.

---

### User Story 2 - Graceful Fallback When "Other" Data Is Missing (Priority: P2)

When the backend does not provide a value for the `other` gender key (e.g. null or undefined), the "Other" card still renders but shows a fallback placeholder ("--") instead of crashing or hiding.

**Why this priority**: Defensive display behavior ensures the page never breaks due to missing data, protecting users who may be on older API versions or incomplete datasets.

**Independent Test**: Render the Demographics section with a dataset that omits `gender.other`. Verify the "Other" card appears with "--" as the count and the tooltip is still present.

**Acceptance Scenarios**:

1. **Given** the backend response does not include `gender.other`, **When** the Demographics section renders, **Then** the "Other" card shows "--" as the count value.
2. **Given** the entire demographics section is null (no data loaded), **When** the Demographics section renders, **Then** all three gender cards show "--" as the count value.

---

### Edge Cases

- What happens when `gender.other` is `null` or `undefined`? → Card renders with "--" fallback.
- What happens when `gender.other` is `"0%"`? → Card renders "0%" as-is, not treated as missing.
- What happens when only Women and Men have values but `other` is absent from the response? → "Other" card still shows with "--".
- Does adding a third card break the two-column grid layout? → Layout accommodates odd counts (third card spans or wraps gracefully per existing CSS grid rules).

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The Workforce Demographics gender breakdown section MUST display three cards: Women, Men, and Other — in that order.
- **FR-002**: The "Other" card MUST source its count value from the `other` key within the `gender` object in the backend response.
- **FR-003**: The "Other" card MUST display a tooltip icon that, when activated, shows the text: "Other includes individuals that choose not to identify or do not identify as man or woman."
- **FR-004**: When `gender.other` is absent or null, the "Other" card count MUST display "--" as a fallback.
- **FR-005**: The `GenderBreakdown` data contract MUST include an `other` field to represent individuals who do not identify as man or woman.
- **FR-006**: All existing automated tests MUST continue to pass after this change.
- **FR-007**: New automated tests MUST cover: correct id/title/tooltip presence for the "Other" card, correct count from backend data, and "--" fallback when data is absent.

### Key Entities

- **GenderBreakdown**: The data object from the backend containing gender percentage fields. Currently has `men` and `women` string fields; this feature adds an `other` field (e.g. `"5%"`).
- **DemographicsCardConfig**: The configuration record used to render each gender card in the UI. Each record includes `id`, `title`, `count`, optional `tooltipText`, and a count class getter.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: The "Other" gender card appears as the third card in the Demographics gender section for 100% of users whose backend data includes the `other` field.
- **SC-002**: The tooltip is accessible and readable on all cards that define tooltip text — zero cards with tooltip configuration render without the tooltip icon.
- **SC-003**: All existing and new automated tests pass with zero failures after the change (`pnpm run test` exits with code 0).
- **SC-004**: No type errors are introduced — type-check (`pnpm run type-check`) passes cleanly.
- **SC-005**: The fallback "--" is shown for the "Other" card in 100% of cases where the backend omits the `other` gender value.

## Assumptions

- The existing `StaticCard` component already supports `tooltipText` and `infoIcon` props — no changes to that component are needed.
- The two-column CSS grid used for gender cards will naturally wrap a third card; no layout changes are required beyond verifying rendering.
- The Women and Men cards do not receive tooltips as part of this feature — only the "Other" card gets one.
- The backend may or may not include `other` in `gender`; the field should be typed as optional (`other?: string`) to handle both API versions gracefully.
