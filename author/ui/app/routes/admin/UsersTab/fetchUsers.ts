import {BACKEND_URL} from "~/consts";

export async function fetchUsers() {
  console.log("Fetching all users...")
  const response = await fetch(`${BACKEND_URL}/users`, {
    method: "GET",
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch users: ${response.statusText}`);
  }
  return response.json();
}