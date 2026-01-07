import {BACKEND_URL} from "~/consts";
import type {FormSchema} from "~/routes/admin/UsersTab/UsersTab";


/**
 * Create a new user in the database.
 */
export async function createUser(user: FormSchema) {
  console.log("Creating user...")
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