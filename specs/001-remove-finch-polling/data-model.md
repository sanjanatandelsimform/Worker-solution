# Data Model: Consolidate Finch Connection Status

**Feature**: 001-remove-finch-polling  
**Date**: 2026-04-28

## Entities

## 1. Assessment Status

Represents existing assessment response used by multiple pages.

- `assessmentType`: string | null
- `data.status`: string | null
- `data.sections`: object | null

Validation rules:

- Missing object is treated as unavailable status.
- Missing `assessmentType` must not imply Finch-connected state.

## 2. Finch Connection State (Derived)

Derived field from assessment payload (not persisted separately).

- `isConnected = assessmentData?.assessmentType === "finch"`

Derivation rules:

- If assessment type is `finch` => connected.
- If assessment type is absent or not `finch` => disconnected.

## 3. Finch Completion State (Existing)

Already exposed by `useAssessmentStatus`.

- `isFinchCompleted = assessmentType === "finch" && data.status === "completed"`
- `isFinchAssessmentIncomplete = assessmentType === "finch" && data.status !== "completed"`

## Transition Model

Connection-state transitions are now driven by assessment refetch only.

- Unknown -> Connected: assessment loads with `assessmentType = finch`.
- Unknown -> Disconnected: assessment loads with non-finch or empty type.
- Connected -> Disconnected: assessment refresh returns non-finch type.
- Disconnected -> Connected: assessment refresh returns `finch` type.

No separate polling transition exists after feature completion.

## Consumer Mapping

- `useIndustry`: Finch path gating uses derived connected state.
- `DashboardPage`: tab/data fetch conditions use derived connected state.
- `AdditionalQuestions`: access guard uses derived connected + assessment loading.
- `CompanyAtAGlance`: benefits overview visibility uses derived connected state.
