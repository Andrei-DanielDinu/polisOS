# D02 Institutions

## 1. Purpose and outcomes

Represent organisations and public institutions, mandates, accountable owners, responsibilities, service boundaries, reporting duties, and relationships without asserting that registration grants public power.

## 2. Citizen experience

Citizens can see who owns a service or project, its stated remit, reporting, and contact or appeal path. Private and civic entities decide whether to publish their profiles.

## 3. Roles, authority, and boundaries

Institutional stewards maintain records; a competent legal authority verifies legal mandate; auditors can review updates. The platform cannot create or dissolve an institution.

## 4. Workflow

Propose record → verify source and legal basis → publish mandate and owner → link services and budgets → report performance → correct or archive superseded record.

Domain feedback cycle: observe → qualify source and uncertainty → measure or record evidence → review with affected people → propose options → authorize through the responsible institution → deliver → evaluate effects and correct. A measurement can request review; it cannot itself exercise legal authority.

## 5. Observation register

| What is observed | Source and steward | Cadence and uncertainty | Allowed use and prohibited trigger |
|---|---|---|---|
| Published laws and registers, official institution publications, institution-submitted reports (clearly labeled), and project-owner updates. Review on source update and at least annually; stewards track gaps and uncertainty. | Named domain data steward and original source owner; affected people can submit corrections | Event-triggered for direct workflow and security records; source-native timing for institutional statistics; monthly freshness check; quarterly outcome review; annual independent method review. Preserve source-reported uncertainty, coverage gaps, measurement/sampling error, and revision lag. Safety issues follow the responsible authority's incident cadence. | Human review and aggregate planning only; a measurement cannot automatically sanction a person, deny a service, or allocate funds |

## 6. Data and privacy

Use the minimum data needed for this domain. Citizen-level submissions are opt-in, purpose-labeled, and separate from authentication records. Prefer public, institutional, operational, and aggregate sources. No default cross-link to personal government records. Classify each record, set access and retention, allow correction, and suppress unsafe small aggregates. Data from this domain must not be reused for employment, credit, benefits, policing, or public ranking unless a separately lawful and reviewed purpose is established.

## 7. Measures and feedback

Mandate coverage; report timeliness; unresolved ownership gaps; public response time. Counts do not measure institutional quality without context.

Every indicator states definition, numerator/denominator where applicable, source, owner, geographic and population scope, update cadence, uncertainty, missingness, known confounders, revision policy, and the actions it may or may not support. Outcomes are reviewed with affected people and, for consequential decisions, an independent evaluator.

## 8. Failures, correction, and appeal

Disputed or obsolete mandate, hidden ownership, duplicate bodies, or capture. Show source and version, allow affected institution and public correction, and escalate disputes to competent legal authority.

Provide a visible correction route, preserve provenance and revision history, and offer human review independent of the original decision when practicable. Publish a plain-language reason when a report is not accepted, a data item is corrected, or a workflow is stopped.

## 9. Integrations and contracts

Links to governance, processes, public finance, procurement, audit and service directories; publish InstitutionChanged events with source references.

Use shared API and event rules from [service architecture](../../architecture/README.md). Exchange only the minimum necessary fields. Events must carry schema version and purpose; personal content is stored behind authorization and referenced by an opaque identifier.

## 10. Delivery phases

Foundation: voluntary institution and service directory. First workflow: accountable project sponsor. Later: mandate and budget integration after authority validation.

## 11. Stack decision record

**Status: open for domain-owner selection.** The domain must remain independently deployable and conform to shared contracts.

No domain-specific registry product selected. FOSS license: require OSI-approved FOSS for deployed components and review schemas/data licenses. Hosting/operations: records store, document preservation, staffing and audit costs. Security: separate public material from restricted institutional contact or security data. Interoperability: stable organisation identifiers and open export. Migration: complete CSV/JSON/document export with source provenance.

All selected components, versions, extensions, model weights, and datasets require a documented license and security review before adoption. Record hosting region, recurring operational burden, staffing, backup/recovery, export and replacement plan in the implementation ADR.

## 12. Open decisions

Which legal source verifies mandate; correction authority; update service-level target; records-retention requirements.

