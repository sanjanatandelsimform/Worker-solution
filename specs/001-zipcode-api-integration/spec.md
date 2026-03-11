# Feature Specification: Zip Code API Autocomplete Integration

**Feature Branch**: `001-zipcode-api-integration`  
**Created**: 2026-03-10  
**Updated**: 2026-03-11  
**Status**: Draft  
**Input**: User description: "Integrate Zip Code API in WorkforceTab — Add zip code autocomplete behavior with debounced API lookup to STRUCTURED_ARRAY zip code fields in two specific workforce assessment questions"

### Revision Log

| Date | Change | Reason |
| ---------- | ------ | ------ |
| 2026-03-11 | Added FR-016, strengthened FR-005, updated US1/US2/US4 acceptance scenarios, added edge case for post-selection reopening | Bug fix: dropdown reopens after selection due to debounced input triggering a re-fetch. Must close immediately and stay closed until the user types new input. |

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.
  
  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 — Zip Code Autocomplete on Work Locations (Priority: P1)

A user is filling out the workforce assessment and reaches the question "List the top 5 work locations that employees are commuting to." Each row contains a State dropdown and a Zip Code text field. When the user starts typing a zip code and enters at least 2 characters, a dropdown of matching zip codes appears below the input — each suggestion showing the zip code (e.g., "39401"). The user clicks a suggestion to populate the zip code field with the selected value. The dropdown then closes.

**Why this priority**: This is the primary top-level question where zip code autocomplete is most visible. It is a required question and directly impacts data accuracy for the assessment.

**Independent Test**: Can be fully tested by navigating to the Workforce assessment tab, reaching the "top 5 work locations" question, typing 2+ characters in any zip code field, verifying the suggestion dropdown appears, and selecting a suggestion.

**Acceptance Scenarios**:

1. **Given** the user is on the Workforce assessment tab viewing the "top 5 work locations" question, **When** they type "394" in a zip code field, **Then** a dropdown appears showing matching zip codes from the lookup service (e.g., "39401")
2. **Given** a zip code suggestion dropdown is visible, **When** the user clicks a suggestion (e.g., "39401"), **Then** the zip code field is populated with "39401" and the dropdown closes immediately — it MUST NOT reopen until the user manually types new characters
3. **Given** the user has typed only 1 character in the zip code field, **When** they stop typing, **Then** no lookup request is made and no dropdown appears
4. **Given** the user is typing rapidly in the zip code field, **When** they type "3", "39", "394" within 300 milliseconds, **Then** only one lookup request is sent (for "394"), not three separate requests

---

### User Story 2 — Zip Code Autocomplete on Employee Living Locations (Priority: P1)

A user answers "No" to the question "Do your employees live in the same zip code areas as your work locations?" This reveals the conditional question "If no, where do your employees live? Select top 5 common zip code areas," which also uses rows with State and Zip Code fields. The zip code autocomplete behavior is identical to User Story 1 — typing 2+ characters triggers suggestions, and clicking a suggestion populates the field.

**Why this priority**: This is the second (and only other) target question. It must work identically to Story 1 to provide a consistent user experience. It is also a P1 because the feature scope explicitly requires both questions be addressed.

**Independent Test**: Can be tested by navigating to the Workforce tab, answering "No" to the residence question, then typing in the conditional zip code field and verifying the autocomplete dropdown appears and functions correctly.

**Acceptance Scenarios**:

1. **Given** the user answered "No" to "Do your employees live in the same zip code areas…" and the conditional STRUCTURED_ARRAY is visible, **When** the user types "100" in a zip code field, **Then** a dropdown appears showing matching zip codes (e.g., "10001")
2. **Given** a suggestion dropdown is visible in the conditional question, **When** the user clicks a result, **Then** the field is populated and the dropdown closes immediately — it MUST NOT reopen until the user manually types new characters
3. **Given** the user adds a second row via "Add another" in the conditional question, **When** they type 2+ characters in the new row's zip code field, **Then** the autocomplete dropdown works independently for that row

---

### User Story 3 — Loading and Empty States (Priority: P2)

While the system is looking up zip codes, the user sees a loading indicator in the dropdown area. If the lookup returns no results or fails, the user sees a "No results found" message instead of an empty space. This feedback helps users understand the system is responding to their input.

**Why this priority**: This is a usability enhancement that depends on the core autocomplete (Stories 1 & 2) working first. It improves the user experience but is not required for core data capture.

**Independent Test**: Can be tested by simulating slow network or entering a zip prefix with no matches (e.g., "00000") and verifying the loading indicator appears during the request and "No results found" appears when there are no matches.

**Acceptance Scenarios**:

1. **Given** the user has typed 2+ characters in a zip code field, **When** the lookup request is in progress, **Then** a loading indicator is visible in the dropdown area
2. **Given** the lookup request completes with zero matching zip codes, **When** results are displayed, **Then** the dropdown shows "No results found"
3. **Given** the lookup request fails (network error, server error), **When** the error is caught, **Then** the dropdown shows "No results found" (not a blank or broken state)

---

### User Story 4 — Dropdown Dismissal (Priority: P2)

When the suggestion dropdown is open and the user clicks outside the zip code input or dropdown area, the dropdown closes. This prevents the dropdown from lingering and blocking other form elements.

**Why this priority**: Standard usability behavior for dropdowns. Depends on core autocomplete working first.

**Independent Test**: Can be tested by opening the suggestion dropdown, clicking on another form element, and verifying the dropdown disappears.

**Acceptance Scenarios**:

1. **Given** the zip code suggestion dropdown is visible, **When** the user clicks anywhere outside the input and the dropdown, **Then** the dropdown closes
2. **Given** the zip code suggestion dropdown is visible, **When** the user presses Escape or tabs away, **Then** the dropdown closes
3. **Given** the user has just selected a suggestion and the dropdown closed, **When** the system processes the selected value internally (e.g., debounced input resolves), **Then** the dropdown MUST NOT reopen — no additional lookup requests should be triggered by the selection itself

---

### Edge Cases

- What happens when the user clears the zip code field after selecting a suggestion? The dropdown should not reappear until the user types 2+ characters again.
- What happens if the user pastes a full 5-digit zip code? The lookup should fire (since 5 >= 2 characters) and show matching results. If the pasted value exactly matches one result, the dropdown still appears so the user can confirm their selection.
- What happens when multiple rows exist and the user types in different zip code fields simultaneously (e.g., tabbing quickly between rows)? Each row's autocomplete must operate independently — one row's dropdown must not interfere with another row's dropdown.
- What if the user types non-numeric characters? Non-numeric characters should continue to be filtered out by the existing zip code input validation (digits only, max 5 chars). The lookup should only fire with the valid digit characters.
- What happens when the user types 2 characters, sees results, then deletes back to 1 character? The dropdown should close and any in-flight request should be cancelled or its result ignored.
- What if the add/remove row buttons are clicked while a dropdown is open? The dropdown for the removed row disappears naturally. Adding a row does not affect existing rows' dropdowns.
- What happens after a user selects a suggestion and the debounced input resolves to the selected value? The dropdown must remain closed. The system must suppress any lookup triggered solely by the selection action — the selected value populating the input must not be treated as new user-typed input for lookup purposes. The dropdown should only reopen when the user manually types new or different characters.

## Assumptions

- The zip code lookup endpoint (`/api/v1/lookup/zip-codes?search={input}&limit=5`) is already deployed, operational, and accessible from the frontend application's network context (same domain or CORS-enabled).
- The endpoint follows the response shape described in the input: `{ success, data: { zipCodes: [...], pagination }, message }`.
- Authentication/authorization for the lookup endpoint uses the same session or token mechanism already in place for other API calls in the application — no additional authentication flow is required.
- The debounce duration of 300 milliseconds is a product decision and applies uniformly to all zip code autocomplete instances.
- The trigger threshold of 2 characters is a product decision — the lookup is not fired for 0 or 1 characters.
- Only the two specific questions identified (`topWorkLocations` and `employeeLivingZipCodes`) should receive autocomplete behavior. All other STRUCTURED_ARRAY questions and all other question types remain completely unchanged.
- Selecting a zip code suggestion only populates the zip code field. It does not auto-fill the adjacent State dropdown (the user selects the state independently). This preserves the current form behavior.
- The existing zip code validation (5-digit numeric, pattern enforcement) remains in effect. The autocomplete is an input aid, not a replacement for validation.
- Pagination from the API response is not needed for the dropdown — the first page of results (up to 20 items) is sufficient for display.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide autocomplete suggestions when the user types 2 or more characters in a zip code input field for the "top 5 work locations" question (`topWorkLocations`)
- **FR-002**: System MUST provide autocomplete suggestions when the user types 2 or more characters in a zip code input field for the conditional "employee living zip codes" question (`employeeLivingZipCodes`)
- **FR-003**: System MUST display each suggestion as the zip code only (e.g., "39401")
- **FR-004**: System MUST populate the zip code field with the selected suggestion's zip code value when the user clicks a suggestion
- **FR-005**: System MUST close the suggestion dropdown immediately after the user selects a suggestion, and the dropdown MUST NOT reopen until the user manually types new characters in the input field
- **FR-006**: System MUST close the suggestion dropdown when the user clicks outside the input and dropdown area
- **FR-007**: System MUST debounce lookup requests by 300 milliseconds to prevent excessive network calls
- **FR-008**: System MUST NOT trigger a lookup request when fewer than 2 characters have been entered
- **FR-009**: System MUST display a loading indicator while a lookup request is in progress
- **FR-010**: System MUST display "No results found" when the lookup returns zero matches or encounters an error
- **FR-011**: System MUST NOT alter any existing question rendering, validation, state management, or layout for any question other than the two target zip code fields
- **FR-012**: System MUST NOT change the STRUCTURED_ARRAY add/remove row functionality
- **FR-013**: System MUST support independent autocomplete behavior per row — each zip code field in a multi-row STRUCTURED_ARRAY operates its own dropdown independently
- **FR-014**: System MUST only apply autocomplete behavior to fields designated as zip code input fields in the two target questions — not to any other STRUCTURED_ARRAY fields (e.g., state selects, text inputs in other questions)
- **FR-015**: System MUST continue to enforce existing zip code validation rules (numeric-only input, maximum 5 digits, pattern matching) alongside the new autocomplete behavior
- **FR-016**: System MUST suppress any automatic lookup request triggered solely by a suggestion selection — when a user selects a zip code from the dropdown, the resulting value change must not trigger a new round of suggestions. Only subsequent manual typing by the user should initiate new lookups.

### Key Entities

- **Zip Code Suggestion**: A single autocomplete result representing a US zip code. Key attributes: zip code (5-digit string), state name (full name), state abbreviation (2-letter code), state FIPS code.
- **Zip Code Lookup Request**: A query sent to the lookup service containing the user's partial input (2+ characters). Returns a list of Zip Code Suggestions.
- **Structured Array Row**: An existing concept in the assessment form representing one entry (e.g., one work location). Contains multiple fields including a state selector and a zip code input. Each row operates independently.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can find and select a valid zip code in under 5 seconds from the moment they start typing, without needing to know the exact zip code in advance
- **SC-002**: 95% of zip code lookups return visible suggestions within 2 seconds of the user pausing their typing
- **SC-003**: Zero regressions in existing assessment functionality — all other questions, validations, navigation, and save/submit flows continue to work identically
- **SC-004**: The number of network requests during rapid typing is reduced by at least 60% compared to a non-debounced implementation (verifiable by confirming only 1 request fires per 300ms typing burst)
- **SC-005**: Users can complete the work locations question with autocomplete assistance without encountering stale dropdowns, phantom suggestions, or UI artifacts from previous rows
