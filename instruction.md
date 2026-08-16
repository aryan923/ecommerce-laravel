# AI Module Development Workflow

## Purpose

This document defines the mandatory workflow for implementing any new feature or module. Every module must follow this process from requirement review through implementation and testing. Do not skip, reorder, or merge stages unless explicitly instructed by the user.

---

# Core Principles

- The **Specification** is the single source of truth.
- Never generate code before the Specification is finalized.
- Never create a Plan without reviewing the latest Specification.
- Never implement code without reviewing both the Specification and the Plan.
- Every module must have its own Specification, Plan, Test Cases, and Regression documents.
- Documentation must always be created before implementation.
- If a conflict is found at any stage, update the Specification first, then synchronize all other documents.
- Keep documentation synchronized throughout the entire development lifecycle.

---

# Project Structure

Create the following folders if they do not already exist.

```
project-root/
│
├── specifications/
│   ├── feature.authentication.spec.md
│   ├── feature.wallet.spec.md
│   └── feature.order.spec.md
│
└── plans/
    ├── plan.authentication.md
    ├── test-cases.authentication.md
    ├── regression.authentication.md
    └── ...
```

Naming conventions:

Specification

```
feature.<module-name>.spec.md
```

Plan

```
plan.<module-name>.md
```

Test Cases

```
test-cases.<module-name>.md
```

Regression

```
regression.<module-name>.md
```

---

# STEP 1 — Requirement Review

## Input

The user will provide one module requirement, feature description, PRD, specification, or requirement document.

## Responsibilities

Read the complete document carefully.

Understand:

- Business flow
- Functional requirements
- Non-functional requirements
- Existing architecture dependencies
- Database impact
- API impact
- UI impact
- Validation requirements
- Permission requirements
- Error handling
- Acceptance criteria

Identify:

- Missing requirements
- Conflicting requirements
- Edge cases
- Risks
- Dependencies

Do **NOT** generate any implementation code during this stage.

---

# STEP 2 — Generate Specification

Create the folder if needed.

```
/specifications
```

Generate

```
feature.<module-name>.spec.md
```

The specification must contain:

## Module Overview

Describe the purpose.

## Business Flow

Complete business process.

## Functional Requirements

Detailed features.

## Technical Requirements

Implementation expectations.

## Database Changes

Tables

Columns

Indexes

Relationships

Migration requirements

## API Requirements

Endpoints

Requests

Responses

Authentication

Error responses

## UI Requirements

Screens

Components

User interactions

Loading states

Empty states

Error states

## Validation Rules

All validation logic.

## Permission Rules

Role-based access.

## Business Rules

Processing rules.

## Error Handling

Expected failures.

## Acceptance Criteria

Checklist for completion.

## Edge Cases

Every possible edge case.

## Dependencies

External/internal dependencies.

## Open Questions

Anything requiring clarification.

This document becomes the project's source of truth.

---

# STEP 3 — Review Specification

Before creating the plan:

Read the generated Specification again.

Verify:

- Missing information
- Logical inconsistencies
- Incomplete sections
- Conflicting business rules

Only continue if the Specification is complete.

---

# STEP 4 — Planning

Create

```
/plans
```

Generate

```
plan.<module-name>.md
```

The plan must include:

# Module Summary

# Development Strategy

Explain implementation approach.

# Architecture

- Components
- Services
- APIs
- Models
- Database
- State Management

# Task Breakdown

Break work into very small executable tasks.

Example

```
Task 1
Create Migration

Task 2
Create Models

Task 3
Repository Layer

Task 4
API Layer

Task 5
Business Logic

Task 6
Frontend UI

Task 7
Validation

Task 8
Permissions

Task 9
Logging

Task 10
Documentation
```

Each task must be independently executable.

Include task status.

Example

```
[ ] Task 1

[ ] Task 2

[ ] Task 3
```

---

# STEP 5 — Generate Test Documentation

Immediately after generating the Plan:

Generate

```
test-cases.<module-name>.md
```

Include

- Happy Path
- Negative Tests
- Validation Tests
- Permission Tests
- API Tests
- UI Tests
- Database Tests
- Edge Cases

---

Generate

```
regression.<module-name>.md
```

Include

- Existing affected features
- Regression scenarios
- Expected results
- Priority
- Smoke scenarios
- Integration scenarios

---

# STEP 6 — Documentation Review

Review all generated documents together.

Review:

- Specification
- Plan
- Test Cases
- Regression

Check for:

- Missing features
- Missing tasks
- Missing tests
- Conflicts
- Incorrect business logic
- Missing validations
- Missing permissions

If any issue exists:

Update in this exact order:

1. Specification
2. Plan
3. Test Cases
4. Regression

Never update the Plan before updating the Specification.

---

# STEP 7 — Implementation

Before writing any code, always read:

- Latest Specification
- Latest Plan
- Latest Test Cases
- Latest Regression document

Never rely on memory.

Always use the latest documentation.

Implement one task at a time.

For each task:

1. Read related project files.
2. Understand existing implementation.
3. Implement only the current task.
4. Validate the implementation.
5. Mark the task complete.
6. Proceed to the next task.

Update the plan status.

Example

```
[x] Task 1

[x] Task 2

[ ] Task 3
```

---

# Implementation Standards

Generated code must:

- Follow existing project architecture.
- Follow existing coding standards.
- Be production-ready.
- Avoid duplicate logic.
- Reuse existing components whenever possible.
- Follow SOLID principles where applicable.
- Use common Trait (`App\Traits\ApiResponseTrait`) for sending standardized API responses across all controllers.
- Include validation.

- Include proper exception handling.
- Include logging where appropriate.
- Avoid unnecessary refactoring.
- Minimize impact on existing features.

---

# STEP 8 — Validation

After implementation:

Run:

- Project Build
- Lint (if applicable)
- Type Check (if applicable)
- Unit Tests for the implemented feature

Verify:

- No compilation errors
- No build errors
- No lint errors
- No failed unit tests

If any issue occurs:

Fix the implementation.

Repeat validation until successful.

---

# STEP 9 — Completion Report

When everything passes:

Provide:

## Completed Tasks

Example

```
✅ Task 1

✅ Task 2

✅ Task 3
```

## Files Created

List every created file.

## Files Modified

List every modified file.

## Build Status

```
✅ Build Passed
```

## Unit Test Status

```
✅ All Tests Passed
```

## Remaining Tasks

If applicable.

Do not mark the module complete until:

- Build passes
- Unit tests pass
- All planned tasks are completed
- Documentation is synchronized

---

# Conflict Resolution

If a conflict is discovered during implementation:

Stop implementation immediately.

Review:

- Specification
- Plan
- Test Cases
- Regression

Update in this order:

1. Specification
2. Plan
3. Test Cases
4. Regression

Only resume implementation after documentation has been synchronized.

---

# Zero-Assumption Policy (Mandatory)

The AI must **never make assumptions** about:

- Business logic
- Functional behavior
- UI/UX
- API contracts
- Database schema
- Validation rules
- Permissions
- User flow
- Acceptance criteria
- Expected outputs
- Integration behavior

If anything is unclear, ambiguous, incomplete, or conflicting:

1. Stop the current workflow immediately.
2. Clearly explain what is unclear or conflicting.
3. Ask the user for clarification.
4. Wait for the user's response.
5. Update the Specification based on the clarification.
6. Continue only after the Specification has been updated.

Never generate:

- Code
- Specifications
- Plans
- Database changes
- APIs
- Tests
- Documentation

based on assumptions.

---

# Situations That Require Clarification

Always ask questions if you encounter:

- Missing business rules
- Unclear feature behavior
- Missing UI requirements
- Missing API details
- Undefined database relationships
- Missing validation rules
- Missing permissions
- Conflicting requirements
- Multiple possible implementation approaches
- Missing acceptance criteria
- Any uncertainty that affects implementation

Never use phrases like:

- "I assume..."
- "Probably..."
- "Typically..."
- "Most likely..."
- "I'll implement it this way..."

Instead, stop and ask the user.

This rule applies during:

- Requirement Review
- Specification
- Planning
- Test Case Generation
- Regression Generation
- Implementation
- Refactoring
- Bug Fixing
- Code Review
- Testing
- Documentation Updates

---

# Mandatory Workflow

```
Receive Module Requirement
            │
            ▼
Review Requirement
            │
            ▼
Generate Specification
            │
            ▼
Review Specification
            │
            ▼
Generate Plan
            │
            ▼
Generate Test Cases
            │
            ▼
Generate Regression File
            │
            ▼
Review All Documents
            │
            ▼
Resolve Conflicts (if any)
            │
            ▼
Update Specification
            │
            ▼
Update Plan
            │
            ▼
Update Test Cases
            │
            ▼
Update Regression
            │
            ▼
Read Latest Documentation
            │
            ▼
Implement Task-by-Task
            │
            ▼
Update Task Status
            │
            ▼
Run Build
            │
            ▼
Run Unit Tests
            │
            ▼
Fix Issues (if any)
            │
            ▼
Repeat Validation Until Successful
            │
            ▼
Generate Completion Report
            │
            ▼
Module Complete
```

---

# Absolute Rules

- Never skip any workflow stage.
- Never generate code before documentation.
- Never skip Specification review.
- Never create a Plan without reviewing the latest Specification.
- Never implement without reading the latest Specification and Plan.
- Never continue if there is unresolved ambiguity.
- Never guess business logic.
- Never modify the Plan before updating the Specification.
- Keep all documentation synchronized.
- Update task status as work progresses.
- Do not declare the module complete until the build succeeds, all unit tests across whole application pass, and every planned task is finished.
```