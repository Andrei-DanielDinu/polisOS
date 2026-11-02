# Earlier Planning Material Reconciliation

## Purpose

This README records how prior PolisOS planning notes were used in this repository. The source materials were adjacent to the clone and included several system blueprint drafts, an ontology, process catalog, workload plan, e-voting security note, citizen-development brainstorming document, governance decomposition PDF, and PolisOS DOCX brainstorm. The actual GitHub repository contained only a starter README, so no earlier application code or those adjacent files were present in the target repository.

## Retained concepts

- The control loop from real-world observation through outcomes and feedback.
- The D01–D20 domain names and domain-oriented system model.
- Atomic process/workflow descriptions, explicit states, events, failure modes, metrics, and appeals.
- Institution, role, officeholder, activity report, and recall concepts for future governance research.
- Supply chain provenance, infrastructure/environment constraints, public finance, institutional transparency, and offline resilience as long-term topics.
- Separation of platform information and coordination capabilities from government authority.
- Human rights, democratic legitimacy, due process, privacy, human appeal, and no autonomous AI sovereignty.

## Decisions updated to reflect this plan

| Earlier material | Current repository decision |
|---|---|
| One draft allows modular services first; later text says microservices-first | User selected independently deployable microservices from day one |
| Event broker appears as Kafka or RabbitMQ | User selected Kafka from the start |
| Service may begin as one deployable | User selected microservices from day one, with container-first runtime |
| Earlier MVP described as React/Vite, Fastify, Supabase/Postgres, Prisma, Vercel/Render | No such source was found in the target GitHub repository; retain as candidates pending an actual code audit |
| Prior draft recommends a small pilot jurisdiction | User selected national audience from day one; bounded, voluntary projects can still be piloted nationally |
| Prior ontology includes a biometric commitment field | Not adopted; conflicts with minimisation and requires a separate necessity, legal, threat, and consent case |
| Brainstorming proposes detailed health, family, dating, personality, and child-life records | Not part of the first release; dating and broad social graph are excluded; health and child data are high-risk and separate |
| Some drafts use skill scores, reputation, or leaderboards | No global citizen ranking; competence evidence applies only to a scoped role and is reviewable |
| Company hierarchy appears as a future inspiration | Project execution roles may borrow role clarity; national authority remains legally bounded and democratically legitimate |
| Open-data-by-default wording is broad | Publication is subject to privacy, safety, security, law, and re-identification review |

## Source-specific notes

- The richer system draft provides the D01–D20 map and domain ideas, but contains aspirational proposals and internal conflicts. This vault makes adopted decisions explicit and marks unresolved concepts open.
- The ontology and process catalog provide useful entity, event, saga, idempotency, and appeal patterns. Their entity fields are not automatically accepted as data collection requirements.
- The citizen-development brainstorming proposes sensitive profile fields, children’s developmental tracking, family relationships, dating, medical records, and public analytics. These are not carried forward as default functionality.
- The governance decomposition PDF records officeholder reporting and recall workflows. These are future governance research topics and do not make the first release a system of government.
- The e-voting security note is a useful threat-model input; online binding elections remain out of scope pending legal and independent security review.

## Audit facts and limitations

The GitHub repository had one starter README and no application code, package manifests, schemas, migrations, or service folders during the workspace audit. Thus the earlier MVP claim could not be confirmed or compared. This documents the audit boundary; it does not claim the code cannot exist in another repository or account.

The prior workspace paths are not canonical links from this repository. These READMEs should remain sufficient on their own and should not require adjacent planning files to interpret core decisions.

