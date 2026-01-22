import { BACKEND_URL } from "~/consts";
import { getAuthHeaders } from "~/routes/admin/UsersTab/mutations";

/**
 * Fetch all users from the database.
 */
export async function fetchUsers() {
  console.log("Fetching all users...");

  const response = await fetch(`${BACKEND_URL}/users`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch users: ${response.statusText}`);
  }
  return response.json();
}
