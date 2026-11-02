# D03 Governance

## 1. Purpose and outcomes

Support non-binding civic proposals and deliberation now, and document how authorized public decisions can be tracked. Election and national governance designs remain a future research and legal workstream.

## 2. Citizen experience

Citizens can read proposals and reasons, contribute voluntarily, compare options, see how comments were treated, and appeal moderation or process decisions.

## 3. Roles, authority, and boundaries

Facilitators manage participation under published rules; competent institutions decide within law; independent reviewers hear appeals. Platform polls and project votes are advisory unless law explicitly says otherwise.

## 4. Workflow

Publish question and authority → choose inclusive participation method → collect contributions → summarize disagreement and evidence → send to authorized body → record response and review.

Domain feedback cycle: observe → qualify source and uncertainty → measure or record evidence → review with affected people → propose options → authorize through the responsible institution → deliver → evaluate effects and correct. A measurement can request review; it cannot itself exercise legal authority.

## 5. Observation register

| What is observed | Source and steward | Cadence and uncertainty | Allowed use and prohibited trigger |
|---|---|---|---|
| Public proposal and decision records, volunteered comments, participation process data, and official decision publications. Collect only contributions people choose to submit; cadence per consultation; steward discloses self-selection and moderation uncertainty. | Named domain data steward and original source owner; affected people can submit corrections | Event-triggered for direct workflow and security records; source-native timing for institutional statistics; monthly freshness check; quarterly outcome review; annual independent method review. Preserve source-reported uncertainty, coverage gaps, measurement/sampling error, and revision lag. Safety issues follow the responsible authority's incident cadence. | Human review and aggregate planning only; a measurement cannot automatically sanction a person, deny a service, or allocate funds |

## 6. Data and privacy

Use the minimum data needed for this domain. Citizen-level submissions are opt-in, purpose-labeled, and separate from authentication records. Prefer public, institutional, operational, and aggregate sources. No default cross-link to personal government records. Classify each record, set access and retention, allow correction, and suppress unsafe small aggregates. Data from this domain must not be reused for employment, credit, benefits, policing, or public ranking unless a separately lawful and reviewed purpose is established.

## 7. Measures and feedback

Participation access by channel and region; response timeliness; themes with method caveats; unresolved appeals. Do not infer population opinion from a voluntary feed.

Every indicator states definition, numerator/denominator where applicable, source, owner, geographic and population scope, update cadence, uncertainty, missingness, known confounders, revision policy, and the actions it may or may not support. Outcomes are reviewed with affected people and, for consequential decisions, an independent evaluator.

## 8. Failures, correction, and appeal

Brigading, exclusion, moderation capture, ambiguous authority, or ignored consultation. Publish rules and reasons, provide accessible appeal, and record that no decision is legally binding unless authorized.

Provide a visible correction route, preserve provenance and revision history, and offer human review independent of the original decision when practicable. Publish a plain-language reason when a report is not accepted, a data item is corrected, or a workflow is stopped.

## 9. Integrations and contracts

Identity scopes, citizen interface, institution directory, public records, justice/process navigation and audit. Event contracts record process state, not an imagined grant of authority.

Use shared API and event rules from [service architecture](../../architecture/README.md). Exchange only the minimum necessary fields. Events must carry schema version and purpose; personal content is stored behind authorization and referenced by an opaque identifier.

## 10. Delivery phases

Foundation: consultation and decision log. First workflow: problem review and project authorization. Later: governance proposal research. Binding elections and executive selection are out of scope until legal and independent security review.

## 11. Stack decision record

**Status: open for domain-owner selection.** The domain must remain independently deployable and conform to shared contracts.

No governance workflow engine or voting system selected. License: exact component and rules-library licenses must pass FOSS review. Hosting/operations: moderation, facilitation, translation, legal review and security have recurring costs. Security: protect anonymity where needed, prevent coercion, separate identity from ballot if voting is ever proposed. Interoperability: publish open decision records and APIs. Migration: export consultation history and preserve legal record references.

All selected components, versions, extensions, model weights, and datasets require a documented license and security review before adoption. Record hosting region, recurring operational burden, staffing, backup/recovery, export and replacement plan in the implementation ADR.

## 12. Open decisions

Constitutional compatibility; candidate vetting independence; legal effect of each participation method; recall and succession design; minority protections.

