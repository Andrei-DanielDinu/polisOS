# Local Container Environment

This development stack starts PostgreSQL, Kafka in a single-node KRaft configuration, Keycloak, the problem-review API, the project-coordination API, and the React web interface.

## Start locally

1. Copy .env.example to .env and replace the local-only values.
2. From the repository root, run docker compose up --build.
3. Open http://localhost:5173. Keycloak runs at http://localhost:8080. APIs run on localhost ports 4101 and 4102.
4. Sign in to the imported local Keycloak realm with the seeded citizen example: username `demo.citizen`, password `PolisOS-Demo-Only-2026!`. This fixed credential is for loopback-only development and must never be used in a shared or production realm. You can also register a separate local test account.
5. For review controls, assign the reviewer realm role to a trusted test account in the local Keycloak admin console.
6. For authorization controls, assign project-owner only to an account used for a documented test authority. The application records the provided legal and funding references; it does not validate them.

The compose broker and identity realm are development-only. The one-node Kafka and Keycloak development mode have no production high availability. Do not expose these ports to a public network or reuse local credentials in shared environments. Local containers persist database and Kafka data in named volumes.

## Service boundaries

- PostgreSQL contains separate databases and credentials for the problem service, project service, and Keycloak.
- The project service consumes versioned problem status events and keeps its own reviewable-problem projection; it never reads the problem service database.
- Kafka is reachable only on the internal compose network by default.
- Host-facing web, API, and identity ports bind to loopback.
- APIs validate Keycloak tokens and redact authorization headers from request logs.

## Operations and migration

The local stack has no cost estimate and is not a production topology. Production needs secrets management, TLS, Kafka quorum design, database backup and restore drills, reviewed Prisma migrations, topic ACLs, signed images, observability, data retention, operator staffing, incident response, accessibility review, and a lawful institution responsible for every activated project.

Each service exports its data independently. The one-time PostgreSQL init script runs only for a fresh data volume; update schema with reviewed migrations rather than deleting volumes. Preserve backups before changing schema.

