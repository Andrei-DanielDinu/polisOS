# ADR 006 API and Event Contracts

## Status

Direction accepted: shared, versioned contracts are mandatory. Fastify route schemas document the first HTTP APIs; versioned JSON Schema files in Git define the first events. OpenAPI generation and a schema registry remain open.

## Decision context

Domain owners may choose internal languages and frameworks, but consumers must not depend on private tables or unversioned payloads. API and event changes need compatibility review and deprecation windows.

## License

OpenAPI is a specification. Avro is Apache-2.0; Apicurio Registry is Apache-2.0 ([upstream repository](https://github.com/Apicurio/apicurio-registry)). Check exact generator, client, plugin, and schema tooling licenses. JSON Schema and Protobuf are alternatives pending the same review.

## Hosting and operations cost

Budget schema registry availability, API documentation generation, compatibility checks in CI, contract review, compatibility testing, and support for multiple versions during migrations.

## Security

Contracts classify payloads and document personal-data fields. Never put secret tokens or sensitive narratives in schemas or event bodies. Enforce authorization separately from schema validity, and prevent overbroad scopes.

## Interoperability

Use OpenAPI for REST, stable identifiers, standard error structures, explicit units/timestamps/time zones, language-neutral payloads, and versioned event envelopes. Document idempotency, pagination, rate limits, and retention.

## Migration

Use additive changes when possible, maintain consumer inventories, deprecate with notice, provide compatibility adapters, and allow each service to export canonical records. Avoid global shared schema fields whose meaning is ambiguous across domains.

## Open questions

Avro/Apicurio selection, schema compatibility mode, API gateway, error taxonomy, identifier strategy, event envelope and deprecation windows.

