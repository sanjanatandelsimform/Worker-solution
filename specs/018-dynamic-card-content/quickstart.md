# Quickstart: Dynamic Proven Strategy Card Content

**Branch**: `018-dynamic-card-content`  
**Date**: 2026-04-21

## What changes and why — in 60 seconds

Three proven-strategy cards in `CoreBenefitsEnhancement.tsx` need two display attributes driven by the runtime `provenStrategyFlags` prop (in addition to the existing background color that already works):

1. **`titleIcon`** — currently hardcoded in the static config. Now: `flag=true → LikeIcon`, `flag=false → UserGroupIcon`, for all 3 cards.
2. **`descriptionText`** — `nonElectiveMatch` and `autoEnroll` keep their existing static text forever. `healthcareAffordability` gets a different text depending on its flag.

The fix: remove `titleIcon` from the config; add optional `descriptionTextFlagTrue` to the config for the one card that needs it; resolve both attributes at render time in the `.map()`.

---

## Files to touch (in order)

| Step | File                                                    | Action                              |
| ---- | ------------------------------------------------------- | ----------------------------------- |
| 1    | `src/assets/icons/likeIcon.tsx`                         | Add `data-testid="like-icon"`       |
| 2    | `src/assets/icons/UserGroupIcon.tsx`                    | Add `data-testid="user-group-icon"` |
| 3    | `tests/pages/CoreBenefitsEnhancement.test.tsx`          | CREATE — write failing tests (TDD)  |
| 4    | `src/pages/recommendations/CoreBenefitsEnhancement.tsx` | Implement — make tests pass         |

---

## Step-by-step

### Step 1 — Add `data-testid` to `LikeIcon`

`src/assets/icons/likeIcon.tsx`:

```tsx
// Before
<span className={`custom-icon ${className ?? ""}`}>

// After
<span data-testid="like-icon" className={`custom-icon ${className ?? ""}`}>
```

### Step 2 — Add `data-testid` to `UserGroupIcon`

`src/assets/icons/UserGroupIcon.tsx`:

```tsx
// Before
<span className={`custom-icon ${className ?? ""}`}>

// After
<span data-testid="user-group-icon" className={`custom-icon ${className ?? ""}`}>
```

### Step 3 — Write the failing tests (TDD — MUST fail before Step 4)

Create `tests/pages/CoreBenefitsEnhancement.test.tsx`:

```typescript
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import CoreBenefitsEnhancement from "@/pages/recommendations/CoreBenefitsEnhancement";

const defaultProps = {
  isLoading: false,
  provenStrategiesCount: 0,
  provenStrategiesPercent: 0,
  provenStrategyFlags: {
    nonElectiveMatch: false,
    autoEnroll: false,
    healthcareAffordability: false,
  },
};

describe("CoreBenefitsEnhancement — icon per flag", () => {
  it("shows UserGroupIcon for all cards when all flags are false", () => {
    const { container } = render(<CoreBenefitsEnhancement {...defaultProps} />);
    expect(container.querySelectorAll('[data-testid="user-group-icon"]')).toHaveLength(3);
    expect(container.querySelectorAll('[data-testid="like-icon"]')).toHaveLength(0);
  });

  it("shows LikeIcon for all cards when all flags are true", () => {
    const { container } = render(
      <CoreBenefitsEnhancement
        {...defaultProps}
        provenStrategyFlags={{ nonElectiveMatch: true, autoEnroll: true, healthcareAffordability: true }}
      />
    );
    expect(container.querySelectorAll('[data-testid="like-icon"]')).toHaveLength(3);
    expect(container.querySelectorAll('[data-testid="user-group-icon"]')).toHaveLength(0);
  });

  it("shows correct icons for mixed flags", () => {
    const { container } = render(
      <CoreBenefitsEnhancement
        {...defaultProps}
        provenStrategyFlags={{ nonElectiveMatch: true, autoEnroll: false, healthcareAffordability: false }}
      />
    );
    expect(container.querySelectorAll('[data-testid="like-icon"]')).toHaveLength(1);
    expect(container.querySelectorAll('[data-testid="user-group-icon"]')).toHaveLength(2);
  });
});

describe("CoreBenefitsEnhancement — description per flag", () => {
  it("shows static description for nonElectiveMatch regardless of flag", () => {
    const staticDesc = "Employer contributions are often skewed due to high earners's contribution capacity. Separate the employee contribution from employer contribution.";
    const { rerender } = render(<CoreBenefitsEnhancement {...defaultProps} />);
    expect(screen.getByText(staticDesc)).toBeInTheDocument();

    rerender(
      <CoreBenefitsEnhancement
        {...defaultProps}
        provenStrategyFlags={{ ...defaultProps.provenStrategyFlags, nonElectiveMatch: true }}
      />
    );
    expect(screen.getByText(staticDesc)).toBeInTheDocument();
  });

  it("shows static description for autoEnroll regardless of flag", () => {
    const staticDesc = "80% of employees automatically enrolled in a 3% 401K match stay within the retirement plan.";
    const { rerender } = render(<CoreBenefitsEnhancement {...defaultProps} />);
    expect(screen.getByText(staticDesc)).toBeInTheDocument();

    rerender(
      <CoreBenefitsEnhancement
        {...defaultProps}
        provenStrategyFlags={{ ...defaultProps.provenStrategyFlags, autoEnroll: true }}
      />
    );
    expect(screen.getByText(staticDesc)).toBeInTheDocument();
  });

  it("shows flag=false description for healthcareAffordability when flag is false", () => {
    render(<CoreBenefitsEnhancement {...defaultProps} />);
    expect(
      screen.getByText(
        "Consider adjusting employee premiums to income level. QSEHRA and ICHRA plans can offer more flexibility and savings for employers and employees."
      )
    ).toBeInTheDocument();
  });

  it("shows flag=true description for healthcareAffordability when flag is true", () => {
    render(
      <CoreBenefitsEnhancement
        {...defaultProps}
        provenStrategyFlags={{ ...defaultProps.provenStrategyFlags, healthcareAffordability: true }}
      />
    );
    expect(
      screen.getByText(
        "Your employee-only premium contribution to earnings average is below 11%, which is a positive indicator of healthcare affordability. (IRS affordability is 9.96%)"
      )
    ).toBeInTheDocument();
  });
});
```

### Step 4 — Implement in `CoreBenefitsEnhancement.tsx`

**4a. Remove unused import:**

```tsx
// Remove this line:
import type { ComponentType } from "react";
```

**4b. Update `ProvenCardConfig` interface:**

```typescript
interface ProvenCardConfig {
  id: string;
  title: string;
  descriptionText: string;
  descriptionTextFlagTrue?: string;
}
```

**4c. Update `provenStrategiesCardsConfig` — remove all `titleIcon`, add `descriptionTextFlagTrue` to healthcareAffordability:**

```typescript
const provenStrategiesCardsConfig: ProvenCardConfig[] = [
  {
    id: "nonElectiveMatch",
    title: "Non-elective match",
    descriptionText:
      "Employer contributions are often skewed due to high earners's contribution capacity. Separate the employee contribution from employer contribution.",
  },
  {
    id: "autoEnroll",
    title: "Auto Enrollment",
    descriptionText:
      "80% of employees automatically enrolled in a 3% 401K match stay within the retirement plan.",
  },
  {
    id: "healthcareAffordability",
    title: "Healthcare affordability",
    descriptionText:
      "Consider adjusting employee premiums to income level. QSEHRA and ICHRA plans can offer more flexibility and savings for employers and employees.",
    descriptionTextFlagTrue:
      "Your employee-only premium contribution to earnings average is below 11%, which is a positive indicator of healthcare affordability. (IRS affordability is 9.96%)",
  },
];
```

**4d. Update the `.map()` render:**

```tsx
{
  provenStrategiesCardsConfig.map(card => {
    const flag = provenStrategyFlags[card.id as keyof typeof provenStrategyFlags];
    return (
      <ProvenStrategiesCard
        key={card.id}
        title={card.title}
        titleIcon={flag ? <LikeIcon /> : <UserGroupIcon />}
        descriptionText={
          flag && card.descriptionTextFlagTrue ? card.descriptionTextFlagTrue : card.descriptionText
        }
        className={flag ? "bg-ws-success-25" : "bg-ws-warning-50"}
      />
    );
  });
}
```

---

## Quality gate

```bash
pnpm run type-check   # must pass — no TS errors
pnpm lint:fix         # ESLint auto-fix
pnpm format           # Prettier
npx vitest run tests/pages/CoreBenefitsEnhancement.test.tsx   # 7 tests must pass
```
