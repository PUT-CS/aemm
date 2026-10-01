export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("aemm_auth_token");
}

export function setAuthToken(token: string): void {
  if (typeof window === "undefined") return;

  if (token) {
    window.localStorage.setItem("aemm_auth_token", token);
  }
}

/**
 * Reads the role from the stored JWT payload. Only used to adjust the UI,
 * the backend verifies the token and the role on every request.
 */
export function getUserRole(): string | null {
  const token = getAuthToken();
  if (!token) return null;

  try {
    const payload = token.split(".")[1];
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json).role ?? null;
  } catch {
    return null;
  }
}

export function isAdmin(): boolean {
  return getUserRole() === "admin";
}
