# D17 Public Finance

## 1. Purpose and outcomes

Make public budgets, appropriations, spending, procurement, transfers, and fiscal scenarios legible and traceable while preserving the authority of lawful treasuries and auditors.

## 2. Citizen experience

People can follow public allocations and project commitments, inspect contract milestones, compare budgets and outcomes, and report discrepancies without exposing personal payroll or bank details.

## 3. Roles, authority, and boundaries

Treasury and budget authorities own official accounts; procurement bodies and auditors retain statutory roles; institutions explain deviations; citizens and suppliers can appeal relevant decisions through lawful processes.

## 4. Workflow

Publish budget baseline → link authorized commitment and procurement → record milestone and payment evidence → reconcile allocation and execution → audit variance → explain correction or carry-forward.

Domain feedback cycle: observe → qualify source and uncertainty → measure or record evidence → review with affected people → propose options → authorize through the responsible institution → deliver → evaluate effects and correct. A measurement can request review; it cannot itself exercise legal authority.

## 5. Observation register

| What is observed | Source and steward | Cadence and uncertainty | Allowed use and prohibited trigger |
|---|---|---|---|
| Published budgets, procurement notices and awards, audited accounts, aggregate revenue/spending, and project reports. Monthly/quarterly; steward documents accounting basis, consolidation, timing and revisions. | Named domain data steward and original source owner; affected people can submit corrections | Event-triggered for direct workflow and security records; source-native timing for institutional statistics; monthly freshness check; quarterly outcome review; annual independent method review. Preserve source-reported uncertainty, coverage gaps, measurement/sampling error, and revision lag. Safety issues follow the responsible authority's incident cadence. | Human review and aggregate planning only; a measurement cannot automatically sanction a person, deny a service, or allocate funds |

## 6. Data and privacy

Use the minimum data needed for this domain. Citizen-level submissions are opt-in, purpose-labeled, and separate from authentication records. Prefer public, institutional, operational, and aggregate sources. No default cross-link to personal government records. Classify each record, set access and retention, allow correction, and suppress unsafe small aggregates. Data from this domain must not be reused for employment, credit, benefits, policing, or public ranking unless a separately lawful and reviewed purpose is established.

## 7. Measures and feedback

Budget execution; procurement competition and amendments; payment delay; project cost/schedule variance; distribution by service and region. No automatic spending reallocation or person-level financial scoring.

Every indicator states definition, numerator/denominator where applicable, source, owner, geographic and population scope, update cadence, uncertainty, missingness, known confounders, revision policy, and the actions it may or may not support. Outcomes are reviewed with affected people and, for consequential decisions, an independent evaluator.

## 8. Failures, correction, and appeal

Double counting, opaque amendments, false invoice evidence, incomplete off-budget entities, or personal-data exposure. Preserve official sources, independent audit, supplier challenge, and reasoned corrections.

Provide a visible correction route, preserve provenance and revision history, and offer human review independent of the original decision when practicable. Publish a plain-language reason when a report is not accepted, a data item is corrected, or a workflow is stopped.

## 9. Integrations and contracts

Institutions, economy, project workflow, procurement, transparency/audit, measurement and legal records.

Use shared API and event rules from [service architecture](../../architecture/README.md). Exchange only the minimum necessary fields. Events must carry schema version and purpose; personal content is stored behind authorization and referenced by an opaque identifier.

## 10. Delivery phases

Foundation: publish documents and machine-readable budget data. First workflow: project budget and funding gate. Later: procurement and execution reconciliation with authorized systems.

## 11. Stack decision record

**Status: open for domain-owner selection.** The domain must remain independently deployable and conform to shared contracts.

No finance ledger or treasury integration selected. License: FOSS and dataset terms reviewed; official accounting software may have separate legal constraints. Hosting/operations: secure archives, reconciliation experts and audit access cost money. Security: restrict account/payee data and segregate finance duties. Interoperability: open budget and procurement schemas. Migration: read-only source references, exportable ledgers and preserved audit trails.

All selected components, versions, extensions, model weights, and datasets require a documented license and security review before adoption. Record hosting region, recurring operational burden, staffing, backup/recovery, export and replacement plan in the implementation ADR.

## 12. Open decisions

Budget classification; legal authorization; publication boundary; procurement and commitment identifiers; non-budgetary entity coverage.

## Proposed project-to-outcome budget view

Where a lawful public source exists, the dashboard may link a decision and authorized budget line to a procurement, contract, payment/execution stage, delivery milestone and measured outcome. Distinguish appropriation, commitment, invoice, payment, and actual service output. Publish source freshness, revisions, canceled procurements, and audit findings.

The view is read-only and cannot approve a transfer or release funds. Procurement transparency must protect legally confidential, personal, security-sensitive and genuinely proprietary information while exposing the public decision and its accountable owner. The cross-domain lifecycle is in the [operating-picture blueprint](../../system/operating-picture/README.md).

The [citizen household balance canvas](../../citizens/household-balance/README.md) accepts a manual tax/contribution amount only. It does not calculate liability, determine eligibility, or transmit individual financial data to this domain.

