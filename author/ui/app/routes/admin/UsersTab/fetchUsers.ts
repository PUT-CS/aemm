import { BACKEND_URL } from "~/consts";
import { authFetch } from "~/lib/auth";

/**
 * Fetch all users from the database.
 */
export async function fetchUsers() {
  console.log("Fetching all users...");

  const response = await authFetch(`${BACKEND_URL}/users`);
  if (!response.ok) {
    throw new Error(`Failed to fetch users: ${response.statusText}`);
  }
  return response.json();
}
