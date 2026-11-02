# D11 AI and Decision Support

## 1. Purpose and outcomes

Offer bounded assistance such as search, summarization, translation, anomaly triage and scenario comparison, with evidence links and human review.

## 2. Citizen experience

People are told when an automated system is involved, can inspect relevant sources, challenge an output, and reach a human. No model decides eligibility, rank, sanction, or public authority.

## 3. Roles, authority, and boundaries

Model owner documents purpose, training/evaluation data, limitations, version and incident plan; domain decision-maker remains accountable; independent reviewer tests harms.

## 4. Workflow

Define a bounded task → approve data and risk → evaluate on representative cases → disclose outputs and uncertainty → human checks source → correct/appeal → monitor drift or retire.

Domain feedback cycle: observe → qualify source and uncertainty → measure or record evidence → review with affected people → propose options → authorize through the responsible institution → deliver → evaluate effects and correct. A measurement can request review; it cannot itself exercise legal authority.

## 5. Observation register

| What is observed | Source and steward | Cadence and uncertainty | Allowed use and prohibited trigger |
|---|---|---|---|
| Only purpose-approved public or opt-in data; operational feedback must avoid sensitive inputs. Cadence at each model release and continuous safety monitoring; report coverage, false positives/negatives and distributional uncertainty. | Named domain data steward and original source owner; affected people can submit corrections | Event-triggered for direct workflow and security records; source-native timing for institutional statistics; monthly freshness check; quarterly outcome review; annual independent method review. Preserve source-reported uncertainty, coverage gaps, measurement/sampling error, and revision lag. Safety issues follow the responsible authority's incident cadence. | Human review and aggregate planning only; a measurement cannot automatically sanction a person, deny a service, or allocate funds |

## 6. Data and privacy

Use the minimum data needed for this domain. Citizen-level submissions are opt-in, purpose-labeled, and separate from authentication records. Prefer public, institutional, operational, and aggregate sources. No default cross-link to personal government records. Classify each record, set access and retention, allow correction, and suppress unsafe small aggregates. Data from this domain must not be reused for employment, credit, benefits, policing, or public ranking unless a separately lawful and reviewed purpose is established.

## 7. Measures and feedback

Task accuracy by subgroup where lawful; citation support; refusal/error rate; appeal overturn rate; model drift. No aggregate “AI confidence” as authority.

Every indicator states definition, numerator/denominator where applicable, source, owner, geographic and population scope, update cadence, uncertainty, missingness, known confounders, revision policy, and the actions it may or may not support. Outcomes are reviewed with affected people and, for consequential decisions, an independent evaluator.

## 8. Failures, correction, and appeal

Hallucination, biased coverage, data leakage, prompt injection, automation bias, vendor/model change, or absent explanation. Disable or roll back, preserve incident evidence, explain to affected users, and provide human appeal.

Provide a visible correction route, preserve provenance and revision history, and offer human review independent of the original decision when practicable. Publish a plain-language reason when a report is not accepted, a data item is corrected, or a workflow is stopped.

## 9. Integrations and contracts

Data/knowledge, measurement, simulation and citizen interface; model outputs are suggestions, not commands or Kafka authority events.

Use shared API and event rules from [service architecture](../../architecture/README.md). Exchange only the minimum necessary fields. Events must carry schema version and purpose; personal content is stored behind authorization and referenced by an opaque identifier.

## 10. Delivery phases

Foundation: inventory and governance rules only. First workflow: optional assistive search or summarization after evaluation. Later: bounded analytical tools. High-impact automated decisions are excluded.

## 11. Stack decision record

**Status: open for domain-owner selection.** The domain must remain independently deployable and conform to shared contracts.

Python and open model tooling are candidates, not selected. License: code, model weights, training data, and inference server each need separate FOSS/rights review. Hosting/operations: GPU, energy, safety testing and monitoring can dominate costs. Security: isolate prompts, prevent data exfiltration, inspect dependencies. Interoperability: model cards, portable evaluation sets and API abstraction. Migration: preserve prompts, datasets, weights rights, evaluation results and a human-only fallback.

All selected components, versions, extensions, model weights, and datasets require a documented license and security review before adoption. Record hosting region, recurring operational burden, staffing, backup/recovery, export and replacement plan in the implementation ADR.

## 12. Open decisions

Which tasks provide clear user value; model governance owner; evaluation thresholds; acceptable data and compute boundary.

## Proposed debate-review capability

The deliberation service may call a bounded D11 claim-review task. It returns structured, attributable suggestions for: checkable factual claims and candidate sources; unstated assumptions; possible causal or logical gaps; ad hominem/personal-attack text spans; citation relevance and age; uncertainty; and abstention reasons. It analyzes text and cited sources for a stated purpose, not the author’s character or political alignment.

Outputs must identify the model and version, separate fact-check status from reasoning feedback, link each finding to a text span/source, expose uncertainty, support correction and human appeal, and never issue a binding “truth score.” Endorsements and argument counts are not model inputs for deciding correctness. No inference may alter a person’s account, employment prospects, public benefits, project role, or public rank.

The first web implementation is a UI prototype with prewritten illustrative review labels and no model call. A real service remains a later, separately evaluated phase. See the [debate and operating-picture contract](../../system/operating-picture/README.md).

