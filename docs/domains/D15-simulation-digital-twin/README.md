# D15 Simulation and Digital Twin

## 1. Purpose and outcomes

Compare possible futures and intervention options using explicit models, parameters, uncertainty, sensitivity, distributional effects, and limits.

## 2. Citizen experience

People can inspect assumptions and scenarios, propose alternative values, and understand why model outputs differ. No simulation is presented as a forecast certainty.

## 3. Roles, authority, and boundaries

Domain experts own model context; model maintainers version code and data; affected groups review assumptions; authorized officials decide outside the model.

## 4. Workflow

Define question → choose boundary and baseline → parameterize and calibrate → run scenarios and sensitivity → publish uncertainty and distribution → review evidence → retire or update model.

Domain feedback cycle: observe → qualify source and uncertainty → measure or record evidence → review with affected people → propose options → authorize through the responsible institution → deliver → evaluate effects and correct. A measurement can request review; it cannot itself exercise legal authority.

## 5. Observation register

| What is observed | Source and steward | Cadence and uncertainty | Allowed use and prohibited trigger |
|---|---|---|---|
| Aggregate public/institution data and synthetic or opt-in data only when authorized. Recalibration schedule follows source updates; independent reviewers document structural uncertainty and out-of-domain use. | Named domain data steward and original source owner; affected people can submit corrections | Event-triggered for direct workflow and security records; source-native timing for institutional statistics; monthly freshness check; quarterly outcome review; annual independent method review. Preserve source-reported uncertainty, coverage gaps, measurement/sampling error, and revision lag. Safety issues follow the responsible authority's incident cadence. | Human review and aggregate planning only; a measurement cannot automatically sanction a person, deny a service, or allocate funds |

## 6. Data and privacy

Use the minimum data needed for this domain. Citizen-level submissions are opt-in, purpose-labeled, and separate from authentication records. Prefer public, institutional, operational, and aggregate sources. No default cross-link to personal government records. Classify each record, set access and retention, allow correction, and suppress unsafe small aggregates. Data from this domain must not be reused for employment, credit, benefits, policing, or public ranking unless a separately lawful and reviewed purpose is established.

## 7. Measures and feedback

Scenario coverage; sensitivity; calibration error; uncertainty range; distribution of expected benefits and harms; comparison to observed outcomes.

Every indicator states definition, numerator/denominator where applicable, source, owner, geographic and population scope, update cadence, uncertainty, missingness, known confounders, revision policy, and the actions it may or may not support. Outcomes are reviewed with affected people and, for consequential decisions, an independent evaluator.

## 8. Failures, correction, and appeal

False precision, biased assumptions, hidden value choices, model drift, or inputs revealing people. Preserve versions, disclose limitations, provide alternative model review and stop unsupported claims.

Provide a visible correction route, preserve provenance and revision history, and offer human review independent of the original decision when practicable. Publish a plain-language reason when a report is not accepted, a data item is corrected, or a workflow is stopped.

## 9. Integrations and contracts

Measurement, AI support, economy, environment, infrastructure, finance, and governance option records.

Use shared API and event rules from [service architecture](../../architecture/README.md). Exchange only the minimum necessary fields. Events must carry schema version and purpose; personal content is stored behind authorization and referenced by an opaque identifier.

## 10. Delivery phases

Foundation: model registry and standards. First workflow: simple transparent option comparison. Later: sector simulations after calibration, independent review and data approval.

## 11. Stack decision record

**Status: open for domain-owner selection.** The domain must remain independently deployable and conform to shared contracts.

Python is a candidate language; no digital-twin platform selected. License: code, solver, model, and input-data licenses reviewed separately. Hosting/operations: compute, experts, data refresh and validation cost money. Security: isolated execution, resource limits, no raw citizen-data leakage. Interoperability: open input/output schemas and reproducible runs. Migration: export code, parameters, seeds, data lineage and results.

All selected components, versions, extensions, model weights, and datasets require a documented license and security review before adoption. Record hosting region, recurring operational burden, staffing, backup/recovery, export and replacement plan in the implementation ADR.

## 12. Open decisions

What counts as validated; which trade-off frames are displayed; uncertainty communication; independent model review owner.

