# ADR 003 Identity and Access

## Status

Selected for first-workflow accounts: Keycloak OIDC. Broader identity architecture remains open. The target repository contained no Supabase source to audit; self-hosted Supabase remains an alternative only if a later domain owner has a concrete need and compares component licenses and operations.

## Decision context

Optional accounts support contribution and project participation. Identity is not a universal government registry. Authentication records remain separate from optional civic profiles and personal service records.

## License

Keycloak is Apache-2.0 ([upstream repository](https://github.com/keycloak/keycloak)). Supabase self-hosting combines multiple components with their own licenses; audit the exact images, extensions, and version before any later adoption.

## Hosting and operations cost

Budget database and backups, identity operator skills, email/SMS delivery or passkey support, availability, account recovery, abuse response, upgrades, monitoring and security review. Managed identity is outside the FOSS-only direction unless separately approved.

## Security

Prefer OIDC/OAuth2, WebAuthn/passkeys for privileged users, phishing-resistant MFA, short-lived scoped tokens, rate limits, audited recovery, and minimal identity attributes. Do not default to biometrics or real-name publication. Treat recovery as a high-risk path.

## Interoperability

Use standard OIDC clients and stable subject identifiers. Avoid application-specific role claims that encode national status. Use scoped service authorization and published consent events.

## Migration

Keep provider-specific identifiers behind a stable internal mapping; export users and consent metadata; never assume password hashes can safely migrate between providers. Provide re-authentication or secure recovery if migration requires it. Keep the ability to revoke old tokens.

## Open questions

Whether anonymous contribution is permitted; which workflow steps need stronger proof; account recovery; federation; separation of minors’ accounts; legal identity proof necessity; retention of security events.

