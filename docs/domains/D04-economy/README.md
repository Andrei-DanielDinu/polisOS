# D04 Economy

## 1. Purpose and outcomes

Describe economic activity and compare options for resilient, broadly shared prosperity. Cover enterprises, cooperatives, employment, wages, agriculture, industry, production, services, tourism, consumption, trade, and investment without treating GDP or profit as the only objective.

## 2. Citizen experience

People and businesses may submit voluntary project ideas, needs, capabilities, and supply information. No employment, benefit, credit, or licensing decision uses a civic profile or problem-solving score.

## 3. Roles, authority, and boundaries

Businesses control their commercial records; institutions publish lawful aggregate statistics; labor and consumer representatives review policy impacts; authorized agencies retain their statutory roles.

## 4. Workflow

Observe sector conditions → compare productivity, resilience, access, labor, environmental and distributional outcomes → consult affected groups → simulate alternatives → refer decisions to lawful bodies → evaluate.

## Trade and circular-economy scenarios

One strategic scenario to evaluate is importing scarce or unprocessed resources and essential inputs, expanding domestic processing and repair/reuse capacity, and exporting higher-value finished products and services while retaining more value in local communities. Track domestic value added, import concentration, export composition, resource limits, labor conditions, environmental effects, affordability, and treaty obligations. Analyze how public and private spending circulates through the domestic economy, but do not assume that the platform can or should force cash to remain inside the country. Any fiscal, trade, procurement, or ownership policy is proposed for lawful decision by competent institutions and must include distributional and cross-border effects.

Domain feedback cycle: observe → qualify source and uncertainty → measure or record evidence → review with affected people → propose options → authorize through the responsible institution → deliver → evaluate effects and correct. A measurement can request review; it cannot itself exercise legal authority.

## 5. Observation register

| What is observed | Source and steward | Cadence and uncertainty | Allowed use and prohibited trigger |
|---|---|---|---|
| Official aggregate statistics, voluntary business/project submissions, public procurement and trade data, sector associations, and public surveys. Quarterly or source cadence; steward publishes coverage, revisions, unregistered activity, and informal-economy uncertainty. | Named domain data steward and original source owner; affected people can submit corrections | Event-triggered for direct workflow and security records; source-native timing for institutional statistics; monthly freshness check; quarterly outcome review; annual independent method review. Preserve source-reported uncertainty, coverage gaps, measurement/sampling error, and revision lag. Safety issues follow the responsible authority's incident cadence. | Human review and aggregate planning only; a measurement cannot automatically sanction a person, deny a service, or allocate funds |

## 6. Data and privacy

Use the minimum data needed for this domain. Citizen-level submissions are opt-in, purpose-labeled, and separate from authentication records. Prefer public, institutional, operational, and aggregate sources. No default cross-link to personal government records. Classify each record, set access and retention, allow correction, and suppress unsafe small aggregates. Data from this domain must not be reused for employment, credit, benefits, policing, or public ranking unless a separately lawful and reviewed purpose is established.

## 7. Measures and feedback

Domestic value added; productivity and wage distribution; SME/cooperative participation; employment quality; import concentration; tourism seasonality; accessibility and resilience. These are indicators, not automatic firm rankings.

Every indicator states definition, numerator/denominator where applicable, source, owner, geographic and population scope, update cadence, uncertainty, missingness, known confounders, revision policy, and the actions it may or may not support. Outcomes are reviewed with affected people and, for consequential decisions, an independent evaluator.

## 8. Failures, correction, and appeal

Market concentration, hidden conflicts, missing informal work, data manipulation, or one-sided productivity targets. Allow data corrections, worker and community review, independent evaluations, and human appeal.

Provide a visible correction route, preserve provenance and revision history, and offer human review independent of the original decision when practicable. Publish a plain-language reason when a report is not accepted, a data item is corrected, or a workflow is stopped.

## 9. Integrations and contracts

Supply chains, agriculture/environment, workforce/education, public finance, procurement, infrastructure, trade and diplomacy.

Use shared API and event rules from [service architecture](../../architecture/README.md). Exchange only the minimum necessary fields. Events must carry schema version and purpose; personal content is stored behind authorization and referenced by an opaque identifier.

## 10. Delivery phases

Foundation: publish aggregate data definitions. First workflow: local economic coordination problems. Later: sector analysis and voluntary production-chain pilots; policy instruments require lawful public processes.

## 11. Stack decision record

**Status: open for domain-owner selection.** The domain must remain independently deployable and conform to shared contracts.

No economic modeling or enterprise system selected. License: candidate models and dependencies require exact FOSS license review. Hosting/operations: sector datasets, analysis, domain expertise, and secure partner integrations cost money. Security: protect business secrets, wages and worker identity; publish only lawful aggregates. Interoperability: open statistical formats and stable sector codes. Migration: export raw submissions, definitions, and model assumptions without lock-in.

All selected components, versions, extensions, model weights, and datasets require a documented license and security review before adoption. Record hosting region, recurring operational burden, staffing, backup/recovery, export and replacement plan in the implementation ADR.

## 12. Open decisions

What metrics represent quality of life; treatment of informal economy; safeguards for workers; feasible scope for cash-flow and trade data.

## Proposed operating-picture services

The economy view has distinct read models for a comparable essential-goods/services basket; affordability context; verified vacancies and employer opportunities; specialist workforce capacity; business/cooperative and training directories; tourism seasonality; and production/trade flows. Do not blend their different source quality or update cycles into a single index.

The initial product basket should cover fuel, electricity, water, bread, pork, beef, tomatoes, potatoes, cabbage, carrots, waste disposal, public transport, rent, and ride-sharing. Each observation includes region, time, unit, product/service specification, quality, tax, promotion status, source, method, and revision. Individual receipt contributions are voluntary, minimized, and separable from identity; aggregation thresholds protect households and small businesses.

The [citizen household balance canvas](../../citizens/household-balance/README.md) is a personal, user-entered illustration of affordability and estimated domestic/external spending. It is not a representative price index, a verified supply-chain trace, national accounts, or evidence of capital flight. The domain must not receive household line items or link them to identity without a separate opt-in purpose and reviewed data contract.

Jobs and opportunities show active dates, verified publisher, skills, location, employment/training/project type, and application/source link. They are informational; PolisOS activity, debate stance, account profile, or problem-solving history must not become a hiring score. A national dashboard may inform scenario analysis; economic policy, public procurement, price controls, employment action and funding remain with competent legal institutions. See the [cross-domain service map](../../system/operating-picture/README.md).

