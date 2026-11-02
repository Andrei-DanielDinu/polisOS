# D12 Measurement and Evaluation

## 1. Purpose and outcomes

Define indicators and evaluate whether projects and services achieve stated outcomes, for whom, at what cost, and with what uncertainty or unintended effect.

## 2. Citizen experience

Public dashboards explain definitions and limits. People can challenge a measure, provide an optional experience report, and inspect revisions.

## 3. Roles, authority, and boundaries

Indicator stewards define methods; domain owners supply data; independent evaluators review causal claims; decision-makers determine action under lawful authority.

## 4. Workflow

Register question and theory of change → define baseline and measure → assess data quality and comparison → evaluate distribution and unintended effects → publish findings → update or retire indicator.

Domain feedback cycle: observe → qualify source and uncertainty → measure or record evidence → review with affected people → propose options → authorize through the responsible institution → deliver → evaluate effects and correct. A measurement can request review; it cannot itself exercise legal authority.

## 5. Observation register

| What is observed | Source and steward | Cadence and uncertainty | Allowed use and prohibited trigger |
|---|---|---|---|
| Aggregate public/institutional outcomes and approved opt-in reports; cadence appropriate to signal and data lag. Every metric states uncertainty, missingness, sampling, causal limits, and owner. | Named domain data steward and original source owner; affected people can submit corrections | Event-triggered for direct workflow and security records; source-native timing for institutional statistics; monthly freshness check; quarterly outcome review; annual independent method review. Preserve source-reported uncertainty, coverage gaps, measurement/sampling error, and revision lag. Safety issues follow the responsible authority's incident cadence. | Human review and aggregate planning only; a measurement cannot automatically sanction a person, deny a service, or allocate funds |

## 6. Data and privacy

Use the minimum data needed for this domain. Citizen-level submissions are opt-in, purpose-labeled, and separate from authentication records. Prefer public, institutional, operational, and aggregate sources. No default cross-link to personal government records. Classify each record, set access and retention, allow correction, and suppress unsafe small aggregates. Data from this domain must not be reused for employment, credit, benefits, policing, or public ranking unless a separately lawful and reviewed purpose is established.

## 7. Measures and feedback

Coverage and data quality; outcome trends; project benefit/cost; subgroup access where privacy permits; unintended effects; confidence and causal limitations.

Every indicator states definition, numerator/denominator where applicable, source, owner, geographic and population scope, update cadence, uncertainty, missingness, known confounders, revision policy, and the actions it may or may not support. Outcomes are reviewed with affected people and, for consequential decisions, an independent evaluator.

## 8. Failures, correction, and appeal

Metric gaming, changing denominator, delayed data, correlation misread as impact, or re-identification. Preserve versions, independent methodological review, correction and appeal; no metric alone triggers a sanction.

Provide a visible correction route, preserve provenance and revision history, and offer human review independent of the original decision when practicable. Publish a plain-language reason when a report is not accepted, a data item is corrected, or a workflow is stopped.

## 9. Integrations and contracts

All domains, D10 definitions, D13 audit, D15 scenarios and D17 budgets. Separate from D11 service telemetry and infrastructure monitoring.

Use shared API and event rules from [service architecture](../../architecture/README.md). Exchange only the minimum necessary fields. Events must carry schema version and purpose; personal content is stored behind authorization and referenced by an opaque identifier.

## 10. Delivery phases

Foundation: indicator registry and methods. First workflow: project baseline and close-out evaluation. Later: comparative programs and causal analysis.

## 11. Stack decision record

**Status: open for domain-owner selection.** The domain must remain independently deployable and conform to shared contracts.

No national-indicator analytics stack selected. Prometheus is a candidate for software telemetry only, not citizen or country outcomes. License: chosen analytics components pass FOSS and data-license review. Hosting/operations: statistical expertise, secure storage, and independent evaluation are recurring costs. Security: minimize row-level data, aggregate and suppress small cells. Interoperability: open definitions and exportable series. Migration: retain methods, code, and source lineage.

All selected components, versions, extensions, model weights, and datasets require a documented license and security review before adoption. Record hosting region, recurring operational burden, staffing, backup/recovery, export and replacement plan in the implementation ADR.

## 12. Open decisions

National indicator governance; independent evaluator funding; disaggregation thresholds; method for correcting revised official statistics.

## Proposed operating-picture indicator families

Shared dashboards should use separately governed series for:

| Family | Example indicator | Required context |
|---|---|---|
| Household affordability | Regional price distribution for a specified basket and period | Product grade, package/unit, tax, promotion, channel, sample design and household income context where lawfully available |
| Professional capacity | Licensed practitioners, filled posts, full-time equivalents or service hours by specialty and region | State which denominator is used; separate headcount from availability and avoid unsafe small cells |
| Work and skills | Verified open roles and training places by occupation/region | Listing source, active dates, skill taxonomy, duplicates, quality and expiry |
| Trade resilience | Import concentration and domestic transformation by product chain | Product code, unit, origin, scope, re-export treatment, confidential source and revision history |
| Service access | Waiting/access time by hour/day and region | Method, service hours, denied/abandoned visits, accessibility and demand coverage |
| Tourism | Seasonal visitor-flow and local service capacity | Counting method, time window, resident impacts and environmental pressure |

Do not collapse these into one “national performance” score. Each series needs a steward, definition, baseline, cadence, confidence/uncertainty, missingness, correction log, and an explicit list of decisions it may inform and decisions it cannot trigger. These families are detailed in the [national operating picture](../../system/operating-picture/README.md).

