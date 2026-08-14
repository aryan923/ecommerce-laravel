# UNIVERSAL AI DEVELOPMENT WORKFLOW

**Version:** 1.0  
**Purpose:** Standard workflow for AI coding agents from requirements discovery through specification, planning, implementation, testing, review, and delivery.

---

# 1. PURPOSE

This document defines **HOW the AI agent should execute software development tasks**.

The agent must not treat:

```text
User request → Code
```

as the default workflow.

Instead, use:

```text
User Request
    ↓
Requirement Understanding
    ↓
Specification
    ↓
Gap / Ambiguity Analysis
    ↓
Architecture
    ↓
Implementation Plan
    ↓
Task Breakdown
    ↓
Implementation
    ↓
Testing
    ↓
Review
    ↓
Verification
    ↓
Documentation
    ↓
Completion
```

The amount of planning must be proportional to the complexity and risk of the task.

---

# 2. DEVELOPMENT MODES

Classify every request into one of these modes.

## Mode A — Tiny Change

Examples:

```text
Fix typo
Change label
Small CSS fix
Small validation change
Minor bug fix
```

Workflow:

```text
Understand → Implement → Verify
```

Do not create unnecessary specifications.

---

## Mode B — Small Feature

Examples:

```text
Add a filter
Add a form field
Add a small API endpoint
Add a simple CRUD operation
```

Workflow:

```text
Understand
→ Mini specification
→ Implementation plan
→ Implement
→ Test
→ Review
```

---

## Mode C — Medium Feature

Examples:

```text
Authentication feature
Payment integration
New business workflow
New dashboard module
New CRM functionality
New database module
```

Workflow:

```text
Requirements
→ Feature Specification
→ Architecture Impact
→ Database/API/UI Design
→ Implementation Plan
→ Task Breakdown
→ Implementation
→ Testing
→ Review
```

---

## Mode D — Large Feature / Product

Examples:

```text
Complete CRM
E-commerce system
School ERP
SaaS platform
Multi-tenant application
Large mobile application
Major rewrite
```

Workflow:

```text
Product Requirements
→ SRS
→ Scope Definition
→ User Roles
→ Functional Requirements
→ Non-Functional Requirements
→ Data Model
→ Architecture
→ API Specification
→ UI/UX Specification
→ Security Design
→ Implementation Plan
→ Milestones
→ Development
→ Integration Testing
→ Acceptance Testing
→ Release
```

---

# 3. NEVER SKIP COMPLEXITY ASSESSMENT

Before starting implementation, determine:

```text
Complexity:
Risk:
Number of affected modules:
Database impact:
API impact:
UI impact:
Security impact:
External integrations:
Migration impact:
Testing requirements:
```

Use this to determine how much planning is required.

Do not create a 50-page specification for a two-line bug fix.

Do not start coding a major financial system from a two-line requirement.

---

# 4. STEP 1 — UNDERSTAND THE USER REQUEST

Extract:

```text
Goal
Problem
Expected behavior
Users involved
Affected system
Constraints
Inputs
Outputs
Business rules
Success criteria
```

Separate explicit requirements from assumptions.

Use:

```text
Explicit:
What the user directly requested.

Inferred:
What can safely be inferred from context.

Unknown:
What cannot be determined.
```

Never treat an assumption as an explicit requirement.

---

# 5. STEP 2 — REPOSITORY DISCOVERY

Before creating technical plans for an existing project, inspect the repository.

Determine:

```text
Application structure
Frontend
Backend
Database
Authentication
Authorization
API architecture
Existing modules
Existing components
Existing services
Testing
Deployment
CI/CD
Environment configuration
Dependencies
Documentation
```

Search for existing implementations before designing new ones.

---

# 6. STEP 3 — REQUIREMENTS DOCUMENT

For medium and large features, create a feature specification before implementation.

Use this structure:

```text
# Feature Specification

## 1. Objective

## 2. Problem Statement

## 3. Scope

## 4. Out of Scope

## 5. Actors / Users

## 6. User Stories

## 7. Functional Requirements

## 8. Business Rules

## 9. Inputs

## 10. Outputs

## 11. Validation Rules

## 12. Permissions

## 13. Error Scenarios

## 14. Edge Cases

## 15. Data Requirements

## 16. API Requirements

## 17. UI Requirements

## 18. Non-Functional Requirements

## 19. Security Requirements

## 20. Acceptance Criteria

## 21. Open Questions

## 22. Assumptions
```

---

# 7. FUNCTIONAL REQUIREMENTS

Every important requirement should have a unique identifier.

Example:

```text
FR-001
The system shall allow an administrator to create a lead.

FR-002
The system shall validate the lead's required fields.

FR-003
The system shall prevent duplicate leads according to the configured duplicate rules.
```

Requirements must be testable.

Avoid vague requirements such as:

```text
The system should be fast.

The UI should be good.

The system should be secure.
```

Prefer measurable requirements.

---

# 8. USER STORIES

Where appropriate, convert functionality into user stories.

Format:

```text
As a [role],
I want to [action],
so that [benefit].
```

Example:

```text
As a sales executive,
I want to assign a lead to myself,
so that I can manage the follow-up.
```

Each important user story should have acceptance criteria.

---

# 9. ACCEPTANCE CRITERIA

Use explicit conditions.

Example:

```text
Given a logged-in sales executive
When they open an unassigned lead
And click "Assign to Me"
Then the lead should be assigned to that user
And the assignment timestamp should be recorded
And another user should no longer see it as unassigned.
```

Acceptance criteria should be testable.

---

# 10. SCOPE DEFINITION

Every feature specification must clearly define:

## In Scope

What will be implemented.

## Out of Scope

What will NOT be implemented.

Example:

```text
In scope:
- Lead creation
- Lead assignment
- Lead status
- Lead notes

Out of scope:
- AI lead scoring
- WhatsApp integration
- Email automation
- Advanced analytics
```

This prevents scope creep.

---

# 11. BUSINESS RULES

Extract business rules separately from technical implementation.

Example:

```text
BR-001
A lead can have only one active owner.

BR-002
Only administrators can delete leads.

BR-003
A closed lead cannot be moved back to "New" unless an administrator performs the action.
```

Do not bury important business rules inside random code.

---

# 12. ROLE AND PERMISSION MATRIX

For features involving multiple roles, create a matrix.

Example:

| Action | Admin | Manager | Staff |
|---|---:|---:|---:|
| View | Yes | Yes | Yes |
| Create | Yes | Yes | Yes |
| Edit | Yes | Yes | Own only |
| Delete | Yes | No | No |
| Assign | Yes | Yes | No |

Never assume frontend visibility equals authorization.

---

# 13. DATA REQUIREMENT ANALYSIS

Determine whether the feature requires:

```text
New tables
New columns
New relationships
New indexes
New constraints
New enums/statuses
Data migration
Historical data changes
Audit records
```

For every database change document:

```text
Entity
Field
Type
Nullable
Default
Validation
Index
Unique constraint
Foreign key
Delete behavior
```

---

# 14. DATABASE DESIGN

Before implementation, determine the data model.

Example:

```text
User
  ↓
Lead
  ↓
LeadActivity
```

Identify:

```text
Primary keys
Foreign keys
Cardinality
Indexes
Unique constraints
Soft deletion
Audit requirements
Tenant boundaries
```

Never create duplicate representations of the same business entity without a reason.

---

# 15. API SPECIFICATION

For every new API endpoint define:

```text
Method
Path
Authentication
Authorization
Request
Validation
Response
Errors
Status codes
Pagination
Filtering
Sorting
Idempotency
```

Example:

```text
POST /api/leads

Authentication:
Required

Permission:
lead.create

Request:
{
    name,
    email,
    phone
}

Response:
201 Created
{
    id,
    name,
    email,
    phone,
    status
}
```

Do not begin implementation of a complex API before the contract is understood.

---

# 16. API CONTRACT STABILITY

When modifying an existing API:

Determine:

```text
Who consumes this API?
Which frontend uses it?
Are there external clients?
Are there mobile applications?
Are there integrations?
```

Avoid breaking response structures.

If a breaking change is unavoidable, explicitly document it.

---

# 17. UI/UX SPECIFICATION

For user-facing features define:

```text
Page/screen
Entry point
User actions
Components
Forms
Validation
Loading state
Empty state
Error state
Success state
Permission state
Responsive behavior
```

Example:

```text
Screen:
Lead Details

Actions:
- Edit
- Assign
- Add Note
- Change Status

States:
- Loading
- Loaded
- Not Found
- Unauthorized
- Error
```

---

# 18. WORKFLOW SPECIFICATION

For workflow-driven features, define state transitions.

Example:

```text
NEW
 ↓
CONTACTED
 ↓
QUALIFIED
 ↓
PROPOSAL
 ↓
WON
```

Also define invalid transitions.

Example:

```text
WON → NEW
```

should be prohibited unless explicitly allowed.

---

# 19. NON-FUNCTIONAL REQUIREMENTS

Consider:

```text
Performance
Scalability
Security
Availability
Reliability
Maintainability
Accessibility
Observability
Compatibility
Backup/recovery
```

Only specify requirements relevant to the project.

---

# 20. SECURITY SPECIFICATION

For security-sensitive features identify:

```text
Authentication
Authorization
Resource ownership
Tenant isolation
Input validation
Rate limiting
Secrets
Encryption
Audit logs
Session handling
File security
Webhook verification
```

Security requirements must be explicit.

---

# 21. INTEGRATION ANALYSIS

For external services document:

```text
Provider
Purpose
Authentication
API endpoints
Request format
Response format
Timeout
Retry
Rate limits
Failure handling
Idempotency
Webhook behavior
Fallback
```

Never build against an imagined API.

Inspect available documentation or existing integration code.

---

# 22. DEPENDENCY ANALYSIS

Before adding dependencies:

Document:

```text
Dependency
Purpose
Existing alternative
Version compatibility
Security implications
Bundle/runtime impact
Reason for adding
```

Avoid unnecessary dependencies.

---

# 23. ARCHITECTURE DESIGN

After requirements are stable, determine the technical architecture.

Document:

```text
Frontend
Backend
Database
API
Authentication
Authorization
Storage
Queues
Caching
External services
Background jobs
Observability
```

Only include components actually required.

---

# 24. ARCHITECTURE DECISION RULE

Every major architectural component should answer:

> What problem does this component solve?

If the answer is unclear, do not introduce it.

---

# 25. ARCHITECTURE IMPACT ANALYSIS

For an existing application identify:

```text
Existing architecture
Affected components
New components
Modified components
Dependencies
Potential regressions
Migration requirements
```

Prefer extending existing architecture over creating parallel architecture.

---

# 26. IMPLEMENTATION PLAN

After architecture, create an implementation plan.

Use:

```text
# Implementation Plan

## Phase 1 — Database

1.
2.
3.

## Phase 2 — Backend

1.
2.
3.

## Phase 3 — API

1.
2.
3.

## Phase 4 — Frontend

1.
2.
3.

## Phase 5 — Testing

1.
2.
3.

## Phase 6 — Documentation

1.
2.
```

Each task should be small enough to implement and verify independently.

---

# 27. TASK BREAKDOWN

Avoid tasks such as:

```text
Build the entire CRM.
```

Prefer:

```text
TASK-001 Create leads migration.
TASK-002 Create Lead model.
TASK-003 Create lead validation.
TASK-004 Create lead service.
TASK-005 Create create-lead endpoint.
TASK-006 Create lead listing endpoint.
TASK-007 Create frontend lead form.
TASK-008 Add lead tests.
```

---

# 28. TASK DEPENDENCIES

Identify dependencies.

Example:

```text
TASK-001 Database
    ↓
TASK-002 Model
    ↓
TASK-003 Service
    ↓
TASK-004 API
    ↓
TASK-005 Frontend
    ↓
TASK-006 Integration tests
```

Do not implement dependent work before its prerequisite is understood.

---

# 29. TASK DEFINITION

Every non-trivial task should contain:

```text
Task ID
Title
Objective
Files/components affected
Dependencies
Implementation details
Acceptance criteria
Testing requirements
```

Example:

```text
TASK-004 — Create Lead API

Objective:
Allow authenticated users with lead.create permission to create leads.

Dependencies:
TASK-001
TASK-002
TASK-003

Acceptance:
- Valid request creates lead.
- Invalid request returns validation errors.
- Unauthorized user receives 403.
- Duplicate handling follows duplicate rules.
```

---

# 30. IMPLEMENTATION ORDER

Generally prefer:

```text
1. Data model
2. Domain/business logic
3. Validation
4. API/backend
5. Frontend
6. Integration
7. Tests
8. Documentation
```

Adjust this order if the project's architecture requires something different.

---

# 31. IMPLEMENTATION CHECKPOINTS

After each major phase, verify the result.

Example:

```text
Database complete
↓
Run migrations
↓
Verify schema

Backend complete
↓
Run unit tests
↓
Verify business logic

API complete
↓
Run API tests
↓
Verify contract

Frontend complete
↓
Run build
↓
Verify user flow
```

Do not continue blindly after a failing checkpoint.

---

# 32. TEST PLAN

Before implementation of complex features, define the test strategy.

Include:

```text
Unit tests
Integration tests
API tests
Component tests
End-to-end tests
Security tests
Regression tests
```

Use only the categories relevant to the feature.

---

# 33. TEST CASE MATRIX

For important features, create a matrix:

| Test ID | Scenario | Expected Result |
|---|---|---|
| TC-001 | Valid input | Success |
| TC-002 | Missing required field | Validation error |
| TC-003 | Unauthorized user | 403 |
| TC-004 | Resource not found | 404 |
| TC-005 | Duplicate request | Correct duplicate handling |
| TC-006 | Dependency failure | Safe error |
| TC-007 | Boundary value | Correct behavior |

---

# 34. REGRESSION TEST PLAN

Identify existing functionality that could be affected.

Example:

```text
Feature:
Lead assignment

Regression areas:
- Lead listing
- Lead filtering
- Lead permissions
- Lead dashboard
- Lead reports
- Notifications
```

Run relevant existing tests.

---

# 35. IMPLEMENTATION RULE

Once the specification and plan are approved or sufficiently clear:

**Implement exactly what is specified.**

Do not silently expand the feature.

If implementation reveals a requirement conflict:

```text
Stop
Identify conflict
Explain impact
Choose safest path or request clarification
```

Do not silently redesign the feature.

---

# 36. CHANGE CONTROL

If a new requirement appears during implementation:

Classify it as:

```text
Required correction
Missing requirement
Enhancement
Scope change
Technical necessity
```

Do not automatically implement unrelated enhancements.

---

# 37. SPECIFICATION UPDATES

If implementation reveals that the specification is incorrect:

Update the specification before proceeding.

The specification must describe the intended final behavior.

Do not allow:

```text
Specification says A
Code does B
Tests expect C
```

to coexist.

---

# 38. TRACEABILITY

For medium/large features, maintain:

```text
Requirement
    ↓
Design
    ↓
Implementation task
    ↓
Code
    ↓
Test
    ↓
Acceptance criterion
```

Example:

```text
FR-003
↓
API design
↓
TASK-007
↓
LeadController
↓
TC-004
↓
AC-003
```

This allows the agent to determine whether every requirement is actually implemented and tested.

---

# 39. REQUIREMENT COVERAGE

Before completion, check:

```text
Every requirement implemented?
Every important requirement tested?
Every acceptance criterion satisfied?
Any requirement accidentally omitted?
Any out-of-scope functionality added?
```

---

# 40. CODE IMPLEMENTATION PHASE

During implementation:

1. Follow the specification.
2. Follow repository conventions.
3. Make incremental changes.
4. Keep changes focused.
5. Test after meaningful changes.
6. Avoid large unverified rewrites.

Do not wait until the entire feature is finished before discovering basic errors.

---

# 41. INCREMENTAL VERIFICATION

Prefer:

```text
Implement small unit
→ Verify
→ Implement next unit
→ Verify
```

over:

```text
Write 5,000 lines
→ Run tests
→ Discover 50 problems
```

---

# 42. TEST-DRIVEN BUG FIXES

For bugs where practical:

```text
1. Reproduce
2. Write failing regression test
3. Fix root cause
4. Confirm test passes
5. Run related tests
```

This prevents the bug from returning.

---

# 43. FINAL VALIDATION

After implementation:

### Functional

Does the feature satisfy the specification?

### Technical

Does the code follow architecture?

### Security

Can unauthorized access occur?

### Data

Can invalid or inconsistent data be created?

### Performance

Are there obvious performance problems?

### UX

Are all important UI states handled?

### Compatibility

Did existing behavior remain intact?

---

# 44. FINAL QA CHECKLIST

- [ ] Requirements reviewed.
- [ ] Scope reviewed.
- [ ] Acceptance criteria reviewed.
- [ ] Business rules reviewed.
- [ ] Database changes reviewed.
- [ ] API contract reviewed.
- [ ] Authorization reviewed.
- [ ] Validation reviewed.
- [ ] Error handling reviewed.
- [ ] Edge cases reviewed.
- [ ] Security reviewed.
- [ ] Performance reviewed.
- [ ] Tests added/updated.
- [ ] Existing tests executed.
- [ ] Build executed.
- [ ] Lint executed.
- [ ] Type checking executed where applicable.
- [ ] Manual user flow verified where appropriate.
- [ ] Final diff reviewed.
- [ ] Documentation updated.
- [ ] No unrelated changes.
- [ ] No secrets.
- [ ] No unresolved TODOs related to the requested feature.
- [ ] All acceptance criteria satisfied.

---

# 45. FINAL ACCEPTANCE REVIEW

Before declaring completion, compare the implementation against the original request.

Create this mental table:

| Requirement | Implemented | Tested | Verified |
|---|---|---|---|
| Requirement 1 | Yes/No | Yes/No | Yes/No |
| Requirement 2 | Yes/No | Yes/No | Yes/No |
| Requirement 3 | Yes/No | Yes/No | Yes/No |

Nothing should be marked complete without evidence.

---

# 46. FINAL DELIVERY REPORT

The final response should contain:

```text
## Summary

What was implemented.

## Changes

- File/module
- Change
- Reason

## Requirements Completed

- FR-001
- FR-002
- FR-003

## Verification

Tests:
...

Lint:
...

Type check:
...

Build:
...

Manual verification:
...

## Known Limitations

...

## Assumptions

...

## Follow-up

Only if genuinely required.
```

Never hide failures.

---

# 47. IF SOMETHING FAILED

Report:

```text
What failed
Why it failed
Whether it is caused by the changes
What was attempted
What remains
```

Never change the status to successful merely because the failure is inconvenient.

---

# 48. IF SOMETHING CANNOT BE TESTED

Clearly state:

```text
Not verified because:
[reason]
```

Examples:

```text
Live payment gateway unavailable.
Production credentials unavailable.
External API sandbox unavailable.
Device-specific behavior could not be tested.
```

Do not pretend that untested functionality is verified.

---

# 49. DOCUMENT HIERARCHY

When multiple instruction files exist, follow the project's documented precedence.

Recommended hierarchy:

```text
System instructions
        ↓
Developer instructions
        ↓
Project-level AI instructions
        ↓
Directory/module-specific instructions
        ↓
Feature specification
        ↓
Implementation plan
        ↓
Individual task
```

More specific project instructions may override general project instructions when they are intentionally scoped to that area.

---

# 50. PROJECT DOCUMENT STRUCTURE

For larger projects, maintain:

```text
/docs
    /requirements
    /specifications
    /architecture
    /api
    /database
    /plans
    /testing
    /decisions
```

Suggested files:

```text
PROJECT_REQUIREMENTS.md
SYSTEM_SPECIFICATION.md
ARCHITECTURE.md
DATABASE_SPECIFICATION.md
API_SPECIFICATION.md
IMPLEMENTATION_PLAN.md
TEST_PLAN.md
CHANGELOG.md
```

Do not create every document for every small feature.

---

# 51. CHANGE DECISION RECORDS

For important architectural decisions, record:

```text
Decision
Context
Options considered
Chosen option
Reason
Tradeoffs
Consequences
```

Example:

```text
Decision:
Use PostgreSQL for transactional data.

Reason:
Existing project already uses PostgreSQL and requires relational integrity.

Alternative:
MongoDB.

Rejected because:
Would introduce unnecessary architectural complexity.
```

---

# 52. WHEN TO STOP AND ASK

The agent should ask for clarification when:

```text
Two requirements conflict.
A destructive action is ambiguous.
Business rules materially affect implementation.
Security behavior is unclear.
Financial calculations are ambiguous.
A breaking API change may be required.
Production data could be affected.
A required external dependency is unavailable.
```

Do not ask merely because there is a minor implementation choice.

---

# 53. WHEN NOT TO ASK

Do not ask unnecessary questions when:

```text
The repository clearly establishes the pattern.
The framework has an obvious convention.
The requirement is unambiguous.
The implementation choice has no meaningful business impact.
The answer can be safely derived from existing code.
```

Use engineering judgment.

---

# 54. PRODUCT-LEVEL DEVELOPMENT WORKFLOW

For an entirely new product, use:

```text
1. Product idea
2. Problem definition
3. Target users
4. User journeys
5. Scope
6. MVP definition
7. Functional requirements
8. Non-functional requirements
9. Roles and permissions
10. Data model
11. Architecture
12. API specification
13. UI/UX specification
14. Security design
15. Infrastructure requirements
16. Development plan
17. Milestones
18. Implementation
19. Testing
20. UAT
21. Deployment
22. Monitoring
23. Post-launch fixes
```

---

# 55. MVP DISCIPLINE

When building an MVP:

Do not confuse:

```text
Must have
```

with:

```text
Nice to have
```

Classify features:

```text
P0 — Required for product to function
P1 — Important for initial release
P2 — Useful later
P3 — Future idea
```

Do not implement P2/P3 features while P0 functionality remains incomplete.

---

# 56. FEATURE PRIORITIZATION

Use:

```text
Priority
Dependency
Risk
Business value
Implementation effort
```

to determine development order.

Do not simply build features in the order they were mentioned.

---

# 57. RELEASE PLANNING

For larger products:

```text
Release 1
Core functionality

Release 2
Important workflows

Release 3
Automation/integrations

Release 4
Optimization/advanced features
```

Every release should have explicit acceptance criteria.

---

# 58. PRODUCTION READINESS

Before production release, review:

```text
Security
Authentication
Authorization
Database migrations
Backups
Logging
Monitoring
Error tracking
Rate limits
Environment variables
Secrets
Queue workers
Scheduled jobs
Storage
Email/SMS configuration
External APIs
Rollback strategy
```

---

# 59. POST-RELEASE

After deployment, where applicable verify:

```text
Application health
Database migrations
API availability
Authentication
Critical user workflows
Background workers
Queues
Scheduled tasks
External integrations
Error rates
Logs
```

Do not assume deployment succeeded merely because the deployment command succeeded.

---

# 60. GOLDEN DEVELOPMENT LOOP

The universal loop is:

```text
UNDERSTAND
    ↓
SPECIFY
    ↓
ANALYZE
    ↓
DESIGN
    ↓
PLAN
    ↓
BREAK DOWN
    ↓
IMPLEMENT
    ↓
TEST
    ↓
REVIEW
    ↓
VERIFY
    ↓
DOCUMENT
    ↓
DELIVER
```

For every iteration, ask:

> Did the implementation move the project closer to the explicitly defined desired state?

---

# 61. FINAL AI AGENT RULE

Never optimize for:

```text
Lines of code
Number of files changed
Speed of coding
Number of features added
Number of dependencies
```

Optimize for:

```text
Correctness
Requirement coverage
Reliability
Security
Maintainability
Testability
Minimal unnecessary change
```

The best AI coding agent is not the agent that writes the most code.

It is the agent that **understands the requirement, makes the correct change, proves that the change works, and does not break everything else.**

# END OF UNIVERSAL AI DEVELOPMENT WORKFLOW