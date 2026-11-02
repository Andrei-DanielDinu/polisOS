import { createRemoteJWKSet, jwtVerify } from "jose";

const issuer = process.env.OIDC_ISSUER ?? "http://localhost:8080/realms/polisos";
const clientId = process.env.OIDC_CLIENT_ID ?? "polisos-web";
const jwksUrl = process.env.OIDC_JWKS_URI ??
  "http://keycloak:8080/realms/polisos/protocol/openid-connect/certs";
const jwks = createRemoteJWKSet(new URL(jwksUrl));

export interface Actor {
  sub: string;
  roles: string[];
}

function httpError(statusCode: number, message: string) {
  return Object.assign(new Error(message), { statusCode });
}

export async function optionalActor(authorization?: string): Promise<Actor | null> {
  if (!authorization) return null;
  const [scheme, token] = authorization.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) {
    throw httpError(401, "A valid bearer token is required.");
  }

  try {
    const { payload } = await jwtVerify(token, jwks, { issuer });
    if (payload.azp !== clientId || typeof payload.sub !== "string") {
      throw httpError(401, "The account token was issued for a different client.");
    }
    const realmAccess = payload.realm_access as { roles?: unknown } | undefined;
    const roles = Array.isArray(realmAccess?.roles)
      ? realmAccess.roles.filter((role): role is string => typeof role === "string")
      : [];
    return { sub: payload.sub, roles };
  } catch {
    throw httpError(401, "The account session could not be verified.");
  }
}

export async function requireActor(authorization?: string): Promise<Actor> {
  const actor = await optionalActor(authorization);
  if (!actor) throw httpError(401, "Sign in to continue.");
  return actor;
}

export function requireRole(actor: Actor, role: string) {
  if (!actor.roles.includes(role)) throw httpError(403, "This action requires an assigned review role.");
}

export function requestError(statusCode: number, message: string) {
  return httpError(statusCode, message);
}

