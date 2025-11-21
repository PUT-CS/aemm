import type { ScrNode } from "@aemm/common";

/**
 * Find a node at a given path in the tree structure
 * @param tree - The root node of the tree
 * @param path - The path to find (e.g., "/", "/gnuorg", "/gnuorg/en")
 * @returns The node at the given path, or undefined if not found
 */
export function findNodeAtPath(
  tree: ScrNode | undefined,
  path: string,
): ScrNode | undefined {
  if (!tree) return undefined;
  if (path === "/") return tree;

  const segments = path.split("/").filter((s) => s !== "");
  let current: ScrNode | undefined = tree;

  for (const segment of segments) {
    if (!current?.children) return undefined;
    current = current.children.find((child) => child.name === segment);
    if (!current) return undefined;
  }

  return current;
}
