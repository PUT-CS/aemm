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
