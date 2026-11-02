# D13 Transparency and Audit

## 1. Purpose and outcomes

Make public decisions, expenditure, project progress, institutional reporting, data provenance, and corrections inspectable while protecting private and sensitive material.

## 2. Citizen experience

People can see who decided, under what authority, what evidence was used, what changed, what remains disputed, and where to appeal.

## 3. Roles, authority, and boundaries

Decision owner publishes reasons; auditors review records independently; data stewards classify disclosure; privacy/security officers can block unsafe publication with a logged reason.

## 4. Workflow

Record action and evidence → classify and redact → publish safe record → preserve signed/versioned history → accept correction or appeal → independent audit.

Domain feedback cycle: observe → qualify source and uncertainty → measure or record evidence → review with affected people → propose options → authorize through the responsible institution → deliver → evaluate effects and correct. A measurement can request review; it cannot itself exercise legal authority.

## 5. Observation register

| What is observed | Source and steward | Cadence and uncertainty | Allowed use and prohibited trigger |
|---|---|---|---|
| Decision logs, budgets, procurement awards, project milestones, public reports, system change records, and appeals. At each decision or reporting period; auditor checks completeness, provenance and disclosure risk. | Named domain data steward and original source owner; affected people can submit corrections | Event-triggered for direct workflow and security records; source-native timing for institutional statistics; monthly freshness check; quarterly outcome review; annual independent method review. Preserve source-reported uncertainty, coverage gaps, measurement/sampling error, and revision lag. Safety issues follow the responsible authority's incident cadence. | Human review and aggregate planning only; a measurement cannot automatically sanction a person, deny a service, or allocate funds |

## 6. Data and privacy

Use the minimum data needed for this domain. Citizen-level submissions are opt-in, purpose-labeled, and separate from authentication records. Prefer public, institutional, operational, and aggregate sources. No default cross-link to personal government records. Classify each record, set access and retention, allow correction, and suppress unsafe small aggregates. Data from this domain must not be reused for employment, credit, benefits, policing, or public ranking unless a separately lawful and reviewed purpose is established.

## 7. Measures and feedback

Decision-record completeness; publication delay; correction time; contract milestone transparency; unresolved audit findings. These do not establish absence of corruption.

Every indicator states definition, numerator/denominator where applicable, source, owner, geographic and population scope, update cadence, uncertainty, missingness, known confounders, revision policy, and the actions it may or may not support. Outcomes are reviewed with affected people and, for consequential decisions, an independent evaluator.

## 8. Failures, correction, and appeal

Missing records, fabricated provenance, secrecy misuse, or disclosure of private data. Provide independent audit access, safe whistleblowing route, appeal of redaction and correction of false records.

Provide a visible correction route, preserve provenance and revision history, and offer human review independent of the original decision when practicable. Publish a plain-language reason when a report is not accepted, a data item is corrected, or a workflow is stopped.

## 9. Integrations and contracts

Institutions, public finance, governance, projects, identity security audit (separate restricted stream), and public interface.

Use shared API and event rules from [service architecture](../../architecture/README.md). Exchange only the minimum necessary fields. Events must carry schema version and purpose; personal content is stored behind authorization and referenced by an opaque identifier.

## 10. Delivery phases

Foundation: project and decision logs. First workflow: visible status and reasons. Later: procurement transparency and independent audit integrations.

## 11. Stack decision record

**Status: open for domain-owner selection.** The domain must remain independently deployable and conform to shared contracts.

No audit archive or transparency portal selected. License: FOSS components and record schemas reviewed. Hosting/operations: immutable retention, legal archives, auditor access and redaction staffing cost. Security: signatures and access controls; public and restricted logs separated. Interoperability: exportable signed records and open schemas. Migration: preserve hashes, signatures, timestamps, and readable formats independent of platform.

All selected components, versions, extensions, model weights, and datasets require a documented license and security review before adoption. Record hosting region, recurring operational burden, staffing, backup/recovery, export and replacement plan in the implementation ADR.

## 12. Open decisions

Public-records retention; who is an independent auditor; safe whistleblowing channel; challenge process for confidentiality redactions.

