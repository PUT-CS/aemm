import { BACKEND_URL } from "~/consts";
import type { FormSchema } from "~/routes/admin/UsersTab/UsersTab";
import { getAuthToken } from "~/lib/auth";
import type { LoginFormData } from "~/routes/login";

export function getAuthHeaders() {
  const token = getAuthToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
}

/**
 * Create a new user in the database.
 */
export async function createUser(user: FormSchema) {
  console.log("Creating user...");
  const response = await fetch(`${BACKEND_URL}/users`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(user),
  });
  if (!response.ok) {
    throw new Error(`Failed to create user: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Delete an existing user by username.
 */
export async function deleteUser(username: string) {
  console.log("Deleting user", username);
  const headers = getAuthHeaders();
  const response = await fetch(
    `${BACKEND_URL}/users/${encodeURIComponent(username)}`,
    {
      method: "DELETE",
      headers,
    },
  );
  if (!response.ok) {
    throw new Error(`Failed to delete user: ${response.statusText}`);
  }
  return response;
}

/**
 * Update an existing user. Only the password (via the `password` field) and role can be changed.
 * The `password` field here contains the plaintext password, which will be sent to the backend and must be hashed there.
 **/
export async function editUser(
  username: string,
  updates: Partial<Pick<FormSchema, "password" | "role">>,
) {
  console.log("Editing user", username);
  const payload: { password?: string; role?: string } = {};

  if (typeof updates.password === "string") {
    payload.password = updates.password;
  }
  if (typeof updates.role === "string") {
    payload.role = updates.role;
  }

  const response = await fetch(
    `${BACKEND_URL}/users/${encodeURIComponent(username)}`,
    {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to edit user: ${response.statusText}`);
  }

  return response.json();
}

export async function loginRequest(data: LoginFormData) {
  const response = await fetch(`${BACKEND_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    const message =
      (errorBody && (errorBody.message as string)) || "Failed to log in";
    throw new Error(message);
  }

  return (await response.json()) as { token: string };
}
