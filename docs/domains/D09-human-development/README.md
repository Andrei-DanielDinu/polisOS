# D09 Human Development

## 1. Purpose and outcomes

Support access and opportunity across education, skills, health services, life stages, caregiving, workforce participation, inclusion, and lifelong learning without building a unified personal life dossier.

## 2. Citizen experience

People may find learning and health service information, request accommodation, keep an optional skills portfolio, and volunteer for a project using relevant evidence. No school, employer, insurer, or agency gets an automatic profile feed.

## 3. Roles, authority, and boundaries

Schools, universities, healthcare providers, employers, and public agencies retain their lawful duties and records. Individuals control optional portfolio contributions; professionals review domain-specific claims.

## 4. Workflow

Publish service pathway → identify aggregate access or skills gap → invite affected people and practitioners → design options → route to service owner → evaluate access and outcome without ranking individuals.

Domain feedback cycle: observe → qualify source and uncertainty → measure or record evidence → review with affected people → propose options → authorize through the responsible institution → deliver → evaluate effects and correct. A measurement can request review; it cannot itself exercise legal authority.

## 5. Observation register

| What is observed | Source and steward | Cadence and uncertainty | Allowed use and prohibited trigger |
|---|---|---|---|
| Official aggregate enrollment, completion, workforce and service access statistics; public qualifications; voluntary skill evidence and user reports. Termly/annual statistics and user-controlled updates; stewards report selection bias, changing definitions and case mix. | Named domain data steward and original source owner; affected people can submit corrections | Event-triggered for direct workflow and security records; source-native timing for institutional statistics; monthly freshness check; quarterly outcome review; annual independent method review. Preserve source-reported uncertainty, coverage gaps, measurement/sampling error, and revision lag. Safety issues follow the responsible authority's incident cadence. | Human review and aggregate planning only; a measurement cannot automatically sanction a person, deny a service, or allocate funds |

## 6. Data and privacy

Use the minimum data needed for this domain. Citizen-level submissions are opt-in, purpose-labeled, and separate from authentication records. Prefer public, institutional, operational, and aggregate sources. No default cross-link to personal government records. Classify each record, set access and retention, allow correction, and suppress unsafe small aggregates. Data from this domain must not be reused for employment, credit, benefits, policing, or public ranking unless a separately lawful and reviewed purpose is established.

## 7. Measures and feedback

Access and completion by region; qualification-to-opportunity pathways; workforce participation and job quality; health service access; accommodation fulfillment. No composite life score, pupil ranking or individual employability prediction.

Every indicator states definition, numerator/denominator where applicable, source, owner, geographic and population scope, update cadence, uncertainty, missingness, known confounders, revision policy, and the actions it may or may not support. Outcomes are reviewed with affected people and, for consequential decisions, an independent evaluator.

## 8. Failures, correction, and appeal

Discrimination, leaked health/disability data, coercive portfolio sharing, or inaccurate credential claim. Separate health from general profile, allow correction, route disputes to the issuer, and provide an independent appeal.

Provide a visible correction route, preserve provenance and revision history, and offer human review independent of the original decision when practicable. Publish a plain-language reason when a report is not accepted, a data item is corrected, or a workflow is stopped.

## 9. Integrations and contracts

Public services, economy, identity, education and health providers via federated metadata only, measurement, accessibility, and process administration.

Use shared API and event rules from [service architecture](../../architecture/README.md). Exchange only the minimum necessary fields. Events must carry schema version and purpose; personal content is stored behind authorization and referenced by an opaque identifier.

## 10. Delivery phases

Foundation: directories and aggregate service measures. First workflow: education/workforce barrier proposals. Later: optional skills portfolio. Personal health record features and child development tracking are not in scope.

## 11. Stack decision record

**Status: open for domain-owner selection.** The domain must remain independently deployable and conform to shared contracts.

No health/education profile platform selected. License: FOSS gate for any supporting software; health/credential standards reviewed. Hosting/operations: specialist clinical/legal review and institutional integrations are costly. Security: sensitive records remain with authorized controllers, strict separation, no bulk linkage. Interoperability: portable credentials and service metadata evaluated. Migration: user-exportable portfolio; no central health-history import.

All selected components, versions, extensions, model weights, and datasets require a documented license and security review before adoption. Record hosting region, recurring operational burden, staffing, backup/recovery, export and replacement plan in the implementation ADR.

## 12. Open decisions

Health and education data legal basis; minor participation rules; credential verification necessity; workforce measures that avoid surveillance.

## Proposed workforce and specialist-capacity views

Separate the measure being reported: licensed professionals, practicing headcount, filled posts, full-time equivalents, paid hours, service appointments, or volunteered project availability. Maintain occupation and specialty taxonomies, region and time period, qualification source, coverage, and update cadence. Health-specialty data stays with the responsible registry or provider; public views use safe aggregates and do not expose a named practitioner’s work pattern.

Connect aggregate qualification and training flows to independently published job listings and employer skills demand so graduates can explore possible pathways. Keep personal credentials and portfolios user-controlled; an institution must not gain access merely because its data appears in a national dashboard.

Public opening hours may be planned using anonymized service transactions, published capacity, and voluntary aggregate time-use research. Do not routinely collect named people’s employer schedules or attempt to infer leisure from personal accounts, movement, or phone activity. Review effects on care work, worker health, night/weekend premiums, transport availability and service access before changing a schedule. See the [operating-picture contracts](../../system/operating-picture/README.md).

