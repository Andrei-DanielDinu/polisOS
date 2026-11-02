# ADR 004 Data Stores and Geospatial Storage

## Status

Selected for the first workflow: PostgreSQL, with separate service-owned databases. Broader storage choices remain open. No Supabase code was present in the target repository to audit; compare self-hosted Supabase only if a later domain owner has a specific need.

## License

PostgreSQL uses the PostgreSQL License ([official license](https://www.postgresql.org/about/licence/)). PostGIS is GPLv2 ([license FAQ](https://postgis.net/documentation/faq/gpl-license/)). Supabase self-hosted components have component-specific licenses and feature differences from its managed service ([official guide](https://supabase.com/docs/guides/self-hosting)). Verify the exact composition before distribution.

## Hosting and operations cost

Budget database operators, storage and IOPS, backups, point-in-time recovery, replication, monitoring, upgrades, migrations, encryption, disaster recovery tests, and separate instances where domains need isolation. Self-hosting means the team owns availability and incident response.

## Security

Each service owns its authoritative data. Enforce least privilege, encryption, network separation, secrets management, audited access, retention and deletion, backup isolation, and restore validation. Never use a shared administrative database as a cross-domain API.

## Interoperability

Prefer SQL, documented schemas, standard spatial formats, OpenAPI services, stable IDs, and event-based cross-domain references. Use PostGIS only where spatial queries justify it. Keep public analytics on approved aggregates.

## Migration

Maintain schema migrations, portable SQL/GeoJSON/CSV exports, data dictionaries, source lineage, and tested restores. Preserve data ownership boundaries if moving from Supabase or changing providers. Document extensions and proprietary managed features before relying on them.

## Open questions

Per-service database count and isolation; PostgreSQL operations ownership; spatial workloads; multi-region needs; retention and backup objectives.

