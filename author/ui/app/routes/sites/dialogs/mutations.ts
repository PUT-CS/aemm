import { BACKEND_URL } from "~/consts";

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
