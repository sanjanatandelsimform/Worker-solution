# API Contract: Industry Lookup

**Endpoint**: `/industry/lookup`  
**Method**: `GET`  
**Purpose**: Retrieve list of available industries for registration form dropdown

## Request

### HTTP Method
`GET`

### URL
```
GET /industry/lookup
```

### Headers

| Header | Value | Required | Description |
|--------|-------|----------|-------------|
| `Content-Type` | `application/json` | Yes | Response format |
| `Cookie` | Session cookies | No | May be required for auth (TBD by backend) |

### Query Parameters
None

### Request Body
None (GET request)

### Authentication
- **Type**: TBD (may use existing session-based auth from authApi.ts)
- **Assumption**: Industry lookup endpoint is publicly accessible or uses same auth as signup endpoint
- **Fallback**: If auth required, will be handled automatically by existing axios interceptors

---

## Response

### Success Response (200 OK)

#### Status Code
`200 OK`

#### Response Body

**Type**: `application/json`

**Schema**:
```json
[
  {
    "id": 1,
    "name": "Technology"
  },
  {
    "id": 2,
    "name": "Healthcare"
  }
]
```

**TypeScript Type**:
```typescript
type IndustryLookupResponse = Industry[];

interface Industry {
  id: number;
  name: string;
}
```

#### Field Specifications

| Field | Type | Required | Constraints | Description |
|-------|------|----------|------------|-------------|
| `id` | number | Yes | Positive integer, unique | Unique identifier for the industry |
| `name` | string | Yes | Non-empty, 1-100 chars | Display name for the industry |

#### Example Response

```json
[
  { "id": 1, "name": "Technology" },
  { "id": 2, "name": "Healthcare" },
  { "id": 3, "name": "Finance" },
  { "id": 4, "name": "Retail" },
  { "id": 5, "name": "Manufacturing" },
  { "id": 6, "name": "Education" },
  { "id": 7, "name": "Hospitality" },
  { "id": 8, "name": "Construction" },
  { "id": 9, "name": "Transportation" },
  { "id": 10, "name": "Other" }
]
```

---

### Error Responses

#### 500 Internal Server Error

```json
{
  "message": "Failed to retrieve industries",
  "error": "InternalServerError"
}
```

#### 503 Service Unavailable

```json
{
  "message": "Service temporarily unavailable",
  "error": "ServiceUnavailable"
}
```

#### Client-Side Timeout

After 10 seconds (axios client timeout):
- No response from server
- Client displays: "Request timed out. Please try again."

---

## Client Integration

### Function Signature

```typescript
/**
 * Fetch list of available industries for registration form
 * @returns Promise resolving to array of Industry objects
 * @throws Error with user-friendly message on failure
 */
export const getIndustries = async (): Promise<Industry[]> => {
  try {
    const response = await apiClient.get<Industry[]>('/industry/lookup');
    
    // Validate non-empty response (per clarification #4)
    if (!response.data || response.data.length === 0) {
      throw new Error('No industries available. Please try again later.');
    }
    
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};
```

### Usage Example

```typescript
import { getIndustries } from '@/services/api/authApi';

// In RegistrationForm component
useEffect(() => {
  const fetchIndustries = async () => {
    setIsLoadingIndustries(true);
    setIndustryError(null);
    
    try {
      const data = await getIndustries();
      setIndustries(data);
    } catch (error) {
      setIndustryError(error.message);
    } finally {
      setIsLoadingIndustries(false);
    }
  };
  
  fetchIndustries();
}, []);
```

---

## Error Handling

### Client-Side Error Scenarios

| Scenario | Detection | User Message | Recovery |
|----------|-----------|--------------|----------|
| Network failure | axios error with no response | "Unable to connect. Check your internet connection." | Refresh page to retry |
| API timeout | axios ECONNABORTED | "Request timed out. Please try again." | Refresh page to retry |
| Empty array | response.data.length === 0 | "No industries available. Please try again later." | Contact support if persists |
| Malformed response | Type mismatch (TypeScript) | "An unexpected error occurred. Please try again." | Report to dev team |
| Server error (500) | response.status === 500 | API error message or generic fallback | Refresh page to retry |

### Error Message Mapping

```typescript
const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const apiError = error.response?.data as ApiError | undefined;
    
    // Use backend error message if available
    if (apiError?.message) {
      return apiError.message;
    }
    
    // Map common error codes
    if (error.code === 'ECONNABORTED') {
      return 'Request timed out. Please try again.';
    }
    
    if (!error.response) {
      return 'Unable to connect. Check your internet connection.';
    }
    
    // Generic fallback
    if (error.message) {
      return error.message;
    }
  }
  
  return 'An unexpected error occurred. Please try again.';
};
```

---

## Performance Considerations

### Expected Response Time
- **Target**: < 2 seconds under normal conditions
- **Timeout**: 10 seconds (client-side)
- **Size**: ~500 bytes for 10 industries (negligible)

### Caching Strategy
- **None**: Fresh fetch on every form load
- **Rationale**: Industry list is small, frequently accessed is minimal, simplicity preferred

### Rate Limiting
- Not applicable (assumes no rate limiting on lookup endpoint)
- If added: client should handle 429 responses gracefully

---

## Assumptions

1. Endpoint is available and operational before feature deployment
2. Response structure matches specification exactly (no additional fields required)
3. Backend controls sort order (alphabetical or by popularity)
4. No pagination needed (industry list is small and stable)
5. Authentication handled by existing interceptors or endpoint is public
6. Industry IDs are stable (no deletions or reassignments)

---

## Testing

### Contract Tests

```typescript
describe('GET /industry/lookup', () => {
  it('returns 200 with array of industries', async () => {
    const response = await apiClient.get('/industry/lookup');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBe(true);
    expect(response.data.length).toBeGreaterThan(0);
  });
  
  it('each industry has required fields', async () => {
    const response = await apiClient.get('/industry/lookup');
    response.data.forEach((industry: any) => {
      expect(typeof industry.id).toBe('number');
      expect(typeof industry.name).toBe('string');
      expect(industry.name.length).toBeGreaterThan(0);
    });
  });
  
  it('handles timeout gracefully', async () => {
    // Mock slow response exceeding 10s timeout
    // Expect error to be caught and user-friendly message returned
  });
});
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-02-10 | Initial contract definition |
