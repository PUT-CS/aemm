export default async function fetchPathContent(path: string) {
  console.log(`Fetching content for path: ${path}`);
  const response = await fetch(`http://localhost:4500${path}`);
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
}
