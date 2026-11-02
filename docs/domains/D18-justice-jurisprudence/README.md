# D18 Justice and Jurisprudence

## 1. Purpose and outcomes

Help people find public legal information, process steps, rights resources, legislative history, and appropriate appeal or legal-help routes without adjudicating cases.

## 2. Citizen experience

People can access accessible, versioned legal texts and non-personal procedural guidance. Sensitive case facts do not enter public forums by default.

## 3. Roles, authority, and boundaries

Courts and competent authorities decide cases; lawyers provide legal advice; publishers preserve official legal sources; the platform can organize references but not determine guilt, rights, or outcomes.

## 4. Workflow

Select jurisdiction and question → link current authoritative source → explain date and limits → direct to competent institution or independent assistance → track legal version change.

Domain feedback cycle: observe → qualify source and uncertainty → measure or record evidence → review with affected people → propose options → authorize through the responsible institution → deliver → evaluate effects and correct. A measurement can request review; it cannot itself exercise legal authority.

## 5. Observation register

| What is observed | Source and steward | Cadence and uncertainty | Allowed use and prohibited trigger |
|---|---|---|---|
| Official legislation and judgments where lawfully public, agency procedures, legal aid directories, and opt-in content corrections. Refresh on source publication; legal editor records jurisdiction, effective date, and translation uncertainty. | Named domain data steward and original source owner; affected people can submit corrections | Event-triggered for direct workflow and security records; source-native timing for institutional statistics; monthly freshness check; quarterly outcome review; annual independent method review. Preserve source-reported uncertainty, coverage gaps, measurement/sampling error, and revision lag. Safety issues follow the responsible authority's incident cadence. | Human review and aggregate planning only; a measurement cannot automatically sanction a person, deny a service, or allocate funds |

## 6. Data and privacy

Use the minimum data needed for this domain. Citizen-level submissions are opt-in, purpose-labeled, and separate from authentication records. Prefer public, institutional, operational, and aggregate sources. No default cross-link to personal government records. Classify each record, set access and retention, allow correction, and suppress unsafe small aggregates. Data from this domain must not be reused for employment, credit, benefits, policing, or public ranking unless a separately lawful and reviewed purpose is established.

## 7. Measures and feedback

Source freshness; citation completeness; update delay; broken-link rate; coverage of appeal guidance. No outcome prediction or individual justice risk score.

Every indicator states definition, numerator/denominator where applicable, source, owner, geographic and population scope, update cadence, uncertainty, missingness, known confounders, revision policy, and the actions it may or may not support. Outcomes are reviewed with affected people and, for consequential decisions, an independent evaluator.

## 8. Failures, correction, and appeal

Outdated translation, incorrect guidance, exposed case data, unauthorized practice, or harmful reliance. Show official source, effective date and scope, correction review, disclaimers appropriate to legal rules, and referral to qualified assistance.

Provide a visible correction route, preserve provenance and revision history, and offer human review independent of the original decision when practicable. Publish a plain-language reason when a report is not accepted, a data item is corrected, or a workflow is stopped.

## 9. Integrations and contracts

Governance, administration/process, transparency/audit, institutions and citizen interface; no direct case record ingestion.

Use shared API and event rules from [service architecture](../../architecture/README.md). Exchange only the minimum necessary fields. Events must carry schema version and purpose; personal content is stored behind authorization and referenced by an opaque identifier.

## 10. Delivery phases

Foundation: links to official law and institutions. First workflow: appeal contact on project decisions. Later: versioned procedural guidance after legal review.

## 11. Stack decision record

**Status: open for domain-owner selection.** The domain must remain independently deployable and conform to shared contracts.

No legal document platform or rules engine selected. License: software, legal texts, translations, and annotations have distinct rights. Hosting/operations: legal editorial review, archives, and localization cost money. Security: no public case files or sensitive party indexes. Interoperability: cite official identifiers and export citations. Migration: preserve source URI, version, effective date and correction history.

All selected components, versions, extensions, model weights, and datasets require a documented license and security review before adoption. Record hosting region, recurring operational burden, staffing, backup/recovery, export and replacement plan in the implementation ADR.

## 12. Open decisions

Editorial responsibility; legal advice boundary; court data access; translation process; legal versioning and archive.

