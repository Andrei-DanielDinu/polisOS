# D14 Process and Administration

## 1. Purpose and outcomes

Describe administrative procedures, applications, permits, workforce enrollment, case routing, deadlines, obligations, notices, corrections, appeals, and service handoffs.

## 2. Citizen experience

Citizens can understand requirements, submit minimum necessary information, track status, correct errors, get help, and appeal a decision through the responsible authority.

## 3. Roles, authority, and boundaries

Process owners define lawful steps; case workers decide within delegated authority; independent administrative or judicial routes review contested outcomes. Software validates completeness but does not create legal rules.

## 4. Workflow

Publish current rule and owner → accept request → validate completeness → route to authorized decision-maker → issue reasoned notice → fulfill or appeal → close with records.

Domain feedback cycle: observe → qualify source and uncertainty → measure or record evidence → review with affected people → propose options → authorize through the responsible institution → deliver → evaluate effects and correct. A measurement can request review; it cannot itself exercise legal authority.

## 5. Observation register

| What is observed | Source and steward | Cadence and uncertainty | Allowed use and prohibited trigger |
|---|---|---|---|
| Published procedures, anonymized service timing, process events, and voluntary usability reports. Update on rule change; quarterly process review; steward reports data lag, exceptions, and local practice differences. | Named domain data steward and original source owner; affected people can submit corrections | Event-triggered for direct workflow and security records; source-native timing for institutional statistics; monthly freshness check; quarterly outcome review; annual independent method review. Preserve source-reported uncertainty, coverage gaps, measurement/sampling error, and revision lag. Safety issues follow the responsible authority's incident cadence. | Human review and aggregate planning only; a measurement cannot automatically sanction a person, deny a service, or allocate funds |

## 6. Data and privacy

Use the minimum data needed for this domain. Citizen-level submissions are opt-in, purpose-labeled, and separate from authentication records. Prefer public, institutional, operational, and aggregate sources. No default cross-link to personal government records. Classify each record, set access and retention, allow correction, and suppress unsafe small aggregates. Data from this domain must not be reused for employment, credit, benefits, policing, or public ranking unless a separately lawful and reviewed purpose is established.

## 7. Measures and feedback

Processing time by stage; incomplete application rate; handoff failures; appeal rate and outcome; accessibility. Never use these measures to automatically reject a person.

Every indicator states definition, numerator/denominator where applicable, source, owner, geographic and population scope, update cadence, uncertainty, missingness, known confounders, revision policy, and the actions it may or may not support. Outcomes are reviewed with affected people and, for consequential decisions, an independent evaluator.

## 8. Failures, correction, and appeal

Lost applications, silent delay, conflicting rule versions, automation error, or inaccessible appeal. Keep versioned notices, human contact, correction and escalation, auditable case access, and legal challenge path.

Provide a visible correction route, preserve provenance and revision history, and offer human review independent of the original decision when practicable. Publish a plain-language reason when a report is not accepted, a data item is corrected, or a workflow is stopped.

## 9. Integrations and contracts

Institutions, governance, justice, public services, identity, event workflows, and audit.

Use shared API and event rules from [service architecture](../../architecture/README.md). Exchange only the minimum necessary fields. Events must carry schema version and purpose; personal content is stored behind authorization and referenced by an opaque identifier.

## 10. Delivery phases

Foundation: publish procedures and owners. First workflow: problem intake. Later: selected administrative process support only with legal owner and privacy review.

## 11. Stack decision record

**Status: open for wider domain scope; Fastify/TypeScript with Prisma is selected for the first workflow APIs.** The domain remains independently deployable and conforms to shared contracts.

No process engine selected. License: FOSS BPMN/workflow tools may be evaluated, with exact current license and feature edition checked before adoption. Hosting/operations: process mapping, service support, legal maintenance and uptime cost. Security: case data isolated per authority and purpose. Interoperability: open API/event contracts and official records links. Migration: portable process definitions and case history; avoid proprietary rule syntax.

All selected components, versions, extensions, model weights, and datasets require a documented license and security review before adoption. Record hosting region, recurring operational burden, staffing, backup/recovery, export and replacement plan in the implementation ADR.

## 12. Open decisions

Which process is first; authoritative legal rule source; notice and record requirements; case management responsibility.

