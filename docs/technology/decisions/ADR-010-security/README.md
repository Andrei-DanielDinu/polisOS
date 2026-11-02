# ADR 010 Security and Privacy Controls

## Status

Security and privacy controls are mandatory shared requirements. Product selection for secrets, key management, audit, vulnerability handling, and incident tooling remains open.

## Decision context

Microservices and Kafka create multiple trust boundaries. Security controls should be interoperable and independently replaceable. No single vendor or platform should become the only route to identity, keys, audit evidence, or security incident handling.

## License

No specific security product selected. Require FOSS for adopted components and review exact licenses for secrets managers, scanners, audit stores, agents, and commercial extensions. Security standards and cryptographic formats are not software licenses.

## Hosting and operations cost

Budget identity and access review, key custody, vulnerability triage, patching, secure backups, independent tests, incident response, alerting, security staff and training. Security controls need named operators and coverage outside normal business hours for critical services.

## Security

Require MFA for privileged access, just-in-time elevation, secrets rotation, encryption in transit and at rest, key separation, least privilege, signed builds, protected audit trails, tested recovery, and an incident reporting channel. Threat models are reviewed per service and data class. No biometric citizen identity by default.

## Interoperability

Use standard OIDC, TLS, cryptographic signatures, SBOM formats, OpenTelemetry security-safe telemetry, and documented access policies. Keep policy decisions separate from tool-specific syntax where practical.

## Migration

Maintain exportable keys and audit records with controlled custody, tested key rotation, vendor-neutral policy inventories, and documented recovery procedures. Changing tools must not silently revoke citizens’ ability to access, correct, or appeal their own data.

## Open questions

Secrets manager, key custody, security event store, vulnerability disclosure process, independent audit owner, incident coverage, data classification, and recovery objectives.

