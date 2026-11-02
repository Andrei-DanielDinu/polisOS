# D16 Citizen Interface

## 1. Purpose and outcomes

Provide accessible entry points for public information, news, discussion, project workflows, progress, notifications, and user controls across devices and ability levels.

## 2. Citizen experience

Guest browsing where safe; clear Romanian language first with translation plan; screen-reader, keyboard, low-bandwidth and assisted routes; user-controlled notifications and visibility.

## 3. Roles, authority, and boundaries

Product team designs with users; moderators enforce published rules; service owners own content; accessibility reviewers test flows; no feed operator has policy authority.

## 4. Workflow

Discover → understand source and relevance → participate voluntarily → see status and source → correct, mute, report, appeal or exit.

Domain feedback cycle: observe → qualify source and uncertainty → measure or record evidence → review with affected people → propose options → authorize through the responsible institution → deliver → evaluate effects and correct. A measurement can request review; it cannot itself exercise legal authority.

## 5. Observation register

| What is observed | Source and steward | Cadence and uncertainty | Allowed use and prohibited trigger |
|---|---|---|---|
| Aggregate page/service telemetry and voluntarily submitted usability feedback. Monthly accessibility review and post-release analysis; exclude message content from telemetry and report sampling bias. | Named domain data steward and original source owner; affected people can submit corrections | Event-triggered for direct workflow and security records; source-native timing for institutional statistics; monthly freshness check; quarterly outcome review; annual independent method review. Preserve source-reported uncertainty, coverage gaps, measurement/sampling error, and revision lag. Safety issues follow the responsible authority's incident cadence. | Human review and aggregate planning only; a measurement cannot automatically sanction a person, deny a service, or allocate funds |

## 6. Data and privacy

Use the minimum data needed for this domain. Citizen-level submissions are opt-in, purpose-labeled, and separate from authentication records. Prefer public, institutional, operational, and aggregate sources. No default cross-link to personal government records. Classify each record, set access and retention, allow correction, and suppress unsafe small aggregates. Data from this domain must not be reused for employment, credit, benefits, policing, or public ranking unless a separately lawful and reviewed purpose is established.

## 7. Measures and feedback

Task completion and accessibility defects; source attribution coverage; appeal resolution time; latency and service reliability. No engagement-maximization or emotional profiling metric.

Every indicator states definition, numerator/denominator where applicable, source, owner, geographic and population scope, update cadence, uncertainty, missingness, known confounders, revision policy, and the actions it may or may not support. Outcomes are reviewed with affected people and, for consequential decisions, an independent evaluator.

## 8. Failures, correction, and appeal

Harassment, misinformation, recommender bias, inaccessible forms, notification overload, account exclusion or leakage. Provide moderation appeal, source correction, user controls and alternative assisted channels.

Provide a visible correction route, preserve provenance and revision history, and offer human review independent of the original decision when practicable. Publish a plain-language reason when a report is not accepted, a data item is corrected, or a workflow is stopped.

## 9. Integrations and contracts

All domains through documented APIs; identity for optional authentication; domain events for status and notifications.

Use shared API and event rules from [service architecture](../../architecture/README.md). Exchange only the minimum necessary fields. Events must carry schema version and purpose; personal content is stored behind authorization and referenced by an opaque identifier.

## 10. Delivery phases

Foundation: accessible public information. First workflow: problem reporting and tracking. Later: local feeds and domain dashboards with transparent relevance controls.

## 11. Stack decision record

**Status: open for wider domain scope; React/TypeScript/Vite is selected for the first workflow interface.** The domain remains independently deployable and conforms to shared contracts.

React, TypeScript and Vite are selected for the first workflow. License: React is MIT licensed; verify exact package and third-party asset licenses. Hosting/operations: content moderation, translation, accessibility testing, CDN and support cost. Security: XSS/CSRF protections, safe uploads, privacy-safe analytics. Interoperability: semantic HTML, stable URLs, OpenAPI-backed APIs. Migration: separate frontend from service APIs; export content and notification preferences.

All selected components, versions, extensions, model weights, and datasets require a documented license and security review before adoption. Record hosting region, recurring operational burden, staffing, backup/recovery, export and replacement plan in the implementation ADR.

## 12. Open decisions

Information architecture; moderation approach; languages and accessibility audits; feed ranking policy; mobile/PWA needs.

## Proposed national control-room interface

The citizen interface should provide a cross-domain overview and separate workspaces for debates/evidence; workforce capacity; cost-of-living prices; jobs and training; production/import/export chains; tourism; public-service schedules; and problem-to-project delivery. Each workspace shows source, update time, uncertainty, scope, correction path, and the responsible institution or data steward. A dashboard tile is a doorway to detail, not a substitute for a domain owner.

Deliberation supports adding arguments on both sides, attaching evidence, supporting an existing argument, rebuttal and correction. If AI-assisted review is enabled, the interface distinguishes a model suggestion from verified facts and lets users inspect cited text, model/version, uncertainty and appeal routes. Popularity does not equal truth.

The local app demonstrates these module boundaries using synthetic values and browser-local debate actions. Its pages must clearly state when there is no live data integration and must never present prototype values as current Romanian facts. Read the [operating picture](../../system/operating-picture/README.md).

