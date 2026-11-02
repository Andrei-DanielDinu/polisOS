# Shared API and Event Contracts

This package contains language-neutral JSON Schema event definitions and TypeScript event types for the first workflow. API services own their REST endpoints and data models. Contracts describe cross-service facts and must be versioned before incompatible changes.

## Current events

- Problem status changed, version 1: problem reference, status, sector and region. Title and summary are included only after a reviewer publishes the report into discussion; unpublished reports never send their text in Kafka events.
- Project proposed, version 1: project and problem IDs and proposed state.
- Project authorized, version 1: project and problem IDs and active state.

Events must not include email, legal name, health details, free-form private narratives, access tokens, or hidden citizen scores. Consumers deduplicate by event ID. Delivery is at least once; outbox publication and consumer processing are idempotent.

## Stack

TypeScript types are convenience only; JSON Schema is the language-neutral contract. FOSS license for all dependencies is checked at selection. The package has no runtime dependencies. Events are stored in Kafka, and the schema registry remains open for a later operational decision. Migration retains schema versions and event IDs.

