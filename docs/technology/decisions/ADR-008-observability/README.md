# ADR 008 Service Observability

## Status

Open candidates: OpenTelemetry for instrumentation and Prometheus for service metrics. This record covers software operations only.

## Decision context

Operators need to detect failures, protect service reliability, investigate incidents, and improve capacity. Service observability is separate from citizen monitoring and national outcome measurement.

## License

Prometheus is Apache-2.0 according to its [official FAQ](https://prometheus.io/docs/introduction/faq/). OpenTelemetry is an open-source project ([official site](https://opentelemetry.io/)); verify license notices for collectors, exporters, dashboards, log stores, and agents selected.

## Hosting and operations cost

Budget telemetry storage, log retention, metric cardinality, traces, alerting, on-call staff, dashboards, incident response, and backup. High-cardinality labels and indefinite retention can make costs and privacy exposure grow.

## Security

Redact personal and sensitive fields before export; restrict operator access; encrypt telemetry; separate security logs; cap retention; protect trace and log links; audit access. Do not treat telemetry as a source for profiling citizens or evaluating workers.

## Interoperability

Instrument with OpenTelemetry APIs and standard metric names; export through replaceable collectors; use documented alerts and service-level objectives. Keep public outcome indicators in D12 registries.

## Migration

Store instrumentation in service code and config; export metric and dashboard definitions; retain incident summaries in portable formats. Avoid reliance on a single vendor-specific agent or proprietary query language.

## Open questions

Metrics and logs backend; retention periods; SLOs; alert ownership; incident logging; redaction library; service versus security log boundaries.

