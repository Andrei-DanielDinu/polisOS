# Project Coordination Service

This independently deployable service owns project proposals, scoped project roles, authorization records, milestones, and project appeals. It consumes public-safe problem status events to maintain a small local projection; it never reads the problem service database.

## Authority and privacy

A citizen can propose a project only for a public problem that has reached the OPTIONS state. The proposer receives a time-limited, project-scoped project-lead role. Joining creates a time-limited contributor role. An ACTIVE project requires a Keycloak project-owner role and explicit institutional authority, funding references, and a reason. The service records a human attestation; it does not verify that the reference is legally valid or make the public decision.

## Data and feedback

The service stores opaque account subjects, public project charter fields, role scope/expiry, milestone reports, appeal status, event projections, and an outbox. It does not collect a citizen CV, salary, family, health record, or location history. A contributor may correct a milestone or appeal a project decision.

## Stack and operations

Fastify/TypeScript, Prisma, PostgreSQL, Kafka, and Keycloak OIDC. License and operational details follow [ADR 013](../../docs/technology/decisions/ADR-013-first-workflow/README.md). Separate database ownership and event contracts make migration possible. Production requires reviewed migrations, Kafka ACLs, backup/restore, independent authority review, and a staffed operator.

