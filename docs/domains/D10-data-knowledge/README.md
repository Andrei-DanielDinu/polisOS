# D10 Data and Knowledge

## 1. Purpose and outcomes

Maintain reusable definitions, datasets, source provenance, evidence references, research outputs, public knowledge and correction histories.

## 2. Citizen experience

People can discover public evidence, check data lineage, contribute references, and propose corrections. Personal submissions are separately consented and access-limited.

## 3. Roles, authority, and boundaries

Data stewards maintain sources and definitions; researchers document methods; independent reviewers assess quality; source owners retain rights and duties.

## 4. Workflow

Register source → record license and provenance → validate structure and quality → publish approved data/definition → accept correction → version and archive.

Domain feedback cycle: observe → qualify source and uncertainty → measure or record evidence → review with affected people → propose options → authorize through the responsible institution → deliver → evaluate effects and correct. A measurement can request review; it cannot itself exercise legal authority.

## 5. Observation register

| What is observed | Source and steward | Cadence and uncertainty | Allowed use and prohibited trigger |
|---|---|---|---|
| Source metadata, public registers, institutional datasets, research, and opt-in contributions. Update cadence comes from each source; steward reports missingness, coverage, bias, and revision lag. | Named domain data steward and original source owner; affected people can submit corrections | Event-triggered for direct workflow and security records; source-native timing for institutional statistics; monthly freshness check; quarterly outcome review; annual independent method review. Preserve source-reported uncertainty, coverage gaps, measurement/sampling error, and revision lag. Safety issues follow the responsible authority's incident cadence. | Human review and aggregate planning only; a measurement cannot automatically sanction a person, deny a service, or allocate funds |

## 6. Data and privacy

Use the minimum data needed for this domain. Citizen-level submissions are opt-in, purpose-labeled, and separate from authentication records. Prefer public, institutional, operational, and aggregate sources. No default cross-link to personal government records. Classify each record, set access and retention, allow correction, and suppress unsafe small aggregates. Data from this domain must not be reused for employment, credit, benefits, policing, or public ranking unless a separately lawful and reviewed purpose is established.

## 7. Measures and feedback

Catalog coverage, metadata completeness, correction turnaround, source freshness and reproducibility. These measure the catalog, not truth or public trust.

Every indicator states definition, numerator/denominator where applicable, source, owner, geographic and population scope, update cadence, uncertainty, missingness, known confounders, revision policy, and the actions it may or may not support. Outcomes are reviewed with affected people and, for consequential decisions, an independent evaluator.

## 8. Failures, correction, and appeal

Outdated, mislicensed, decontextualized, manipulated, or re-identifying data. Provide takedown/correction review, preserve safe audit history, and state when a claim remains contested.

Provide a visible correction route, preserve provenance and revision history, and offer human review independent of the original decision when practicable. Publish a plain-language reason when a report is not accepted, a data item is corrected, or a workflow is stopped.

## 9. Integrations and contracts

Every domain via metadata contracts; D12 indicators; D13 audit; public APIs; research and open-data portals.

Use shared API and event rules from [service architecture](../../architecture/README.md). Exchange only the minimum necessary fields. Events must carry schema version and purpose; personal content is stored behind authorization and referenced by an opaque identifier.

## 10. Delivery phases

Foundation: source registry, definitions and provenance. First workflow: attach evidence and correct a source. Later: interoperable catalogs and research commons.

## 11. Stack decision record

**Status: open for domain-owner selection.** The domain must remain independently deployable and conform to shared contracts.

No catalog or metadata platform selected. License: candidate software and datasets require license-by-license checks. Hosting/operations: ingest, curation, review and archival storage require staff. Security: classify before publication and scan for personal/sensitive data. Interoperability: DCAT-style catalogs and open formats considered. Migration: portable metadata, resource files, checksums and version history.

All selected components, versions, extensions, model weights, and datasets require a documented license and security review before adoption. Record hosting region, recurring operational burden, staffing, backup/recovery, export and replacement plan in the implementation ADR.

## 12. Open decisions

Canonical vocabulary; dataset license policy; archival retention; correction and contested-claim policy.

## Product scope addition: evidence catalog for debates and system data

The public deliberation system needs a source catalog for arguments as well as domain datasets. A source entry records creator/steward, publication date, method, geographic and time scope, license, version, known limitations, language/accessibility, and a route to correction. A claim review points to the exact source and text span; the catalog does not convert a citation into proof or a database value into a complete picture.

The national operating picture also needs versioned definitions for prices, specialist capacity, job openings, production-chain events, tourism observations, and service-demand profiles. Read the [system services blueprint](../../system/operating-picture/README.md) for the shared observation envelope and source-owner boundaries.

