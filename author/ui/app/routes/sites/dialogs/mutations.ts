import { BACKEND_URL } from "~/consts";
import type { ScrNodeWithoutTimestamps } from "@aemm/common";

export async function uploadFile(parentPath: string, file: File) {
  const filePath = `${parentPath}/${file.name}`;
  console.log("Uploading file to", `${BACKEND_URL}/scr${filePath}`);
  const response = await fetch(`${BACKEND_URL}/scr${filePath}`, {
    method: "POST",
    headers: {
      "Content-Type": file.type || "application/octet-stream",
    },
    body: file,
  });
  if (!response.ok) {
    throw new Error(`Failed to upload file: ${response.statusText}`);
  }
  return response;
}

export async function uploadNode(
  parentPath: string,
  node: ScrNodeWithoutTimestamps,
) {
  const nodePath = `${parentPath}/${node.name}`;
  console.log("Uploading node to", `${BACKEND_URL}/scr${nodePath}`);
  const response = await fetch(`${BACKEND_URL}/scr${nodePath}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(node),
  });
  if (!response.ok) {
    throw new Error(`Failed to upload node: ${response.statusText}`);
  }
  return response;
}
