# Research: Dynamic Proven Strategy Card Content

**Branch**: `018-dynamic-card-content`  
**Date**: 2026-04-21

## Resolved Unknowns

All items resolved by direct codebase inspection. No NEEDS CLARIFICATION items remain.

---

### Decision 1: Where to resolve icon and description — config vs render time

**Decision**: Remove `titleIcon` from `ProvenCardConfig` entirely (icons always derived from flag at render time). Keep `descriptionText` in config as the default/false-state text; add an optional `descriptionTextFlagTrue` field for the flag=true override text.

**Rationale**: Icons depend entirely on the flag — they carry no card-specific identity, so the config should not store them. Descriptions are more nuanced: two cards have static text (same regardless of flag) while one card (`healthcareAffordability`) has two distinct strings. Storing the false-state text in the config keeps it co-located with the card's identity; the optional override makes the flag=true variant explicit, visible, and type-safe without special-casing inside the render.

**Alternatives considered**:

- Store both description strings `descriptionTextFalse` + `descriptionTextTrue` for all cards → rejected: forces empty strings for the two static cards, misleading structure.
- Derive all description and icon logic inline with no config fields → rejected: buries non-obvious string payloads in JSX, harder to read and maintain.
- Special-case `healthcareAffordability` by id inside the `.map()` → rejected: id-based branching in render is fragile and unclear.

---

### Decision 2: Interface shape — `ProvenCardConfig` after change

**Decision**:

```typescript
interface ProvenCardConfig {
  id: string;
  title: string;
  descriptionText: string; // default / flag=false text
  descriptionTextFlagTrue?: string; // flag=true override (only healthcareAffordability)
}
```

The `titleIcon: ComponentType<...>` field and `import type { ComponentType }` are removed.

**Rationale**: Minimal interface — describes only data that varies per card. Optional field signals clearly that most cards don't use it.

---

### Decision 3: Render expression

**Decision**: At render time inside `.map()`:

```tsx
titleIcon={
  provenStrategyFlags[card.id as keyof typeof provenStrategyFlags]
    ? <LikeIcon />
    : <UserGroupIcon />
}
descriptionText={
  provenStrategyFlags[card.id as keyof typeof provenStrategyFlags] && card.descriptionTextFlagTrue
    ? card.descriptionTextFlagTrue
    : card.descriptionText
}
```

**Rationale**: Single ternary per attribute; falsy default for both undefined flags and absent `descriptionTextFlagTrue`. Keeps `.map()` self-contained without pulling in id checks.

---

### Decision 4: Test selectors — icon `data-testid`

**Decision**: Add `data-testid="like-icon"` to the root `<span>` in `LikeIcon`, and `data-testid="user-group-icon"` to the root `<span>` in `UserGroupIcon`. Assert description text via `screen.getByText(...)`.

**Rationale**: Both icon files currently render only `<span className="custom-icon">` with no distinguishing test attribute. Adding `data-testid` is the minimal, stable selector strategy. Description text is naturally assertable via RTL's `getByText`.

**Alternatives considered**:

- Wrap icons in `<span data-testid="...">` at the call site → rejected: pollutes every usage of the icon components.
- Assert on SVG fill colors → rejected: brittle, not semantic.

---

### Decision 5: Test file location

**Decision**: New file `tests/pages/CoreBenefitsEnhancement.test.tsx`. No existing test file for this component.

**Rationale**: `tests/pages/` is the established location for page-level component tests (e.g., `RecommendationsPage.test.tsx`).

---

### Decision 6: `import type { ComponentType }` removal

**Decision**: Remove the `import type { ComponentType } from "react"` statement — it is only needed for the `titleIcon: ComponentType<...>` field that is being removed.

---

## Summary Table

| Unknown                         | Resolution                                                 | Confidence |
| ------------------------------- | ---------------------------------------------------------- | ---------- |
| Icon resolution location        | Render-time ternary, removed from config                   | High       |
| Description resolution approach | Config stores default + optional flag-true override        | High       |
| Interface shape                 | Remove `titleIcon`; add optional `descriptionTextFlagTrue` | High       |
| Icon test selector strategy     | `data-testid` on root `<span>` of each icon component      | High       |
| Description test strategy       | `screen.getByText(...)` from RTL                           | High       |
| Test file location              | `tests/pages/CoreBenefitsEnhancement.test.tsx`             | High       |
| `ComponentType` import          | Remove — no longer needed                                  | High       |
