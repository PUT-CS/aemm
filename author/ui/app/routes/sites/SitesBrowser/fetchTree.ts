import type { ScrNodeWithChildren } from "@aemm/common";

export default async function fetchTree(): Promise<ScrNodeWithChildren> {
  const response = await fetch(`http://localhost:4501/scrtree`);
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
}
