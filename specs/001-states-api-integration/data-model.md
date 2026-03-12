# Data Model: States Lookup API Integration

**Feature**: 001-states-api-integration  
**Date**: 11 March 2026

## Entities

### StateOptionApi (API response shape)

The raw shape returned by `GET /api/v1/lookup/states`.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `stateAbbreviation` | `string` | Yes | 2-letter US state abbreviation (e.g., `"NY"`) |
| `stateName` | `string` | Yes | Full state name (e.g., `"New York"`) |

**Validation**: Entries missing either field are silently skipped during transformation (FR-011).

### StateOptionComponent (Component shape)

The transformed shape consumed by question renderers. Matches the existing `QuestionField.options` type.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes | Mapped from `stateAbbreviation` |
| `label` | `string` | Yes | Mapped from `stateName` |

### StatesLookupResponse (API envelope)

The full response payload from the states lookup endpoint.

```
{
  "data": {
    "states": StateOptionApi[]
  }
}
```

## Relationships

```
StatesLookupResponse
  └── data.states: StateOptionApi[]
        ↓ (transform: FR-004)
      StateOptionComponent[]
        ↓ (injected into)
      QuestionField.options (for "state" fields in topWorkLocations & employeeLivingZipCodes)
```

## State Transitions

### States Fetch Lifecycle

```
IDLE → LOADING → SUCCESS | ERROR

States:
  IDLE      — Initial state before WorkforceTab mounts
  LOADING   — API call in-flight; state selects show "Loading states..." (disabled)
  SUCCESS   — Valid options received (≥1 entry); selects populated and enabled
  ERROR     — API failed, returned empty array, or all entries malformed;
              selects show "state options unavailable"
```

### Transition Rules

| From | To | Trigger | Side Effect |
|------|----|---------|-------------|
| IDLE | LOADING | WorkforceTab mounts | Fetch initiated; selects disabled |
| LOADING | SUCCESS | API returns ≥1 valid entry | Options injected into questions |
| LOADING | ERROR | API fails / empty array / all entries malformed | Error indication shown |

## Existing Entities (Unchanged)

### QuestionField (from `questionTypes.ts`)

```typescript
interface QuestionField {
  name: string;
  label: string;
  placeholder: string;
  type: string;
  required: boolean;
  width: string;
  options?: Array<{ id: string; label: string }>;
}
```

**No changes** to this interface. The `options` array is populated at runtime
from the API response instead of from static JSON.

### Question (from `questionTypes.ts`)

**No changes.** The `Question` interface and its `conditionalQuestion` nesting
are consumed as-is. The only runtime difference is the contents of
`validationRules.fields[0].options` for the two target questions.

## Option Injection Paths

| Question Key | JSON Path to State Options |
|---|---|
| `topWorkLocations` | `question.validationRules.fields[0].options` |
| `employeeLivingZipCodes` | `question.conditionalQuestion.question.validationRules.fields[0].options` |

Both paths target `fields[0]` where `fields[0].name === "state"` and
`fields[0].type === "select"`.
