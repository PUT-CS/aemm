import { BACKEND_URL } from "~/consts";
import type { FormSchema } from "~/routes/admin/UsersTab/UsersTab";

/**
 * Create a new user in the database.
 */
export async function createUser(user: FormSchema) {
  console.log("Creating user...");
  const response = await fetch(`${BACKEND_URL}/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  });
  if (!response.ok) {
    throw new Error(`Failed to create user: ${response.statusText}`);
  }
  return response;
}

/**
 * Delete an existing user by username.
 */
export async function deleteUser(username: string) {
  console.log("Deleting user", username);
  const response = await fetch(
    `${BACKEND_URL}/users/${encodeURIComponent(username)}`,
    {
      method: "DELETE",
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
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to edit user: ${response.statusText}`);
  }

  return response.json();
}
