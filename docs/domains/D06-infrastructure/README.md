# D06 Infrastructure

## 1. Purpose and outcomes

Map and coordinate transport networks, rail, roads, ports, airports, utilities, connectivity, public facilities, assets, maintenance, and capital works.

## 2. Citizen experience

People can report a defect or barrier with chosen location precision, follow non-sensitive works, and review service disruption information.

## 3. Roles, authority, and boundaries

Asset owner maintains authoritative records; public works authorities approve designs, procurement and operations; contractors report work under contract; independent engineers verify safety and quality.

## 4. Workflow

Inventory asset → assess condition and risk → rank maintenance options transparently → authorize funding/procurement → deliver milestone → inspect, hand over, and schedule maintenance.

Domain feedback cycle: observe → qualify source and uncertainty → measure or record evidence → review with affected people → propose options → authorize through the responsible institution → deliver → evaluate effects and correct. A measurement can request review; it cannot itself exercise legal authority.

## 5. Observation register

| What is observed | Source and steward | Cadence and uncertainty | Allowed use and prohibited trigger |
|---|---|---|---|
| Public asset registers, works contracts, operator service levels, open geospatial data, and opt-in public reports. Monthly or quarterly by asset class; stewards record sensor error, stale inventory, location accuracy, and reporting bias. | Named domain data steward and original source owner; affected people can submit corrections | Event-triggered for direct workflow and security records; source-native timing for institutional statistics; monthly freshness check; quarterly outcome review; annual independent method review. Preserve source-reported uncertainty, coverage gaps, measurement/sampling error, and revision lag. Safety issues follow the responsible authority's incident cadence. | Human review and aggregate planning only; a measurement cannot automatically sanction a person, deny a service, or allocate funds |

## 6. Data and privacy

Use the minimum data needed for this domain. Citizen-level submissions are opt-in, purpose-labeled, and separate from authentication records. Prefer public, institutional, operational, and aggregate sources. No default cross-link to personal government records. Classify each record, set access and retention, allow correction, and suppress unsafe small aggregates. Data from this domain must not be reused for employment, credit, benefits, policing, or public ranking unless a separately lawful and reviewed purpose is established.

## 7. Measures and feedback

Asset condition, service reliability, downtime, maintenance backlog, travel time/access, safety incidents at aggregate level, project schedule and lifecycle cost. No automated safety certification.

Every indicator states definition, numerator/denominator where applicable, source, owner, geographic and population scope, update cadence, uncertainty, missingness, known confounders, revision policy, and the actions it may or may not support. Outcomes are reviewed with affected people and, for consequential decisions, an independent evaluator.

## 8. Failures, correction, and appeal

Stale maps, unsafe disclosure, procurement conflicts, poor workmanship, or deferred maintenance. Engineers and citizens can report corrections; contract and safety disputes follow lawful channels; independent inspection recorded.

Provide a visible correction route, preserve provenance and revision history, and offer human review independent of the original decision when practicable. Publish a plain-language reason when a report is not accepted, a data item is corrected, or a workflow is stopped.

## 9. Integrations and contracts

Transport/public service planning, supply chains, environment, finance/procurement, geospatial maps, resilience and tourism.

Use shared API and event rules from [service architecture](../../architecture/README.md). Exchange only the minimum necessary fields. Events must carry schema version and purpose; personal content is stored behind authorization and referenced by an opaque identifier.

## 10. Delivery phases

Foundation: public asset and works directory. First workflow: reported local barrier or repair proposal. Later: interoperable maintenance and asset systems under owner control.

## 11. Stack decision record

**Status: open for domain-owner selection.** The domain must remain independently deployable and conform to shared contracts.

PostgreSQL/PostGIS and MapLibre/OpenStreetMap are candidates. License: PostGIS is GPLv2; verify the exact renderer, extensions, and map-data terms before selection. Hosting/operations: spatial storage, tile delivery and map updates cost money; community OSM tile servers are not a production free map API. Security: sensitive utility/critical-site details are restricted. Interoperability: common geospatial formats and stable asset IDs. Migration: export GeoJSON/CSV and asset history.

All selected components, versions, extensions, model weights, and datasets require a documented license and security review before adoption. Record hosting region, recurring operational burden, staffing, backup/recovery, export and replacement plan in the implementation ADR.

## 12. Open decisions

Asset-owner data stewardship; safe geospatial publication granularity; tile provider; condition-scoring method and appeals.

## Proposed operational dashboard

The infrastructure view may combine published asset inventories, service-level transport and utility signals, maintenance plans, disruption notices and accessibility data. Preserve provenance and granularity; utility control telemetry and critical-site detail stay in restricted owner systems. Public reports focus on service availability, outage/repair status and performance aggregates rather than real-time individual movement.

For mobility, compare punctuality, frequency, journey-time reliability, transfers, accessibility and maintenance with safe aggregated demand. Coordinate candidate operating windows with D05 service owners; do not infer an individual’s work hours. See the [national operating picture](../../system/operating-picture/README.md).

