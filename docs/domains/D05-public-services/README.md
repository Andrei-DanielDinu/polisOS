# D05 Public Services

## 1. Purpose and outcomes

Make service coverage, accessibility, quality, waiting, and improvement visible across healthcare, education, housing, transport, utilities, social protection, and public safety while keeping each service owner accountable.

## 2. Citizen experience

People can find service information, report an access issue voluntarily, request accommodation, and track a proposed improvement. They do not need to submit personal medical, school, benefit, or police records.

## 3. Roles, authority, and boundaries

Service institutions remain responsible for service decisions and case records. Affected users, professional groups, and independent inspectors can review aggregate performance and appeal service decisions through lawful channels.

## 4. Workflow

Describe service and eligibility rules → publish aggregate capacity and access measures → receive voluntary access issues → route to the service owner → record authorized response → measure aggregate outcomes.

Domain feedback cycle: observe → qualify source and uncertainty → measure or record evidence → review with affected people → propose options → authorize through the responsible institution → deliver → evaluate effects and correct. A measurement can request review; it cannot itself exercise legal authority.

## 5. Observation register

| What is observed | Source and steward | Cadence and uncertainty | Allowed use and prohibited trigger |
|---|---|---|---|
| Official service directories, published wait/access reports, budgets and outcomes, infrastructure data, and opt-in issue reports. Monthly/quarterly based on source; steward notes changing definitions, case mix, missingness, and local coverage. | Named domain data steward and original source owner; affected people can submit corrections | Event-triggered for direct workflow and security records; source-native timing for institutional statistics; monthly freshness check; quarterly outcome review; annual independent method review. Preserve source-reported uncertainty, coverage gaps, measurement/sampling error, and revision lag. Safety issues follow the responsible authority's incident cadence. | Human review and aggregate planning only; a measurement cannot automatically sanction a person, deny a service, or allocate funds |

## 6. Data and privacy

Use the minimum data needed for this domain. Citizen-level submissions are opt-in, purpose-labeled, and separate from authentication records. Prefer public, institutional, operational, and aggregate sources. No default cross-link to personal government records. Classify each record, set access and retention, allow correction, and suppress unsafe small aggregates. Data from this domain must not be reused for employment, credit, benefits, policing, or public ranking unless a separately lawful and reviewed purpose is established.

## 7. Measures and feedback

Access by geography and service type; waiting and resolution time; capacity and reliability; accessibility; user-reported experience with self-selection caveat. No individual service eligibility decision from these indicators.

Every indicator states definition, numerator/denominator where applicable, source, owner, geographic and population scope, update cadence, uncertainty, missingness, known confounders, revision policy, and the actions it may or may not support. Outcomes are reviewed with affected people and, for consequential decisions, an independent evaluator.

## 8. Failures, correction, and appeal

Misrouting, outdated eligibility, exposed health/minor details, or unresolved complaint. Provide source verification, correction, accessible service-specific appeal referral, privacy-safe reporting and independent inspection route.

Provide a visible correction route, preserve provenance and revision history, and offer human review independent of the original decision when practicable. Publish a plain-language reason when a report is not accepted, a data item is corrected, or a workflow is stopped.

## 9. Integrations and contracts

Institutions, process administration, infrastructure, human development, finance, measurement and citizen interface; integrations should carry aggregate service references, not person case files by default.

Use shared API and event rules from [service architecture](../../architecture/README.md). Exchange only the minimum necessary fields. Events must carry schema version and purpose; personal content is stored behind authorization and referenced by an opaque identifier.

## 10. Delivery phases

Foundation: directories and service standards. First workflow: one voluntary service-access issue type. Later: aggregate service reporting and owner integrations after legal/privacy impact review.

## 11. Stack decision record

**Status: open for domain-owner selection.** The domain must remain independently deployable and conform to shared contracts.

No common public-service case management stack selected. License: each vertical component reviewed individually; no proprietary dependency without explicit decision. Hosting/operations: service owners, support desks, translation and data quality are major costs. Security: health, child, housing and benefit data stay with authorized controllers. Interoperability: publish service metadata and aggregate measures. Migration: preserve definitions and source records; no forced case-data transfer.

All selected components, versions, extensions, model weights, and datasets require a documented license and security review before adoption. Record hosting region, recurring operational burden, staffing, backup/recovery, export and replacement plan in the implementation ADR.

## 12. Open decisions

Boundaries between service information and case decisions; data protection responsibilities; complaint routing; access for citizens without digital tools.

## Proposed service operations view

The national operating picture should connect service directories to aggregate access, capacity, operating hours, wait times, cancellations, accessibility and outcomes for healthcare, education, transport, housing, waste and social support. Each service owner publishes its own definition and safe aggregation; PolisOS does not merge patient, pupil, benefit or household records into a common person profile.

Public hours and frequencies can be compared with aggregate demand by hour/day/season. Any schedule change remains an option until the responsible service owner weighs user access, worker health and pay, care responsibilities, transit, cost and legal obligations. The [service-system model](../../system/operating-picture/README.md) specifies the shared process.

