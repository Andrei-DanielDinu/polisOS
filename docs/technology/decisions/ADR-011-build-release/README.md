# ADR 011 Build and Release Supply Chain

## Status

Open. Adopt reproducible and reviewable build and release practices before production deployment. Exact CI service, artifact registry, signing and scanning tools are not selected.

## Decision context

A service is only as trustworthy as its source, dependencies, build process, and deployed artifact. Domain teams can choose languages and frameworks, but a shared release process should preserve evidence and allow independent verification.

## License

No CI or registry software selected. Require FOSS for self-hosted tools and check runners, scanners, action plugins, base images, package registries, and build dependencies. A hosted Git platform may remain a repository location without making its proprietary automation the only release path.

## Hosting and operations cost

Budget build runners, storage and egress, artifact signing, package mirrors, dependency review, secret handling, SBOM generation, vulnerability response, release approvals, retention, and maintainers for each service language.

## Security

Pin actions and dependencies, isolate runners, avoid production secrets in pull requests, generate and sign artifacts, produce SBOMs, verify provenance at deployment, scan containers and packages, and define emergency patch and rollback procedures.

## Interoperability

Use standard source-control workflows, OCI artifacts, SPDX or CycloneDX SBOMs, Sigstore-compatible signing where appropriate, and language-native lockfiles. Keep build metadata accessible to independent auditors.

## Migration

Rebuild from tagged source, archive manifests and attestations, export artifacts, mirror dependencies where license permits, and retain rollback images. Keep deployment manifests independent of a single proprietary CI platform.

## Open questions

CI server and runner model, artifact registry, signing keys, release approval roles, vulnerability SLA, dependency mirror, language-specific build matrix, and retention.

