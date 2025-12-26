import { NodeType, ScrNode } from '@aemm/common';
import fs from 'node:fs';
import path from 'node:path';
import config from '../config/config';
import { Request, Response } from 'express';
import { serverErrorLog } from './utils';

export function getTree(req: Request, res: Response) {
  try {
    const contentRoot = config.contentRoot;
    const tree = buildTreeNode(contentRoot);

    res.status(200).json(tree);
  } catch (err: unknown) {
    serverErrorLog(err, res);
  }
}

function buildTreeNode(fullPath: string): ScrNode & { children?: ScrNode[] } {
  const stats = fs.statSync(fullPath);
  const nodeName = path.basename(fullPath);

  // Handle files
  if (stats.isFile()) {
    return {
      id: fullPath,
      type: NodeType.FILE,
      name: nodeName,
      createdAt: stats.birthtime,
      updatedAt: stats.mtime,
    };
  }

  // Handle directories
  if (stats.isDirectory()) {
    const contentJsonPath = path.join(fullPath, '.content.json');
    const contentJsonExists = fs.existsSync(contentJsonPath);

    // Get all children (excluding .content*.json files)
    const entries = fs.readdirSync(fullPath, { withFileTypes: true });
    const children = entries
      .filter((entry) => !/^\.content.*\.json$/i.test(entry.name))
      .map((entry) => buildTreeNode(path.join(fullPath, entry.name)));

    if (!contentJsonExists) {
      throw new Error(`Missing .content.json in directory at ${fullPath}`);
    }

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
      console.error(`Error parsing .content.json at ${contentJsonPath}:`, err);
      // Fall through to return basic folder
    }
  }
  throw new Error(`Unsupported file system entry at ${fullPath}`);
}
