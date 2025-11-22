export default async function fetchPathContent(path: string) {
  // Ensure path is always defined and starts with /
  const safePath = path || "/";
  const normalizedPath = safePath.startsWith("/") ? safePath : `/${safePath}`;

  const response = await fetch(`http://localhost:4500/scr${normalizedPath}`);
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
}
