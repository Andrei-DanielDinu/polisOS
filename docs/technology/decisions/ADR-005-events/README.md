# ADR 005 Kafka Event Backbone

## Status

Accepted user direction: Apache Kafka from the start. Topic design, schemas, production topology, retention and operating procedures remain open.

## Decision

Use Kafka for durable asynchronous domain events. A domain event represents a fact that has occurred. It does not grant a public authority, command a person, or replace synchronous validation where the user needs an immediate answer.

## License

Apache Kafka is an Apache Software Foundation project; verify the exact distribution, client, connector, and bundled license notices before release. Keep connector selection separate because third-party plugins may use different licenses.

## Hosting and operations cost

Budget brokers and controllers, storage, replication, network, schema governance, monitoring, security operations, upgrades, backup/recovery, topic administration, incident response, and trained staff. Kafka from day one is an explicit operational commitment, not a free add-on.

## Security

Use TLS, client authentication, topic ACLs, data classification, minimal payloads, retention limits, encryption at rest, secret rotation, audit logs, and replay protections. Avoid personal or sensitive content in events; use opaque identifiers and authorization-checked reads.

## Interoperability

Use versioned schemas, documented topic ownership, compatibility rules, event envelopes, trace/correlation IDs, idempotent consumers, dead-letter handling, and at-least-once delivery semantics. Do not assume cross-domain exactly-once business outcomes.

## Migration and recovery

Document KRaft controller quorum and broker topology. The [KRaft operations guide](https://kafka.apache.org/40/operations/kraft/) describes controller majority behavior; determine production sizing and recovery objectives from actual availability requirements. Retain events only as long as purpose and replay needs justify. Support export/replay into a replacement broker and define dual-read/cutover procedures.

## Open questions

Avro/Apicurio versus JSON Schema or Protobuf; topic naming and ownership; event retention; replay authorization; production quorum; backup; disaster recovery; geo-replication; operator staffing.

