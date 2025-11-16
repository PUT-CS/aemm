import { Request, Response } from 'express';
import config from '../config/config';
import * as fs from 'node:fs';
import { ScrNode, ScrType } from 'common/scr';
import path from 'path';

function isScrNode(obj: unknown): obj is ScrNode {
  if (!obj || typeof obj !== 'object') return false;

  const node = obj as Record<string, unknown>;

  if (!node.type || !node.name || typeof node.name !== 'string') return false;
  if (!Object.values(ScrType).includes(node.type as ScrType)) return false;

  if (node.type === ScrType.FOLDER && node.children) {
    if (!Array.isArray(node.children)) return false;
    return node.children.every(isScrNode);
  }

  return true;
}

function readFileContent(filePath: string): string {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (err) {
    console.error(`Error reading file at ${filePath}:`, err);
    throw err;
  }
}

function getChildrenNodes(path: string): ScrNode[] {
  const entries = fs.readdirSync(path, { withFileTypes: true });
  return entries.map(
    (entry) =>
      ({
        type: entry.isDirectory() ? ScrType.FOLDER : ScrType.FILE,
        name: entry.name,
      }) as ScrNode,
  );
}

function cleanPath(inputPath: string): string {
  // Remove multiple slashes and trailing slash
  const path = inputPath.replace(/\/+/g, '/').replace(/\/$/, '');

  // Remove /scr and everything before it
  const scrIndex = path.indexOf('/scr');
  if (scrIndex === -1) {
    throw new Error('Path does not contain /scr');
  }
  const relativePath = path.substring(scrIndex + 4); // 4 is length of '/scr'

  return relativePath === '' ? '/' : relativePath;
}

// get Node under path
export const getNode = (req: Request, res: Response) => {
  try {
    const cleanedPath = cleanPath(req.path);
    const contentRoot = config.contentRoot;

    const fullPath = path.resolve(contentRoot + cleanedPath);

    if (!fullPath.startsWith(path.resolve(contentRoot))) {
      res.status(403).end();
      return;
    }

    const fullPathExists = fs.existsSync(fullPath);
    if (!fullPathExists) {
      res.status(404).end();
    }

    const contentJsonFullPath = fullPath + '/.content.json';
    const contentJsonExists = fs.existsSync(contentJsonFullPath);

    if (contentJsonExists) {
      try {
        const data = readFileContent(contentJsonFullPath);
        const contentData: ScrNode = JSON.parse(data);
        res.json(contentData);
        return;
      } catch (err: unknown) {
        console.error(err);
        res.status(422).end();
        return;
      }
    }

    if (!contentJsonExists) {
      // .content.json does not exist, handle as a directory
      const stats = fs.statSync(fullPath);
      if (stats.isDirectory()) {
        // Read directory contents, don't parse to JSON, since it could be any type of file
        const children = getChildrenNodes(fullPath);
        const folderNode: ScrNode = {
          type: ScrType.FOLDER,
          name: path.basename(fullPath),
          children: children,
        };
        res.json(folderNode);
        return;
      } else if (stats.isFile()) {
        // don't parse to JSON, since it could be any type of file
        const content = readFileContent(fullPath);
        res.header('Content-Type', 'text/plain');
        res.send(content);
        return;
      } else {
        res.status(404).end();
        return;
      }
    }
  } catch (err: unknown) {
    console.error(err);
    res.status(500).end();
    return;
  }
};

export const updateNode = (req: Request, res: Response) => {
  try {
    const cleanedPath = cleanPath(req.path);
    const contentRoot = config.contentRoot;
    const fullPath = path.resolve(contentRoot + cleanedPath);

    if (!fullPath.startsWith(path.resolve(contentRoot))) {
      res.status(403).end();
      return;
    }

    if (!req.body) {
      res.status(400).send('Request body is required');
      return;
    }

    const contentType = req.get('Content-Type') || '';
    const exists = fs.existsSync(fullPath);

    if (exists) {
      const stats = fs.statSync(fullPath);

      if (stats.isDirectory()) {
        // Update .content.json for directories
        const contentJsonPath = fullPath + '/.content.json';
        fs.writeFileSync(
          contentJsonPath,
          JSON.stringify(req.body, null, 2),
          'utf8',
        );
        res.status(200).json(req.body);
        return;
      }
    }

    // Handle file creation or update
    const dirPath = path.dirname(fullPath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    // Check if Content-Type is JSON
    if (contentType.includes('application/json')) {
      try {
        const jsonData =
          typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

        // Validate that JSON is a valid ScrNode
        if (!isScrNode(jsonData)) {
          res
            .status(400)
            .send(
              'Invalid ScrNode structure: must include type and name fields, with valid ScrType enum value',
            );
          return;
        }

        // Write as .content.json
        const contentJsonPath = fullPath + '/.content.json';
        fs.writeFileSync(
          contentJsonPath,
          JSON.stringify(jsonData, null, 2),
          'utf8',
        );
        res.status(exists ? 200 : 201).json(jsonData);
        return;
      } catch (err: unknown) {
        console.error(err);
        res.status(400).send('Invalid JSON');
        return;
      }
    }

    // Handle binary/text content
    if (!Buffer.isBuffer(req.body)) {
      res.status(400).send('Invalid request body format');
      return;
    }
    fs.writeFileSync(fullPath, req.body);
    res.status(exists ? 200 : 201).send(req.body);
    return;
  } catch (err: unknown) {
    console.error(err);
    res.status(500).end();
    return;
  }
};
