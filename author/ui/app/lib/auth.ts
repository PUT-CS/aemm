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
