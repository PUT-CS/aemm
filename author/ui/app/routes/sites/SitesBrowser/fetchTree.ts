import type {ScrNode} from "@aemm/common";

export default async function fetchTree(): Promise<ScrNode> {
  const response = await fetch(`http://localhost:4500/scrtree`);
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
}

