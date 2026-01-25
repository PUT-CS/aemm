import { BACKEND_URL } from "~/consts";
import type { ScrNode, ScrNodeWithoutTimestamps } from "@aemm/common";
import { getAuthToken } from "~/lib/auth";

export function getAuthHeaders() {
  const token = getAuthToken();
  const headers: HeadersInit = {};

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
}

export async function uploadFile(parentPath: string, file: File) {
  const filePath = `${parentPath}/${file.name}`;
  console.log("Uploading file to", `${BACKEND_URL}/scr${filePath}`);
  const response = await fetch(`${BACKEND_URL}/scr${filePath}`, {
    method: "POST",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": file.type || "application/octet-stream",
    },
    body: file,
  });
  if (!response.ok) {
    throw new Error(`Failed to upload file: ${response.statusText}`);
  }
  return response;
}

/**
 * Creates a new node at the specified parent path.
 */
export async function createNode(
  parentPath: string,
  node: ScrNodeWithoutTimestamps | ScrNode,
) {
  const nodePath = `${parentPath}/${node.name}`;
  console.log("Creating node at", `${BACKEND_URL}/scr${nodePath}`);
  const response = await fetch(`${BACKEND_URL}/scr${nodePath}`, {
    method: "PUT",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(node),
  });
  if (!response.ok) {
    throw new Error(`Failed to create node: ${response.statusText}`);
  }
  return response;
}

/**
 * Edits an existing node at the specified path.
 */
export async function editNode(nodePath: string, node: ScrNode) {
  console.log("Editing node at", `${BACKEND_URL}/scr${nodePath}`);
  const response = await fetch(`${BACKEND_URL}/scr${nodePath}`, {
    method: "PATCH",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(node),
  });
  if (!response.ok) {
    throw new Error(`Failed to edit node: ${response.statusText}`);
  }
  return response;
}

export async function deleteNode(nodePath: string) {
  console.log("Deleting node at", `${BACKEND_URL}/scr${nodePath}`);
  const response = await fetch(`${BACKEND_URL}/scr${nodePath}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error(`Failed to delete node: ${response.statusText}`);
  }
  return response;
}
