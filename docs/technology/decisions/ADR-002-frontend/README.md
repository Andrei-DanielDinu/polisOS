# ADR 002 Web Frontend

## Status

Selected for the first workflow: React, TypeScript, and Vite. Broader product adoption remains reviewable; the target repository had no frontend source to audit.

## Decision context

The first interface needs accessible guest browsing, voluntary accounts, discussion, project proposals, status, appeals, and dashboards. The frontend consumes documented APIs and never becomes a source of public authority.

## License

React is MIT licensed, with metadata in its [upstream package](https://github.com/facebook/react/blob/main/packages/react/package.json). Audit exact licenses for TypeScript tooling, Vite, UI libraries, fonts, icons, map packages, and every bundled dependency at selection.

## Hosting and operations cost

Budget build pipelines, static hosting or application runtime, CDN and data transfer, domain and certificates, accessibility audits, localization, browser testing, content moderation, support, and secure release operations.

## Security

Use secure session patterns, content security policy, CSRF/XSS protection, dependency pinning, safe uploads, privacy-preserving analytics, and no client-side authorization assumptions. Redact personal content from error reports and telemetry.

## Interoperability

Use semantic HTML, progressive enhancement where practical, accessible standards, stable URLs, documented API clients, and open data formats. Keep business rules and authorization on backend services.

## Migration

Keep design tokens, content, API contracts, and user preferences portable. Avoid storing domain state only in browser storage. A later frontend can replace React while preserving APIs, stable identifiers, and exported content.

## Open questions

React vs alternatives, app shell/PWA needs, Romanian-first localization plan, design system, moderation tools, map rendering, anonymous browsing, and accessibility test ownership.

