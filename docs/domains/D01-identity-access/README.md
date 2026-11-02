# D01 Identity and Access

## 1. Purpose and outcomes

Provide secure optional authentication, scoped authorization, account recovery, organisation identities, and consent records. Keep access to public information possible without creating an account.

## 2. Citizen experience

People choose an account only when a feature needs it. A login is not proof of Romanian citizenship or eligibility. Authentication details are isolated from optional civic profile fields.

## 3. Roles, authority, and boundaries

Identity operators administer authentication; service owners define the minimum scopes they need; citizens control optional profile and consent data. No service operator gets universal access by default.

## 4. Workflow

Register minimal account → authenticate → obtain a narrow scoped claim → authorize a single action → log the security event → review access and expire/revoke it.

Domain feedback cycle: observe → qualify source and uncertainty → measure or record evidence → review with affected people → propose options → authorize through the responsible institution → deliver → evaluate effects and correct. A measurement can request review; it cannot itself exercise legal authority.

## 5. Observation register

| What is observed | Source and steward | Cadence and uncertainty | Allowed use and prohibited trigger |
|---|---|---|---|
| Authentication and recovery events from the identity service; privileged-access logs from service operators; consent changes directly from the account owner. Never use broad national government records as default identity proof. | Named domain data steward and original source owner; affected people can submit corrections | Event-triggered for direct workflow and security records; source-native timing for institutional statistics; monthly freshness check; quarterly outcome review; annual independent method review. Preserve source-reported uncertainty, coverage gaps, measurement/sampling error, and revision lag. Safety issues follow the responsible authority's incident cadence. | Human review and aggregate planning only; a measurement cannot automatically sanction a person, deny a service, or allocate funds |

## 6. Data and privacy

Use the minimum data needed for this domain. Citizen-level submissions are opt-in, purpose-labeled, and separate from authentication records. Prefer public, institutional, operational, and aggregate sources. No default cross-link to personal government records. Classify each record, set access and retention, allow correction, and suppress unsafe small aggregates. Data from this domain must not be reused for employment, credit, benefits, policing, or public ranking unless a separately lawful and reviewed purpose is established.

## 7. Measures and feedback

Account recovery success and delay; authentication availability; privileged access review completion; consent withdrawal completion. Do not score or infer a person’s trustworthiness from login history.

Every indicator states definition, numerator/denominator where applicable, source, owner, geographic and population scope, update cadence, uncertainty, missingness, known confounders, revision policy, and the actions it may or may not support. Outcomes are reviewed with affected people and, for consequential decisions, an independent evaluator.

## 8. Failures, correction, and appeal

Recovery failure, lockout, impersonation, inaccessible proofing, or insider access can block participation. Provide human recovery, second-factor reset with review, security incident appeal, and a non-account route for public information.

Provide a visible correction route, preserve provenance and revision history, and offer human review independent of the original decision when practicable. Publish a plain-language reason when a report is not accepted, a data item is corrected, or a workflow is stopped.

## 9. Integrations and contracts

OIDC/OAuth2 tokens, short-lived service claims, audited consent events; never place secrets or personal profile content on Kafka.

Use shared API and event rules from [service architecture](../../architecture/README.md). Exchange only the minimum necessary fields. Events must carry schema version and purpose; personal content is stored behind authorization and referenced by an opaque identifier.

## 10. Delivery phases

Foundation: guest access, secure account and recovery, accessibility. First workflow: scoped project claims. Later: institutional identity federation only after legal and privacy review.

## 11. Stack decision record

**Status: open for wider domain scope; Keycloak OIDC is selected for first-workflow accounts.** The domain remains independently deployable and conforms to shared contracts.

Keycloak OIDC is selected for first-workflow accounts (Apache-2.0); OIDC/WebAuthn-compatible interfaces are preferred. License: verify exact deployment and extensions before production. Hosting/operations: database, backups, email/SMS recovery, monitoring, on-call and abuse response. Security: phishing-resistant MFA for privileged users, short token life, rate limits, no biometric default. Interoperability: OIDC and standard claims. Migration: portable subject IDs and consent export; credential migration may require safe re-authentication.

All selected components, versions, extensions, model weights, and datasets require a documented license and security review before adoption. Record hosting region, recurring operational burden, staffing, backup/recovery, export and replacement plan in the implementation ADR.

## 12. Open decisions

Account proofing level and supported recovery options; whether any use case needs legal identity proof; retention schedule for security logs.

