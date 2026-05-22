# States Lookup API Contract

**Feature**: 001-states-api-integration  
**Date**: 11 March 2026

## GET /api/v1/lookup/states

Retrieve the list of US states available for workforce assessment questions.

### Request

```
GET /api/v1/lookup/states
Authorization: Bearer <token>
Content-Type: application/json
```

**Parameters**: None  
**Body**: None

### Response — 200 OK (Success)

```json
{
  "data": {
    "states": [
      {
        "stateAbbreviation": "AL",
        "stateName": "Alabama"
      },
      {
        "stateAbbreviation": "AK",
        "stateName": "Alaska"
      },
      {
        "stateAbbreviation": "NY",
        "stateName": "New York"
      }
    ]
  }
}
```

### Response — 200 OK (Empty Array)

```json
{
  "data": {
    "states": []
  }
}
```

**Client handling**: Treated the same as an error per FR-008 — display "state
options unavailable" on the two affected dropdowns.

### Response — 401 Unauthorized

```json
{
  "error": "Unauthorized",
  "message": "Invalid or expired token"
}
```

**Client handling**: Interceptor triggers token refresh (existing axios
interceptor pattern in `assessmentApi.ts`). On retry failure, treated as API error.

### Response — 500 Internal Server Error

```json
{
  "error": "Internal Server Error",
  "message": "Something went wrong"
}
```

**Client handling**: Treated as API error — display "state options unavailable"
on the two affected dropdowns. Other questions remain fully functional.

---

## Client-Side Transformation Contract

### Input (API shape)

```typescript
interface StateOptionApi {
  stateAbbreviation: string;
  stateName: string;
}

interface StatesLookupResponse {
  data: {
    states: StateOptionApi[];
  };
}
```

### Output (Component shape)

```typescript
interface StateOptionComponent {
  id: string;   // ← stateAbbreviation
  label: string; // ← stateName
}
```

### Transformation Rules

1. Filter: Skip entries where `stateAbbreviation` or `stateName` is falsy (FR-011).
2. Map: `{ id: entry.stateAbbreviation, label: entry.stateName }` (FR-004).
3. If resulting array is empty → treat as error (FR-008).

### Pseudo-implementation

```
function transformStates(apiStates: unknown[]): StateOptionComponent[] {
  return apiStates
    .filter(entry => entry.stateAbbreviation && entry.stateName)
    .map(entry => ({ id: entry.stateAbbreviation, label: entry.stateName }));
}
```
