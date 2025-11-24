import { NodeType, ScrNode } from '@aemm/common';
import fs from 'node:fs';
import path from 'node:path';
import config from '../config/config';
import { Request, Response } from 'express';
import { v7 as uuid7 } from 'uuid';

export function getTree(req: Request, res: Response) {
  try {
    const contentRoot = config.contentRoot;
    console.log(`\n[getTree] Building entire tree from: ${contentRoot}`);

    const tree = buildTreeNode(contentRoot);

    res.status(200).json(tree);
  } catch (err: unknown) {
    console.error(`[getTree] ✗ Exception:`, err);
    res.status(500).end();
  }
}

function buildTreeNode(fullPath: string): ScrNode {
  const stats = fs.statSync(fullPath);
  const nodeName = path.basename(fullPath);

  // Handle files
  if (stats.isFile()) {
    return {
      id: uuid7(),
      type: NodeType.FILE,
      name: nodeName,
    };
  }

  // Handle directories
  if (stats.isDirectory()) {
    const contentJsonPath = path.join(fullPath, '.content.json');
    const contentJsonExists = fs.existsSync(contentJsonPath);

    // Get all children (excluding .content.json)
    const entries = fs.readdirSync(fullPath, { withFileTypes: true });
    const children = entries
      .filter((entry) => entry.name !== '.content.json')
      .map((entry) => buildTreeNode(path.join(fullPath, entry.name)));

    if (contentJsonExists) {
      try {
        const data = fs.readFileSync(contentJsonPath, 'utf-8');
        const contentData = JSON.parse(data);

        // Remove 'name' from contentData if it exists (name always comes from directory)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { name: _ignoredName, ...restContentData } = contentData;

        // Merge .content.json with directory children
        // name always comes from directory, title is the display label from .content.json
        return {
          ...restContentData,
          name: nodeName,
          children: children.length > 0 ? children : undefined,
        };
      } catch (err) {
        console.error(
          `Error parsing .content.json at ${contentJsonPath}:`,
          err,
        );
        // Fall through to return basic folder
      }
    }

    // Return basic folder structure (including empty folders)
    return {
      id: uuid7(),
      type: NodeType.FOLDER,
      name: nodeName,
      children: children.length > 0 ? children : undefined,
    };
  }

  // Fallback
  return {
    id: uuid7(),
    type: NodeType.FILE,
    name: nodeName,
  };
}
