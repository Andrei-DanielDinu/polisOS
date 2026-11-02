# ADR 013 First Workflow Implementation Stack

## Status

Selected for the first citizen-led problem-to-project slice. This is a bounded implementation choice, not a national platform lock-in. Domain owners may choose other stacks if they honor shared contracts.

## Decision

- Web interface: React, TypeScript, Vite.
- Problem review service and project coordination service: separate Fastify/TypeScript APIs, separate Prisma schemas and service-owned PostgreSQL databases.
- Identity: Keycloak as the OIDC provider; account is optional for browsing and required to submit or join.
- Events: Apache Kafka. First events use versioned JSON Schema stored in this repository; schema-registry selection remains open.
- Local runtime: Docker Compose with a single-node development broker and local identity/database services. This topology is not a production availability design.
- Cross-service state: event-driven projection and transactional outbox; consumers are idempotent. Do not use shared database writes.

## Why

The repository audit found no old React, Fastify, Prisma or Supabase code. This stack uses the prior candidates for the first bounded slice and keeps service-owned PostgreSQL data and OIDC identity separate. It fits the user-selected FOSS, microservice, Kafka, polyglot and container-first directions. Python remains available for later data ingestion, analysis, simulation or advisory AI where a domain owner prefers it.

## License

React is MIT; Fastify is MIT; Prisma ORM is Apache-2.0; PostgreSQL uses the PostgreSQL License; Keycloak and Kafka are Apache-2.0. Review exact versions, dependencies, container images and extensions before release. The local map component is not part of this slice.

## Hosting and operations cost

No hosting price is estimated. Budget two API services, web hosting, PostgreSQL backups and restore drills, Keycloak operations and account recovery, Kafka storage and monitoring, logs, security response, domain support, accessibility/localization, and trained operators. Production Kafka requires a real KRaft quorum and broker plan; a one-node local compose environment has no high availability.

## Security

Require OIDC authorization-code flow with PKCE, short-lived tokens, server-side role checks, minimal profile claims, no real-name requirement, no biometric identity, and redaction of tokens from logs. Public reports require explicit publication consent. Private reports are returned only to their submitter and authorized reviewers. Project activation requires a project-owner role and recorded institutional authority and funding references; the software does not verify or create legal authority.

The npm workspace pins `deepmerge-ts` to the patched 8.x line through an override because Prisma 6.19.3's `@prisma/config` dependency currently resolves the affected 7.1.5 line. The advisory concerns recursive object graph merging in config loading; the override removes the known vulnerable version while the Prisma generator and API types are checked against it. Reassess the override when Prisma updates its dependency.

Each Prisma schema generates to its own client location. Never merge generated clients for independent service schemas into the shared `@prisma/client` default path.

## Interoperability

Use REST/OpenAPI-compatible endpoints, versioned event schemas, stable opaque IDs, shared error conventions, OIDC, and UTF-8 JSON. Events contain minimal references, not personal narratives. The first schemas live in version control; schema registry and Avro/Apicurio remain candidates.

## Migration

Each API owns its database and migrations. Export reports, evidence, options, projects, milestones, role records, outbox and processed-event IDs as documented JSON/CSV. Keep frontend replaceable through APIs. Provider changes require safe account re-authentication where password credentials cannot migrate. Kafka migration must preserve event IDs and replay rules.

## Open decisions

Production hosting and region; service operator and on-call; production Kafka cluster and recovery objectives; schema registry; account verification and recovery policy; data retention; repository license; institutional project-owner onboarding; production launch gate.

