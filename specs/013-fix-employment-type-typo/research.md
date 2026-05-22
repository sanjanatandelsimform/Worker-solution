# Research: Fix `employmentType` Typo in Workforce API

**Feature**: `013-fix-employment-type-typo`  
**Date**: 2026-04-16  
**Status**: Complete — no unknowns remain

---

## Context

Feature 009 (`009-workforce-tab-api`) introduced the `employementType` misspelling intentionally to mirror the backend schema at the time. The original decision was documented in `specs/009-workforce-tab-api/research.md` (Decision 10) and `specs/009-workforce-tab-api/data-model.md`. This feature corrects the spelling now that the backend contract is being updated.

---

## Decision 1: Rename Strategy — In-Place Find-and-Replace vs. TypeScript Rename Symbol

**Decision**: Use direct in-place string replacement in each affected file. No automated rename-symbol refactoring required.

**Rationale**: The misspelling appears only in 7 src locations and 4 test locations — all within a single bounded domain (`workforce`). TypeScript's rename-symbol would work, but given the small, enumerable scope, direct replacement is faster, fully auditable, and carries no risk of touching unintended uses.

**Alternatives considered**:

- TypeScript language-server rename: valid but unnecessary overhead for 11 locations.
- Regex-based sed/replace across entire repo: higher blast radius than needed; spec files under `specs/009-*` are intentionally excluded.

---

## Decision 2: Scope — `src/` and `tests/` Only; Spec Docs Excluded

**Decision**: Rename only inside `src/` and `tests/`. Leave `specs/009-workforce-tab-api/` files unchanged.

**Rationale**: The spec docs for feature 009 are historical record of the original decision and intentional misspelling. Changing them would rewrite history without adding value. The `specs/013-*/` files are authored fresh with the corrected spelling.

**Alternatives considered**:

- Update all docs globally: unnecessary churn; no developer depends on those docs for code navigation.

---

## Decision 3: `@note` Comment Removal in `workforceTypes.ts`

**Decision**: Remove the JSDoc `@note "employementType" spelling intentionally mirrors the backend schema typo.` comment from the `Demographics` interface.

**Rationale**: Once the field is correctly spelled, the note is misleading. The `@note` was the only place documenting the original intentional behaviour, and that context is preserved in `specs/009-*`.

**Alternatives considered**:

- Replace with a new note explaining the correction: adds noise; the corrected field name is self-documenting.

---

## Decision 4: JSDoc Update in `workforceSelectors.ts`

**Decision**: Update the JSDoc comment on `selectDemographicsSection` from:

> `Contains employementType (note: intentional typo matching backend schema), gender, age breakdown.`

to:

> `Contains employmentType, gender, age breakdown.`

**Rationale**: The parenthetical note was load-bearing context for the original misspelling decision. Once corrected, it is inaccurate and should be removed along with the field name fix.

---

## Decision 5: No New Files; No New Interfaces

**Decision**: `EmploymentTypeEntry` interface is unchanged. No new types or files are introduced.

**Rationale**: This feature is a pure rename. The shape of the data (`EmploymentTypeEntry`) remains identical; only the field name on the parent `Demographics` interface changes. Adding new abstractions would violate the constitution's principle against over-engineering.

---

## Summary of All NEEDS CLARIFICATION Items

None — this feature had no unknowns. All affected files were identified by full-codebase grep before planning began (11 occurrences; 7 in `src/`, 4 in `tests/`).
