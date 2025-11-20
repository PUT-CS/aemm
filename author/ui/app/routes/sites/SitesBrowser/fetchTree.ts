export default async function fetchTree() {
  const response = await fetch(`http://localhost:4500/scrtree`);
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
}

