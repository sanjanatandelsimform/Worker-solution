# Data Model: Dynamic Proven Strategy Card Content

**Branch**: `018-dynamic-card-content`  
**Date**: 2026-04-21

## Overview

Pure UI rendering change. No new entities, no new state, no API changes. The impact is:

1. `ProvenCardConfig` interface is simplified (one field removed, one field added).
2. Three static config entries updated (remove `titleIcon`, add `descriptionTextFlagTrue` for one card).
3. Render expression in the `.map()` callback updated for `titleIcon` and `descriptionText`.

---

## Modified Interface: `ProvenCardConfig`

Located in `src/pages/recommendations/CoreBenefitsEnhancement.tsx`.

### Before

```typescript
interface ProvenCardConfig {
  id: string;
  title: string;
  titleIcon: ComponentType<{ className?: string }>; // ← REMOVE
  descriptionText?: string;
}
```

### After

```typescript
interface ProvenCardConfig {
  id: string;
  title: string;
  descriptionText: string; // default / flag=false text (now required, not optional)
  descriptionTextFlagTrue?: string; // flag=true override — only used by healthcareAffordability
}
```

**Changes**:

- `titleIcon` removed — icon is always derived from flag at render time
- `descriptionText` made required (was optional; all three cards have a value)
- `descriptionTextFlagTrue` added as optional — only `healthcareAffordability` sets it

---

## Updated Static Config: `provenStrategiesCardsConfig`

### Before → After

| Card                      | `titleIcon`            | `descriptionText` change                 | `descriptionTextFlagTrue`                                                                                                                                             |
| ------------------------- | ---------------------- | ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `nonElectiveMatch`        | Remove `LikeIcon`      | Unchanged                                | Not set                                                                                                                                                               |
| `autoEnroll`              | Remove `LikeIcon`      | Unchanged                                | Not set                                                                                                                                                               |
| `healthcareAffordability` | Remove `UserGroupIcon` | Unchanged (becomes the false-state text) | `"Your employee-only premium contribution to earnings average is below 11%, which is a positive indicator of healthcare affordability. (IRS affordability is 9.96%)"` |

---

## Existing Interface: `ProvenStrategyFlags` (unchanged)

```typescript
interface ProvenStrategyFlags {
  nonElectiveMatch: boolean;
  autoEnroll: boolean;
  healthcareAffordability: boolean;
}
```

Runtime source of truth for all card display state. No changes.

---

## Render-time Resolution (`.map()` callback)

### Icon

| Flag value  | Icon rendered                       |
| ----------- | ----------------------------------- |
| `true`      | `<LikeIcon />`                      |
| `false`     | `<UserGroupIcon />`                 |
| `undefined` | `<UserGroupIcon />` (falsy default) |

### Description

| Card                      | Flag                  | Description shown               |
| ------------------------- | --------------------- | ------------------------------- |
| `nonElectiveMatch`        | any                   | Static `descriptionText` always |
| `autoEnroll`              | any                   | Static `descriptionText` always |
| `healthcareAffordability` | `true`                | `descriptionTextFlagTrue`       |
| `healthcareAffordability` | `false` / `undefined` | `descriptionText`               |

---

## Files Changed

| File                                                    | Change type                                          |
| ------------------------------------------------------- | ---------------------------------------------------- |
| `src/assets/icons/likeIcon.tsx`                         | Add `data-testid="like-icon"` to root `<span>`       |
| `src/assets/icons/UserGroupIcon.tsx`                    | Add `data-testid="user-group-icon"` to root `<span>` |
| `src/pages/recommendations/CoreBenefitsEnhancement.tsx` | Modify interface, config, render                     |
| `tests/pages/CoreBenefitsEnhancement.test.tsx`          | Create — TDD tests                                   |
