# ADR 001 Runtime and Orchestration

## Status

Accepted direction: independently deployable services from day one, containers first, Kubernetes when needed. Exact runtime and orchestration tools remain open.

## Decision

Package services as portable OCI-compatible containers with reproducible builds. Keep service boundaries, data ownership, API/event contracts, health checks, and deployment metadata independent from any one orchestrator. Start with a small operating footprint and introduce Kubernetes only when availability, scale, rollout, or isolation evidence justifies its staffing and control-plane burden.

## License

No container engine or orchestration distribution selected. Evaluate the exact upstream and edition license; require FOSS components and audit all plugins and base images. OCI image format and Kubernetes APIs reduce coupling but do not guarantee a painless move.

## Hosting and operations cost

Budget compute, storage, network, registries, image scanning, backup, deployment automation, patching, on-call staff, cluster upgrades, certificates, secret management, and disaster recovery. Kubernetes can add control-plane and specialist staffing costs; it is not presumed to reduce total cost.

## Security

Pin and sign images; generate an SBOM; scan dependencies and base images; isolate workloads; rotate secrets; use least-privilege service identities; restrict egress; and maintain a rebuild path for compromised dependencies. Define trusted build provenance and incident response.

## Interoperability

Use OCI-compatible images, declarative configuration, documented environment contracts, OpenTelemetry instrumentation, and standard health/readiness checks. Avoid dependencies on a proprietary control plane or cloud-only service without an exit plan.

## Migration

Keep persistent data outside ephemeral container images. Store deployment and schema definitions as versioned text. Test restore and relocation between environments. Before Kubernetes adoption, define rollout, rollback, stateful workloads, storage classes, network policy, and control-plane failure handling.

## Open questions

Container engine, image registry, deployment automation, Kubernetes threshold, hosting operator, supported platforms, recovery objectives, and on-call capacity.

