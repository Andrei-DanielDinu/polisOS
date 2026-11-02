# Problem Review Service

This independently deployable D14 workflow service owns problem reports, evidence, proposed options, review transitions, and appeals. It publishes only public-safe status events. Authentication and optional accounts are handled by Keycloak; the service stores only an opaque subject identifier.

## Local operation

Run through the repository compose stack. The development container applies the Prisma schema on startup; production must use reviewed migrations, managed credentials, backups, secure Kafka ACLs, and an independent deployment plan.

## Authority and privacy

Anyone can browse public or pseudonymous reports after a reviewer moves them into discussion. New and triage-stage reports remain visible only to their author and reviewers; private reports remain restricted at every stage. An authenticated person can submit only after confirming the purpose and visibility. Reviewer actions require a Keycloak reviewer role and record reason, prior state, next state, and reviewer subject. Appeal decisions require a reviewer independent of both the filer and original reviewers. The API does not make a public decision or verify legal authority.

## Observation and measures

The service observes its own workflow states, timestamps, correction and appeal records, and Kafka outbox health. Kafka status events omit titles and summaries until a report is published for discussion, and private reports never produce events. Operational telemetry does not include report bodies or identity tokens. Measures cover stage latency, transitions, failure rates, privacy incidents, and appeal outcomes; they do not score citizens.

## Stack and operations

Fastify and Prisma are MIT and Apache-2.0 respectively; PostgreSQL has its own license; Kafka is Apache-2.0. Hosting and operations include database backup/restore, Kafka delivery, security patching, reviewer support, and incident response. APIs and events use versioned contracts. Migration exports problems, evidence, options, reviews, appeals, and outbox IDs with provenance.

