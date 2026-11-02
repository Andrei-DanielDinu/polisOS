import { User, UserManager, WebStorageStateStore } from "oidc-client-ts";

const authority = import.meta.env.VITE_OIDC_AUTHORITY ?? "http://localhost:8080/realms/polisos";
const clientId = import.meta.env.VITE_OIDC_CLIENT_ID ?? "polisos-web";
const redirectUri = `${window.location.origin}/auth/callback`;
const demoSubject = "demo-citizen-local";

export const userManager = new UserManager({
  authority,
  client_id: clientId,
  redirect_uri: redirectUri,
  post_logout_redirect_uri: window.location.origin,
  response_type: "code",
  scope: "openid",
  userStore: new WebStorageStateStore({ store: window.sessionStorage }),
  automaticSilentRenew: false,
  monitorSession: false,
  loadUserInfo: false
});

export async function signIn() {
  await userManager.signinRedirect();
}

export async function finishSignIn() {
  return userManager.signinRedirectCallback();
}

export async function signOut(user?: User | null) {
  if (isDemoUser(user)) {
    clearDemoSession();
    return;
  }
  await userManager.signoutRedirect({
    id_token_hint: user?.id_token,
    post_logout_redirect_uri: window.location.origin
  });
}

export function createDemoUser(): User {
  const payload = btoa(JSON.stringify({
    sub: demoSubject,
    azp: clientId,
    realm_access: { roles: [] }
  })).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  sessionStorage.setItem("polisos.demo-session", "true");
  return {
    access_token: `e30.${payload}.local-demo`,
    id_token: "local-demo",
    token_type: "Bearer",
    expires_at: Math.floor(Date.now() / 1000) + 60 * 60,
    expired: false,
    profile: {
      sub: demoSubject,
      preferred_username: "demo.citizen@polisos.local",
      email: "demo.citizen@polisos.local"
    }
  } as User;
}

export function isDemoUser(user?: User | null): boolean {
  return import.meta.env.DEV && user?.profile?.sub === demoSubject;
}

export function hasDemoSession(): boolean {
  return import.meta.env.DEV && sessionStorage.getItem("polisos.demo-session") === "true";
}

export function clearDemoSession() {
  sessionStorage.removeItem("polisos.demo-session");
}

export function getRoles(user?: User | null): string[] {
  if (!user?.access_token) return [];
  try {
    const segment = user.access_token.split(".")[1];
    if (!segment) return [];
    const normalized = segment.replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(normalized)) as { realm_access?: { roles?: unknown } };
    return Array.isArray(payload.realm_access?.roles)
      ? payload.realm_access.roles.filter((role): role is string => typeof role === "string")
      : [];
  } catch {
    return [];
  }
}

export type { User };

