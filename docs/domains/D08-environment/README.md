# D08 Environment

## 1. Purpose and outcomes

Track environmental pressures, resource extraction, land, water, biodiversity, pollution, emissions, waste, circularity, and restoration to inform lawful choices and public accountability.

## 2. Citizen experience

Residents may submit observations or photos voluntarily with location controls; communities can review environmental plans and responses. Personal location histories are not collected.

## 3. Roles, authority, and boundaries

Environmental agencies, licensed operators, researchers, land managers and independent labs have distinct roles. Only lawful authorities issue permits or enforcement actions.

## 4. Workflow

Observe pressure and baseline → validate source and method → assess cumulative effects and affected communities → compare alternatives → refer to competent authority → track mitigation and recovery.

Domain feedback cycle: observe → qualify source and uncertainty → measure or record evidence → review with affected people → propose options → authorize through the responsible institution → deliver → evaluate effects and correct. A measurement can request review; it cannot itself exercise legal authority.

## 5. Observation register

| What is observed | Source and steward | Cadence and uncertainty | Allowed use and prohibited trigger |
|---|---|---|---|
| Official environmental monitoring, public permits and impact assessments, satellite/open geospatial data, institutional sensors, lab data and opt-in observations. Cadence varies from continuous sensor to annual survey; quality owner documents calibration, uncertainty and seasonal limits. | Named domain data steward and original source owner; affected people can submit corrections | Event-triggered for direct workflow and security records; source-native timing for institutional statistics; monthly freshness check; quarterly outcome review; annual independent method review. Preserve source-reported uncertainty, coverage gaps, measurement/sampling error, and revision lag. Safety issues follow the responsible authority's incident cadence. | Human review and aggregate planning only; a measurement cannot automatically sanction a person, deny a service, or allocate funds |

## 6. Data and privacy

Use the minimum data needed for this domain. Citizen-level submissions are opt-in, purpose-labeled, and separate from authentication records. Prefer public, institutional, operational, and aggregate sources. No default cross-link to personal government records. Classify each record, set access and retention, allow correction, and suppress unsafe small aggregates. Data from this domain must not be reused for employment, credit, benefits, policing, or public ranking unless a separately lawful and reviewed purpose is established.

## 7. Measures and feedback

Air/water quality; extraction/restoration area; emissions and waste flows; biodiversity indicators; permit compliance from official sources; uncertainty and geographic coverage. A measurement alone is not enforcement proof.

Every indicator states definition, numerator/denominator where applicable, source, owner, geographic and population scope, update cadence, uncertainty, missingness, known confounders, revision policy, and the actions it may or may not support. Outcomes are reviewed with affected people and, for consequential decisions, an independent evaluator.

## 8. Failures, correction, and appeal

Sensor drift, sparse coverage, greenwashing, unsafe site disclosure, or conflicting evidence. Preserve source, allow challenge and independent sampling, route enforcement to competent agency, publish correction history.

Provide a visible correction route, preserve provenance and revision history, and offer human review independent of the original decision when practicable. Publish a plain-language reason when a report is not accepted, a data item is corrected, or a workflow is stopped.

## 9. Integrations and contracts

Resource and production records, infrastructure, agriculture, supply chains, measurement, public finance, permitting and diplomacy.

Use shared API and event rules from [service architecture](../../architecture/README.md). Exchange only the minimum necessary fields. Events must carry schema version and purpose; personal content is stored behind authorization and referenced by an opaque identifier.

## 10. Delivery phases

Foundation: public data catalog and indicators. First workflow: local pollution or restoration problem. Later: carefully scoped sensor integrations and cumulative-impact modeling.

## 11. Stack decision record

**Status: open for domain-owner selection.** The domain must remain independently deployable and conform to shared contracts.

PostGIS/geospatial and open environmental data tooling are candidates; no domain platform selected. License: verify each tool, dataset and map layer. Hosting/operations: sensors, calibration, imagery and domain review have material costs. Security: protect sensitive species, private property, and vulnerable reporters. Interoperability: open geospatial and environmental observation standards. Migration: retain raw readings, calibration, methods and revised series.

All selected components, versions, extensions, model weights, and datasets require a documented license and security review before adoption. Record hosting region, recurring operational burden, staffing, backup/recovery, export and replacement plan in the implementation ADR.

## 12. Open decisions

Which datasets may be lawfully republished; sensor quality standards; cumulative-impact method; protected location rules.

