# Data Model: Dynamic Industry Lookup Integration

**Date**: 2026-02-10  
**Feature**: [spec.md](./spec.md) | [plan.md](./plan.md) | [research.md](./research.md)

## Overview

This feature introduces minimal data model changes, primarily adapting existing `Industry` interface to accommodate API-driven data structure.

## Entities

### Industry

**Description**: Represents a business industry classification that users can select during registration. Previously sourced from local constant, now sourced from backend API.

**Source**: Backend industry lookup service via `/industry/lookup` endpoint

**Lifecycle**: Fetched on registration form mount, stored in component state for session duration

#### Fields

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| `id` | number | Yes | Unique numeric identifier for the industry | Positive integer |
| `name` | string | Yes | Human-readable industry name displayed in dropdown | Non-empty string |

#### TypeScript Interface

```typescript
export interface Industry {
  id: number;
  name: string;
}
```

#### Relationships

- **Used by**: RegistrationForm component (dropdown option source)
- **Referenced in**: RegistrationData (user's selected industry submitted to backend)
- **No persistence**: Lives only in component state during form session

#### State Transitions

```
[Unloaded] → [Loading] → [Loaded] | [Error]
                ↓
          API Request
                ↓
        Success or Failure
```

1. **Unloaded**: Initial state when component mounts
2. **Loading**: API request in flight, spinner displayed
3. **Loaded**: Industries successfully fetched and displayed in dropdown
4. **Error**: API request failed (network, empty array, timeout) - error message shown

---

## Modified Entities

### IndustryOption (DEPRECATED)

**Current Definition** (in `src/constants/formOptions.ts`):
```typescript
export interface IndustryOption {
  id: string;  // Note: Currently string, API returns number
  label: string;
  supportingText?: string;
  isDisabled?: boolean;
  icon?: React.FC | React.ReactNode;
  avatarUrl?: string;
}
```

**Changes Required**:
- ⚠️ **Incompatible**: Current interface uses `id: string` and `label: string`, but API returns `id: number` and `name: string`
- **Migration path**: Update RegistrationForm to map API response to dropdown format

**Mapping Strategy**:
```typescript
const industryOptions = industries.map(industry => ({
  id: industry.id.toString(), // Convert number to string for dropdown value
  label: industry.name,
  // Optional fields not used - dropdown doesn't require them
}));
```

---

### RegistrationData

**Current Definition** (in `src/types/auth.ts`):
```typescript
export interface RegistrationData {
  firstName: string;
  lastName: string;
  businessName: string;
  businessEmail: string;
  businessPhone: string;
  industry: string;  // Currently stores industry id as string
  zipCode: string;
  password: string;
}
```

**Changes Required**:
- **No changes needed**: Form submission still sends `industry` as string (dropdown value)
- API receives industry identifier in whatever format backend expects
- Existing type remains compatible

---

## Component State Model

### IndustryFetchState

New state structure within RegistrationForm component:

```typescript
interface IndustryFetchState {
  industries: Industry[];           // Array of industry objects from API
  isLoadingIndustries: boolean;     // True during API request
  industryError: string | null;     // Error message if fetch fails
}
```

**State Flow**:

```typescript
// Initial state
{
  industries: [],
  isLoadingIndustries: true,
  industryError: null
}

// After successful fetch
{
  industries: [{id: 1, name: "Technology"}, ...],
  isLoadingIndustries: false,
  industryError: null
}

// After failed fetch
{
  industries: [],
  isLoadingIndustries: false,
  industryError: "Failed to load industries. Please try again."
}
```

---

## Data Validation

### Client-Side

**Industry Selection Validation** (existing):
- Required field validation via Zod schema
- Enforced by React Hook Form
- No changes to existing validation logic

**API Response Validation** (new):
```typescript
// Validate non-empty array
if (!Array.isArray(data) || data.length === 0) {
  throw new Error("No industries available");
}

// Validate structure (TypeScript provides compile-time checking)
// Runtime validation could be added via Zod if needed:
const IndustrySchema = z.object({
  id: z.number().positive(),
  name: z.string().min(1)
});
```

---

## Constraints

1. **No Caching**: Industries fetched fresh on each form load - no localStorage or session persistence
2. **No Sorting**: Display industries in the order returned by API (backend controls sort order)
3. **No Filtering**: No client-side search/filter functionality (out of scope)
4. **Session-Only**: Industry data exists only during component lifecycle, cleared on unmount

---

## Migration Notes

### Breaking Changes
None - industry selection field behavior remains unchanged from user perspective

### Backward Compatibility
- Existing form submission format unchanged
- Validation rules unchanged
- Visual presentation unchanged

### Data Migration
Not applicable - no persisted data to migrate
