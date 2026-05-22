# API Contract: Assessment Data Persistence

**Feature**: 004-assessment-api-persistence  
**Date**: 2026-02-13  
**Status**: Phase 1 Design

## Overview

This document defines the API contracts for assessment data persistence. The system uses REST endpoints for retrieving and submitting assessment data across four tabs: workforce, compensation, benefits, and goals.

## Base Configuration

**Base URL**: Inherited from application configuration (axios baseURL)  
**Authentication**: Bearer token (assumed handled by axios interceptors)  
**Content-Type**: application/json  
**Error Format**: Standardized across all endpoints

---

## Endpoint 1: Get Assessment Data

Retrieves previously submitted assessment data for all sections.

### Request

```
GET /assessment
```

**Headers**:
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Query Parameters**: None

**Request Body**: None

### Response (Success)

**Status Code**: 200 OK

**Body**:
```json
{
  "success": true,
  "data": {
    "id": "assessment-uuid-123",
    "userId": "user-uuid-456",
    "createdAt": "2026-02-13T10:00:00Z",
    "updatedAt": "2026-02-13T11:30:00Z",
    "status": "in_progress",
    "sections": {
      "workforce": {
        "full_time_employees": 25,
        "part_time_employees": 10,
        "contractors": [
          { "id": 1, "type": "Independent", "count": 5 },
          { "id": 2, "type": "Agency", "count": 3 }
        ],
        "industries": ["Technology", "Healthcare"]
      },
      "compensation": {
        "min_wage": 15.00,
        "max_wage": 75.00,
        "benefits_offered": ["Health", "Dental", "401k"]
      },
      "benefits": {
        "health_insurance_participation": {
          "eligible": 30,
          "participating": 25
        }
      },
      "goals": {
        "priority_rankings": {
          "rankedItems": ["improve_retention", "increase_wages", "add_benefits"]
        }
      }
    },
    "completionPercentage": 75
  }
}
```

**Field Definitions**:
- `success`: Boolean indicating API call succeeded
- `data.id`: Unique assessment identifier
- `data.userId`: User who owns this assessment
- `data.createdAt`/`updatedAt`: ISO 8601 timestamps
- `data.status`: "in_progress" | "completed"
- `data.sections`: Object containing submitted section data
  - `workforce`: WorkforceSection (may be null/undefined if not submitted)
  - `compensation`: CompensationSection (may be null/undefined if not submitted)
  - `benefits`: BenefitsSection (may be null/undefined if not submitted)
  - `goals`: GoalsSection (may be null/undefined if not submitted)
- `data.completionPercentage`: 0-100 integer

### Response (Error - Not Found)

**Status Code**: 404 Not Found

**Body**:
```json
{
  "success": false,
  "error": "Assessment not found for this user",
  "code": "ASSESSMENT_NOT_FOUND"
}
```

**Client Behavior**: Treat as empty assessment, start fresh from workforce tab

### Response (Error - Server Error)

**Status Code**: 500 Internal Server Error

**Body**:
```json
{
  "success": false,
  "error": "Unable to retrieve assessment data",
  "code": "SERVER_ERROR"
}
```

**Client Behavior**: Display error message with Retry button (FR-033-FR-035)

### Response (Error - Timeout)

**Status Code**: 408 Request Timeout

**Body**:
```json
{
  "success": false,
  "error": "Request timed out. Please try again.",
  "code": "TIMEOUT"
}
```

**Client Behavior**: Display error message with Retry button (FR-033-FR-035)

---

## Endpoint 2: Submit Workforce Section

Submits workforce tab data and advances to compensation tab.

### Request

```
POST /assessment/workforce
```

**Headers**:
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body**:
```json
{
  "full_time_employees": 25,
  "part_time_employees": 10,
  "contractors": [
    { "id": 1, "type": "Independent", "count": 5 },
    { "id": 2, "type": "Agency", "count": 3 }
  ],
  "industries": ["Technology", "Healthcare"],
  "turnover_rate": 15.5,
  "hiring_plan": "expand"
}
```

**Validation** (Server-Side):
- Required fields validated per question configuration
- Field types validated (string, number, array)
- STRUCTURED_ARRAY items validated for required subfields
- Ranges validated (e.g., turnover_rate 0-100)

### Response (Success)

**Status Code**: 200 OK

**Body**:
```json
{
  "success": true,
  "data": {
    "sectionId": "workforce",
    "assessmentId": "assessment-uuid-123",
    "submittedAt": "2026-02-13T11:45:00Z"
  },
  "message": "Workforce section saved successfully"
}
```

**Client Behavior**: Navigate to CompensationTab (FR-007)

### Response (Error - Validation)

**Status Code**: 400 Bad Request

**Body**:
```json
{
  "success": false,
  "error": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": {
    "full_time_employees": "This field is required",
    "turnover_rate": "Must be between 0 and 100"
  }
}
```

**Client Behavior**: Display inline errors (FR-030), stay on tab (FR-031), preserve data (FR-032)

### Response (Error - Server)

**Status Code**: 500 Internal Server Error

**Body**:
```json
{
  "success": false,
  "error": "Failed to save workforce data",
  "code": "SERVER_ERROR"
}
```

**Client Behavior**: Display inline error message (FR-030), allow retry via Next button

---

## Endpoint 3: Submit Compensation Section

Submits compensation tab data and advances to benefits tab.

### Request

```
POST /assessment/compensation
```

**Headers**:
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body**:
```json
{
  "min_wage": 15.00,
  "max_wage": 75.00,
  "wage_bands": [
    { "id": 1, "role": "Entry Level", "min": 15.00, "max": 25.00 },
    { "id": 2, "role": "Mid Level", "min": 25.00, "max": 50.00 }
  ],
  "benefits_offered": ["Health", "Dental", "401k"],
  "bonus_structure": "performance_based"
}
```

### Response (Success)

**Status Code**: 200 OK

**Body**: Same structure as Workforce success response

**Client Behavior**: Navigate to BenefitsTab (FR-007)

### Response (Error)

**Status Codes**: 400 (validation), 500 (server error)

**Body**: Same structure as Workforce error responses

**Client Behavior**: Same as Workforce error handling (FR-030-FR-032)

---

## Endpoint 4: Submit Benefits Section

Submits benefits tab data and advances to goals tab.

### Request

```
POST /assessment/benefits
```

**Headers**:
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body**:
```json
{
  "health_insurance_participation": {
    "eligible": 30,
    "participating": 25
  },
  "dental_insurance_offered": true,
  "retirement_match_percentage": 3.5,
  "pto_days_average": 15,
  "benefits_satisfaction": 7
}
```

### Response (Success)

**Status Code**: 200 OK

**Body**: Same structure as Workforce success response

**Client Behavior**: Navigate to GoalsTab (FR-007)

### Response (Error)

**Status Codes**: 400 (validation), 500 (server error)

**Body**: Same structure as Workforce error responses

**Client Behavior**: Same as Workforce error handling (FR-030-FR-032)

---

## Endpoint 5: Submit Goals Section (Completion)

Submits goals tab data and triggers assessment completion flow.

### Request

```
POST /assessment/goals
```

**Headers**:
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body**:
```json
{
  "priority_rankings": {
    "rankedItems": ["improve_retention", "increase_wages", "add_benefits"]
  },
  "budget_allocation": {
    "compensation": 50,
    "benefits": 30,
    "training": 20
  },
  "timeline": "12_months",
  "key_metrics": ["retention_rate", "employee_satisfaction"]
}
```

### Response (Success - Complete Assessment)

**Status Code**: 200 OK

**Body**:
```json
{
  "success": true,
  "data": {
    "sectionId": "goals",
    "assessmentId": "assessment-uuid-123",
    "submittedAt": "2026-02-13T12:00:00Z",
    "assessmentComplete": true,
    "completionPercentage": 100
  },
  "message": "Assessment completed successfully"
}
```

**Client Behavior**: Show BaseModalWithIcon (FR-023)
- Title: "You're done!"
- Subtitle: "See your results and recommendations on your dashboard"
- Button: "Go to Dashboard" → Navigate to /dashboard

### Response (Error - Empty Submission)

**Status Code**: 400 Bad Request

**Body**:
```json
{
  "success": false,
  "error": "Assessment appears to be incomplete. No data submitted across sections.",
  "code": "EMPTY_SUBMISSION",
  "details": {
    "sectionsCompleted": 0,
    "totalSections": 4
  }
}
```

**Client Behavior**: Show BaseModalWithIcon (FR-024)
- Title: "Uh-oh"
- Subtitle: "You have not filled anything out. Your recommendations will not be as accurate. Are you sure you want to proceed?"
- Buttons: 
  - Cancel → Close modal, stay on GoalsTab
  - Continue → Proceed despite empty submission

### Response (Error - Server)

**Status Code**: 500 Internal Server Error

**Body**:
```json
{
  "success": false,
  "error": "Failed to save goals data",
  "code": "SERVER_ERROR"
}
```

**Client Behavior**: Display inline error message (FR-030), allow retry via Next button

---

## Error Handling Summary

| Error Type | Status Code | Client Behavior |
|------------|-------------|-----------------|
| Validation (POST) | 400 | Inline errors, stay on tab, preserve data (FR-030-FR-032) |
| Not Found (GET) | 404 | Treat as empty, start fresh |
| Server Error (GET) | 500 | Error message + Retry button (FR-033-FR-035) |
| Server Error (POST) | 500 | Inline error, allow retry (FR-030) |
| Timeout (GET/POST) | 408 | Error message + Retry button |
| Network Error | N/A | Inline error "Unable to connect. Check your internet connection." + Retry |

---

## Rate Limiting (Assumed)

**Limits**: Standard API rate limits apply (assumed 100 req/min per user)

**Headers** (Response):
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1676292000
```

**Client Behavior**: Not handled explicitly in this feature (assumed handled globally)

---

## Authentication & Authorization

**Authentication**: Bearer token in Authorization header

**Token Expiry**: Assumed handled by axios interceptors (401 → redirect to login)

**Authorization**: User can only access their own assessment data

**Security**: HTTPS required for all API calls

---

## Backwards Compatibility

**Existing API Integration**: Already implemented per user input

**Changes Required**: 
- Add `getAssessment()` function to src/services/api/assessmentApi.ts
- No changes to existing POST endpoints (FR-003-FR-006 already implemented)

**Breaking Changes**: None - this is enhancement to existing functionality

---

## Testing Checklist

### GET /assessment
- [ ] Returns 200 with valid data when assessment exists
- [ ] Returns 404 when assessment doesn't exist
- [ ] Returns 500 on server error
- [ ] Returns 408 on timeout
- [ ] Populates all sections correctly
- [ ] Handles partial section data (some sections null)

### POST /assessment/workforce
- [ ] Returns 200 on valid submission
- [ ] Returns 400 with field-level errors on validation failure
- [ ] Returns 500 on server error
- [ ] Preserves data structure compatibility with existing implementation

### POST /assessment/compensation
- [ ] Same test cases as Workforce

### POST /assessment/benefits
- [ ] Same test cases as Workforce

### POST /assessment/goals
- [ ] Returns 200 with assessmentComplete: true on success
- [ ] Returns 400 with EMPTY_SUBMISSION on empty assessment
- [ ] Triggers correct modal based on response type

---

## Contract Compliance

**Specification References**:
- GET /assessment: FR-001, FR-008, FR-009, FR-036, FR-037
- POST /assessment/workforce: FR-003
- POST /assessment/compensation: FR-004
- POST /assessment/benefits: FR-005
- POST /assessment/goals: FR-006, FR-023, FR-024
- Error handling: FR-025, FR-030-FR-035

**Data Model Alignment**: All request/response bodies match types defined in data-model.md

**Ready for Implementation**: ✅ All endpoints fully specified with request/response examples

---

## Implementation Notes for Frontend

**File to Modify**: `src/services/api/assessmentApi.ts`

**Add Function**:
```typescript
export const getAssessment = async (): Promise<ApiResponse<AssessmentData>> => {
  try {
    const response = await apiClient.get('/assessment');
    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to fetch assessment data',
    };
  }
};
```

**Existing Functions** (already implemented):
- `submitWorkforce()` - No changes required
- `submitCompensation()` - No changes required
- `submitBenefits()` - No changes required
- `submitGoals()` - No changes required

---

## Phase 1 Contracts Completion Status

✅ All API endpoints documented  
✅ Request/response formats specified with examples  
✅ Error scenarios covered  
✅ Client behavior defined for each response  
✅ Testing checklist provided  
✅ Ready to proceed to quickstart.md
