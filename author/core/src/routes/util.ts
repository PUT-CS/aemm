import { NodeType, ScrNode } from '@aemm/common';
import fs from 'node:fs';

export function getChildrenNodes(path: string): ScrNode[] {
  const entries = fs.readdirSync(path, { withFileTypes: true });
  return entries
    .filter((entry) => entry.name !== '.content.json') // Filter out metadata file
    .map(
      (entry) =>
        ({
          type: entry.isDirectory() ? NodeType.FOLDER : NodeType.FILE,
          name: entry.name,
        }) as ScrNode,
    );
}

export function isScrNode(obj: unknown): obj is ScrNode {
  if (!obj || typeof obj !== 'object') return false;

  const node = obj as Record<string, unknown>;

  if (!node.type || !node.name || typeof node.name !== 'string') return false;
  if (!Object.values(NodeType).includes(node.type as NodeType)) return false;

  if (node.type === NodeType.FOLDER && node.children) {
    if (!Array.isArray(node.children)) return false;
    return node.children.every(isScrNode);
  }

  return true;
}
