# D07 Supply Chains

## 1. Purpose and outcomes

Represent provenance and transformation steps from resource input to finished product and end user, including production, logistics, storage, reuse, imports, and exports, with clear gaps and uncertainty.

## 2. Citizen experience

People can inspect public product-chain examples, submit voluntary supplier or production facts, and report suspected gaps. Commercial or worker data are not public merely because transparency is desired.

## 3. Roles, authority, and boundaries

Each business or public body owns its submitted step; an independent verifier can attest claims; customs and regulators retain statutory authority. The platform distinguishes verified, self-reported, estimated, and unknown stages.

## 4. Workflow

Register product/batch → record input and origin → capture transformation, quantity and location → record custody/transport → publish safe chain view → reconcile losses, waste, reuse, import/export and end-of-life.

Domain feedback cycle: observe → qualify source and uncertainty → measure or record evidence → review with affected people → propose options → authorize through the responsible institution → deliver → evaluate effects and correct. A measurement can request review; it cannot itself exercise legal authority.

## 5. Observation register

| What is observed | Source and steward | Cadence and uncertainty | Allowed use and prohibited trigger |
|---|---|---|---|
| Voluntary company records, lawful import/export aggregates, procurement records, product standards, environmental data and third-party attestations. Event-driven for a participating chain; reviewer records sampling, mass-balance error, and unverified links. | Named domain data steward and original source owner; affected people can submit corrections | Event-triggered for direct workflow and security records; source-native timing for institutional statistics; monthly freshness check; quarterly outcome review; annual independent method review. Preserve source-reported uncertainty, coverage gaps, measurement/sampling error, and revision lag. Safety issues follow the responsible authority's incident cadence. | Human review and aggregate planning only; a measurement cannot automatically sanction a person, deny a service, or allocate funds |

## 6. Data and privacy

Use the minimum data needed for this domain. Citizen-level submissions are opt-in, purpose-labeled, and separate from authentication records. Prefer public, institutional, operational, and aggregate sources. No default cross-link to personal government records. Classify each record, set access and retention, allow correction, and suppress unsafe small aggregates. Data from this domain must not be reused for employment, credit, benefits, policing, or public ranking unless a separately lawful and reviewed purpose is established.

## 7. Measures and feedback

Chain coverage; traceability completeness; domestic transformation/value-added stages; import concentration; lead-time variability; repair/reuse/recycling; loss and waste. Show uncertainty and time scope.

Every indicator states definition, numerator/denominator where applicable, source, owner, geographic and population scope, update cadence, uncertainty, missingness, known confounders, revision policy, and the actions it may or may not support. Outcomes are reviewed with affected people and, for consequential decisions, an independent evaluator.

## 8. Failures, correction, and appeal

False provenance, trade-secret leakage, supplier exclusion, unsafe raw-resource locations, or manipulated chain-of-custody. Allow disputes, correction evidence, third-party audit, and confidential reporting routes.

Provide a visible correction route, preserve provenance and revision history, and offer human review independent of the original decision when practicable. Publish a plain-language reason when a report is not accepted, a data item is corrected, or a workflow is stopped.

## 9. Integrations and contracts

Economy, environment, public finance, agriculture, production, transport/logistics, diplomacy, product standards and procurement.

Use shared API and event rules from [service architecture](../../architecture/README.md). Exchange only the minimum necessary fields. Events must carry schema version and purpose; personal content is stored behind authorization and referenced by an opaque identifier.

## 10. Delivery phases

Foundation: data model and sample non-sensitive chain. First workflow: voluntary chain-mapping project. Later: industry-specific integrations with legal basis, commercial confidentiality and audit design.

## 11. Stack decision record

**Status: open for domain-owner selection.** The domain must remain independently deployable and conform to shared contracts.

No product-traceability platform selected. License: FOSS software requirement; verify any standard library and connector licenses. Hosting/operations: partner integration, verification, storage, and audit costs scale with chain depth. Security: per-field confidentiality, signed evidence, least-privilege supplier access. Interoperability: GS1/sector standards evaluated as standards, not required proprietary service. Migration: export full chain graph and provenance with open identifiers.

All selected components, versions, extensions, model weights, and datasets require a documented license and security review before adoption. Record hosting region, recurring operational burden, staffing, backup/recovery, export and replacement plan in the implementation ADR.

## 12. Open decisions

Define an atomic transformation record; standards for unit conversion; confidentiality vs public disclosure; verifier independence; imported inputs and re-export treatment.

## Proposed product and resource-chain view

The service should expose a product/batch timeline from resource origin to end user and end-of-life, with typed links for import, extraction, processing, assembly, transport, custody, sale, repair/reuse, recycling and waste. Each step records input/output quantities and units, method, period, evidence, owner, confidence, and whether it is self-reported, independently attested, estimated, or unknown. Mass-balance differences and missing links remain visible.

National analysis can aggregate origin concentration, critical-input dependence, domestic processing/value-added stages, export composition, lead time, resource use, waste and environmental effects. A public trace view may generalize facility locations and supplier identities; regulators and authorized auditors can receive more detail through separate legally reviewed access. Worker identity and schedules are not chain attributes.

Proposed events include `ProductionStepAttested.v1`, `ChainLinkCorrected.v1`, and `TradeAggregatePublished.v1`, owned and versioned by this service. See the [operating-picture service contracts](../../system/operating-picture/README.md).

