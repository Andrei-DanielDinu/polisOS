# Roadmap and Acceptance

## Purpose and outcomes

The roadmap moves from a documented model to a useful service while keeping the intended audience nationally accessible. Every stage has explicit human authority, security, privacy, and operating requirements. A roadmap item is not a commitment to collect the data or exercise the powers described in a domain.

## Stages

| Stage | Scope | Exit condition |
|---|---|---|
| 0. Blueprint and contracts | Domain map, citizen safeguards, data/authority model, stack records, threat boundaries, event/API standards | Completed for the first workflow; domain-specific decisions remain open where marked |
| 1. Foundation | Nationally accessible public pages; minimal accounts for optional participation; accessibility and language baseline; service skeletons and shared contracts | Independent privacy/security review; backup and restore path; account recovery and appeal works; no unapproved data integration |
| 2. Civic workflow and control-room prototype | Keep problem-to-project workflow; demonstrate national overview, debates, workforce capacity, prices, jobs, trade chains, tourism and service schedules | Local UI only; every sample clearly marked fictional; no national feeds, AI inference or decisions claimed |
| 3. Deliberation and evidence service | Durable topics, pro/con arguments, sources, support, rebuttal, moderation, corrections, appeals; bounded AI review after evaluation | Domain contract and content rules; model findings are cited and contestable; human moderation/appeal; no AI verdict authority |
| 4. Source registry and indicator services | Stewarded source catalog and first approved aggregate product in each selected domain (prices, capacity, opportunities, supply chain, demand) | Source rights and quality checks; owner, cadence, uncertainty, correction process, safe aggregation and export per source |
| 5. Bounded institutional integrations | Selected local/sector pilots for services, economy, mobility, health, education, utilities and environment | Legal/security review, service agreement, published data gaps, trained operators and independent outcome evaluation |
| 6. Scenario analysis and continuous improvement | Compare service hours, workforce pipelines, affordability and supply resilience against measured outcomes | Human authorization, transparent assumptions, affected-group review, cost and distributional analysis, rollback/stop rules |
| 7. Governance research | Constitutional, legal, institutional, and public deliberation on future governance proposals | Independent legal analysis and democratic deliberation; no implementation based only on platform popularity or technical architecture |
| 6. Governance research | Constitutional, legal, institutional, and public deliberation on any future governance proposal | Independent legal analysis and democratic deliberation; no implementation based only on platform popularity or technical architecture |

The prior drafts proposed a small-jurisdiction pilot. The current choice is national audience from day one. These are compatible if national access is open from the first release while actual public-service delivery remains bounded, voluntary, and independently evaluated.

Each domain owner decides when to deploy that domain's service. Shared contracts and the problem-to-project workflow define integration needs, but domain owners retain rollout autonomy and can defer a service until its data, staffing, legal, and operational conditions are met.

## Technology decision gate

Before implementing a service, its owner records: requirements and boundaries; selected stack and rejected alternatives; FOSS license and third-party notices; hosting and recurring operating costs; skills and on-call burden; threat model; data categories and legal purpose; API/event compatibility; backup and recovery; migration and export; dependency health; and sunset/replacement plan.

## Acceptance checklist

- Every D01–D20 topic has a chapter and observation/feedback loop.
- The root README links every chapter.
- Citizen roles are scoped to a project or lawful institution and include appeal.
- Citizen-level data collection is opt-in and purpose-specific.
- Account-security data are separate from optional profile and civic data.
- No default linkage of individual government records is proposed.
- Service telemetry, national outcome indicators, and personal data are described separately.
- Every indicator identifies source, owner, cadence, uncertainty, scope, and allowed/prohibited triggers.
- Every control-room figure shows whether it is live, illustrative, stale, revised, or missing; demo figures cannot be mistaken for national statistics.
- Debate AI is disclosed as advisory, source-linked, uncertain, contestable, and human-reviewed; support counts are never correctness or citizen-performance scores.
- Workforce and time-planning views use institution-level or safe aggregates; named work schedules and citizen profiles are not collected by default.
- Price, vacancy, supply-chain and tourism records include provenance, units/time scope, coverage, privacy/commercial classification and a correction route.
- Mermaid source remains in Markdown; Canvas is supplemental.
- Each technology record covers license, hosting/operations cost, security, interoperability, and migration.
- No capability is described as implemented when it is only proposed.
- Application code begins only after the first workflow, shared contracts, and its stack gate are documented; this gate is complete for the local scaffold.

## Risks and open decisions

Microservices and Kafka require sustained operations, monitoring, upgrades, security response, and recovery expertise. They are accepted architectural preferences, but each service must justify its runtime burden and the system needs a funded operations plan. Other open items include accountable sponsors, legal review, language coverage, inclusion research, independent evaluation, and funding.

