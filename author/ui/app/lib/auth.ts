import { useQuery } from "@tanstack/react-query";
import { BACKEND_URL } from "~/consts";

export interface CurrentUser {
  id: number;
  username: string;
  role: string;
}

export function authFetch(url: string, init: RequestInit = {}) {
  return fetch(url, {
    ...init,
    credentials: "include",
    headers: {
      ...(init.headers as Record<string, string>),
      "X-AEMM-Request": "1",
    },
  });
}

async function fetchCurrentUser(): Promise<CurrentUser | null> {
  const response = await authFetch(`${BACKEND_URL}/me`);
  if (response.status === 401) {
    return null;
  }
  if (!response.ok) {
    throw new Error(`Failed to fetch current user: ${response.statusText}`);
  }
  return response.json();
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ["me"],
    queryFn: fetchCurrentUser,
    retry: false,
  });
}

export async function logout() {
  await authFetch(`${BACKEND_URL}/logout`, { method: "POST" });
}
