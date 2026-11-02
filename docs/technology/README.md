# Technology Direction and Stack Decisions

## Purpose and outcomes

The platform uses FOSS software where possible, with the understanding that hosting, skilled staff, support, backups, energy, security review, and operations have real costs. This page is the technology index. Detailed records live under [stack decision records](decisions/README.md) and in every domain chapter.

The technology boundary is service autonomy with shared contracts. Domain owners may choose languages, frameworks, and stores independently, provided they meet shared API, event, identity, security, privacy, observability, accessibility, backup, export, and audit requirements. A service choice is not final until the operating owner documents who will patch, monitor, recover, and eventually replace it.

Domain owners also choose their own service rollout order against these contracts and their readiness. The product blueprint identifies dependencies for the first citizen workflow but does not assign a fixed national sequence to D01–D20.

## Accepted directions and candidates

| Layer | Direction | Status |
|---|---|---|
| Service architecture | Independently deployable domain microservices from day one | Accepted user decision; service boundaries still require review |
| Messaging | Apache Kafka from the start | Accepted user decision; production topology, recovery objectives, and staffing remain open |
| Contracts | OpenAPI for HTTP; versioned events and schema governance | Shared contract direction; exact event format open |
| Languages | Polyglot; owners select per service | Accepted user decision |
| Runtime | Containers first; Kubernetes when operating needs justify it | Accepted user decision; OCI-compatible tooling and thresholds remain open |
| Frontend | React + TypeScript + Vite | Selected for the first workflow; prior source code was absent |
| TypeScript services | Fastify + Prisma | Selected for the first workflow APIs; other services remain owner choice |
| Identity | Keycloak OIDC | Selected for first-workflow accounts; wider identity architecture remains reviewable |
| Data | PostgreSQL; PostGIS for spatial data | PostgreSQL selected for first-workflow services; PostGIS only if spatial needs justify it |
| Supabase | Self-hosted comparison candidate | Open; self-hosted platform differs from managed service and has component-specific operations |
| Event schemas | Versioned JSON Schema in repository | Selected for first-workflow events; Avro/Apicurio and Protobuf remain later candidates |
| Maps | MapLibre + OpenStreetMap data | Candidate; production tiles need a provider or self-hosted infrastructure |
| Observability | OpenTelemetry + Prometheus | Candidate; strictly for service telemetry, not citizen or national outcome monitoring |
| Documentation | Obsidian local authoring, portable Markdown in Git | Accepted; no paid Sync/Publish or community plugin dependency |

The first workflow stack decision selects React/TypeScript/Vite, Fastify/Prisma, PostgreSQL, Keycloak OIDC and Kafka for the initial slice. The table above describes the broader candidate space; the selection is limited to that workflow and remains subject to operational review. See [ADR 013](decisions/ADR-013-first-workflow/README.md).

React is MIT licensed ([package metadata](https://github.com/facebook/react/blob/main/packages/react/package.json)); Fastify is MIT licensed ([license](https://github.com/fastify/fastify/blob/main/LICENSE)); Prisma ORM uses Apache-2.0 ([repository](https://github.com/prisma/orm)); PostgreSQL uses its own permissive license ([official license](https://www.postgresql.org/about/licence/)); PostGIS is GPLv2 ([license FAQ](https://postgis.net/documentation/faq/gpl-license/)); Keycloak is Apache-2.0 ([repository](https://github.com/keycloak/keycloak)). Verify exact versions, extensions, transitive dependencies, and bundled components at selection time.

## Cross-cutting decision records

- [National operating-picture service boundaries](decisions/ADR-014-national-services/README.md)
- [Runtime and orchestration](decisions/ADR-001-runtime/README.md)
- [Web frontend](decisions/ADR-002-frontend/README.md)
- [Identity and access](decisions/ADR-003-identity/README.md)
- [Data stores and geospatial](decisions/ADR-004-data/README.md)
- [Kafka event backbone](decisions/ADR-005-events/README.md)
- [API and event contracts](decisions/ADR-006-contracts/README.md)
- [Maps and tiles](decisions/ADR-007-maps/README.md)
- [Observability](decisions/ADR-008-observability/README.md)
- [Obsidian and documentation](decisions/ADR-009-documentation/README.md)
- [Security and privacy controls](decisions/ADR-010-security/README.md)
- [Build and release supply chain](decisions/ADR-011-build-release/README.md)
- [Service languages and frameworks](decisions/ADR-012-service-stacks/README.md)

## Service owner decision template

Before a domain implementation begins, record:

| Concern | Required decision |
|---|---|
| Requirements | Workload, data classification, availability, latency, accessibility and recovery needs |
| Component and version | Exact upstream, edition, extensions, dependencies and support horizon |
| License | License for code, models, data, fonts, icons, maps and bundled dependencies |
| Operations cost | Compute, storage, network, backups, support, staffing, on-call, training, energy, security review |
| Security | Threat model, identity, authorization, secrets, encryption, audit, incident response and recovery |
| Interoperability | API/event/schema standards, identifiers, export, compatibility, accessibility |
| Migration | Data export, schema evolution, replacement path, exit cost, decommissioning and retention |
| Ownership | Named accountable domain owner, service steward and operations contact |

Do not treat FOSS as cost-free or as a guarantee of security. Do not introduce a paid dependency without documenting its lock-in and exit plan. Use FOSS components with licenses compatible with deployment and distribution; source availability alone is not enough.

## Data and identity decision

No previous MVP code was present in the target repository. The earlier external planning notes mention React/Vite/Fastify/Prisma/Supabase/PostgreSQL, but those packages and schemas could not be inspected. Preserve them as candidates, not audited decisions. Compare PostgreSQL/PostGIS plus Keycloak to self-hosted Supabase only after domain ownership, data segregation, authentication needs, and operational skills are written down.

## Kafka operating commitment

Kafka is selected from the beginning. This creates real availability, security, schema, retention, replay, monitoring, and incident-response work. Development environments may use a compact setup; production must document its KRaft quorum and broker topology, backup/recovery, topic ACLs, event retention, disaster recovery, and failure testing. Kafka’s [KRaft operations guide](https://kafka.apache.org/40/operations/kraft/) explains controller quorum behavior; deployment-specific recovery objectives remain open.

## Container and Kubernetes gate

Start with OCI-compatible containers, reproducible builds, image signing, SBOMs, and a small number of deployment environments. Introduce Kubernetes when measured service count, scaling, availability, rollout, or isolation requirements exceed simpler operations capacity and a trained on-call team exists. Evaluate maintenance burden, patch cadence, control-plane availability, secrets, network policy, backup and portability before migration.

## Cost model

Budget for hosting, domains and certificates, storage, data transfer, backups, restore drills, identity delivery, event retention, logs and metrics, maps/tiles, accessibility and localization, security audits, legal review, support staff, on-call coverage, incident response, software maintenance, energy, and migration. FOSS avoids or changes license fees; it does not eliminate these costs.

## Open decisions

First deployment ownership, hosting region and operator model, exact storage/identity selection, event encoding, production Kafka topology, API edge, secrets management, backup objectives, map delivery, Kubernetes threshold, and project funding.

