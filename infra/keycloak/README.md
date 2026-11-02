# Local Keycloak Realm

This realm is for local development. It permits voluntary account registration and defines reviewer and project-owner realm roles. It seeds one citizen account: `demo.citizen` with password `PolisOS-Demo-Only-2026!`. Assign elevated test roles manually through the local admin console.

Do not use local development credentials, Keycloak dev mode, or the single-node database setup in a shared or production environment. Before deployment, define account recovery, verification necessity, privileged access review, role assignment authority, retention, data location, and security operations.

