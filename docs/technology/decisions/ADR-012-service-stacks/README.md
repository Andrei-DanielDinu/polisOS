# ADR 012 Service Languages and Frameworks

## Status

Accepted direction: polyglot services are allowed, and each domain owner chooses its internal stack under shared contracts. TypeScript with Fastify and Prisma is selected for the first workflow APIs; Python remains a candidate for data ingestion, analysis, simulation and assistive AI. Other domain owners choose their own language and framework.

## Decision context

Independent ownership should permit appropriate tools while avoiding unmaintainable diversity. Before a language is adopted, the service owner must show an operator, security maintenance, dependency health, contract compatibility, and migration/export path. The earlier repository audit found no code to reuse, so these are candidates rather than an evaluation of an existing implementation.

## License

Fastify is MIT licensed ([upstream license](https://github.com/fastify/fastify/blob/main/LICENSE)); Prisma ORM uses Apache-2.0 ([upstream repository](https://github.com/prisma/orm)). Verify exact versions, generators, plugins, client libraries and transitive dependencies. Python uses the PSF license; Python libraries must be reviewed individually. License compatibility with distribution and deployment is checked before release.

## Hosting and operations cost

Budget language-specific build images, package mirrors, dependency scanning, runtime support, observability, security patching, database migration management, training, and on-call coverage. Every additional runtime adds build, release, and incident expertise.

## Security

Use maintained versions, strict request validation, parameterized queries, safe serialization, dependency pinning, secret handling, signed build artifacts, and language-specific security scanning. Framework defaults do not replace threat modeling or access checks.

## Interoperability

All languages use the same OpenAPI, event, identity, error, observability, and data-classification contracts. Keep generated clients and schemas language-neutral. No domain reads another service’s database.

## Migration

Separate business rules from framework-specific adapters. Version schemas and APIs; export canonical records in documented formats. Maintain contract tests or equivalent compatibility checks for language rewrites and preserve event replay semantics.

## Open questions

Preferred first-service language based on operator capacity; Fastify/Prisma fit to actual domain workflows; Python support model; polyglot limit; dependency maintenance policy and long-term framework support.

