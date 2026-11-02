# ADR 014: National Operating Picture Service Boundaries

## Status

Proposed for review. The existing user decisions remain in force: independent domain services, polyglot implementation, Kafka from the start, FOSS components where possible, shared contracts, and container-first deployment. This record defines service candidates; it does not select a stack or authorize a data connection for every domain.

## Context

The product spans deliberation, source cataloging, measurement, professional capacity, prices, jobs, agriculture, trade, tourism and public-service operations. A single dashboard database or a single national-person graph would create unclear stewardship, broad access and difficult migration. The service boundary proposal keeps records with their domain owners and exposes only purpose-approved contracts and aggregates.

See the [national operating-picture specification](../../../system/operating-picture/README.md) for data entities, observation rules, workflow states, events and privacy boundaries.

## Decision

1. Keep each authoritative domain record and its schema in the owning independently deployable service.
2. Build the national control room as an approved aggregate/read model, with source freshness, provenance, uncertainty, classification and correction link preserved.
3. Route deliberation/argument records to D03, provenance and source records to D10, measurements to D12, and bounded AI review to D11. A D11 response is an advisory event and cannot authorize or advance a public decision.
4. Keep market/workforce/supply-chain/source connectors outside the first problem workflow until each source has a steward, legal/purpose basis, license, cadence, quality test, correction path and retention rule.
5. Require a service-specific stack record before implementation. The domain owner chooses language, framework and storage; no technology is selected solely because another service uses it.

## Candidate service map and technology gates

| Service | Owner | Candidate internal direction | License and operating cost | Security, interoperability and migration |
|---|---|---|---|---|
| Control-room UI/read model | D16 with D10/D12 | Existing React, TypeScript and Vite; FOSS HTTP clients and chart/map libraries reviewed individually | React MIT; verify exact dependency/asset licenses. Hosting, accessibility, localization, support and caching are recurring costs | Public aggregate cache only; no API secrets in browser. OpenAPI read contract; keep UI replaceable and exportable. Current data cards are synthetic |
| Deliberation and evidence | D03/D10 | Fastify/TypeScript with PostgreSQL/Prisma is a candidate matching the current scaffold; service owner must validate content/review workload | Fastify MIT and Prisma Apache-2.0 are documented candidates; database, moderation, storage and human review need operators | Strict content access, abuse controls and appeal. OpenAPI plus minimal Kafka facts; export topic/argument/source history without account credentials |
| AI claim review | D11 | Python inference/orchestration is a candidate; begin with evaluation harness and human rubric before model deployment | Python PSF license does not cover libraries, weights or training data; model licenses are individually checked. Compute, energy, evaluation and safety staffing are major costs | Isolate untrusted input, no personal cross-domain profile, return cited spans/model version/uncertainty/abstention. Preserve portable test corpora and human-only fallback |
| Source and indicator registry | D10/D12 | Owner-selected relational/catalog components; PostgreSQL and open metadata formats are candidates | Verify software and dataset terms; curation, revision review, archive and independent evaluation are paid operations | Stable definitions, source lineage, schema versioning, CSV/JSON export, correction and retirement history |
| Workforce capacity and opportunity listings | D09/D04 | Domain owner selects; PostgreSQL plus open occupation/qualification identifiers are candidates | Exact component and data licenses remain open; registry agreements and verification have ongoing cost | Aggregate before public read; suppress small cells; keep personal credentials with issuer/user; export taxonomy, listings and provenance |
| Price and affordability series | D04/D12 | Domain owner selects; relational time series and open units/product definitions are candidates | Exact FOSS and source-data licenses open; collection, quality review and regional coverage cost money | Unit/grade/tax/source/time normalization; no raw identifiable receipts in public read; export observations and corrections |
| Agriculture, production and trade chain | D04/D07/D08 | Domain owner selects; PostgreSQL and spatial extensions only if needed; event-backed chain history | Check each library, product standard, connector and partner dataset; verification and supplier integration costs scale with coverage | Protect trade secrets/workers/sites; publish safe aggregates; version chain links and provide full owner export |
| Tourism and service demand | D04/D05/D06 | Domain owner selects; spatial components such as PostGIS are candidates where justified | Open-source map/renderer licenses and tile hosting are reviewed; current map tiles and data feeds may have separate costs | Aggregate visitor/demand data; no individual movement history. Open geospatial/time-bucket formats; export source and method metadata |

The existing shared layer records cover PostgreSQL, Keycloak, Kafka, contracts, observability and container operations. Their license, hosting, security, interoperability and migration criteria remain applicable to each service.

## Contract and event direction

Use OpenAPI for synchronous reads and participant submissions. Kafka events carry minimal facts, schema version, purpose, classification, owner and retention. Proposed event names in the blueprint are not production contracts until consumers, replay behavior, idempotency, retention, access control and compatibility windows are approved.

The control-room read model consumes approved domain events or public/official aggregate APIs. It does not query domain databases directly and never treats a technical alert as an instruction to exercise public power.

## Consequences

Service autonomy allows distinct domain needs and operational ownership, but increases cost in deployments, schema governance, incident response, backups, staffing and end-to-end troubleshooting. Kafka adds durability and replay options alongside an operational burden. The rollout must be staged by readiness even when the public interface is nationally accessible.

The current web prototype includes the domain directory, debate UI and illustrative domain workspaces. It has no national data feeds, real AI model, price/market service, specialist registry, trade integration, or service-schedule integration.

## Revisit when

An owner proposes a real source integration, persistent debate service, model deployment, new data class, or regional production use. The service-specific ADR must add exact component versions, license evidence, hosting/operations budget, threat model, data agreement, performance/recovery requirements, API/event schemas, migration/export plan and retirement process.
