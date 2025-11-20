import {Request, Response} from 'express';
import config from '../config/config';
import * as fs from 'node:fs';
import {NodeType, ScrNode} from '@aemm/common/scr';
import path from 'path';

function isScrNode(obj: unknown): obj is ScrNode {
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

function readFileContent(filePath: string): string {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (err) {
    console.error(`Error reading file at ${filePath}:`, err);
    throw err;
  }
}

function buildTreeNode(fullPath: string): ScrNode {
  const stats = fs.statSync(fullPath);
  const nodeName = path.basename(fullPath);

  // Handle files
  if (stats.isFile()) {
    return {
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
        const data = readFileContent(contentJsonPath);
        const contentData = JSON.parse(data);

        // Remove 'name' from contentData if it exists (name always comes from directory)
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

    // Return basic folder structure (including empty folders)
    return {
      type: NodeType.FOLDER,
      name: nodeName,
      children: children.length > 0 ? children : undefined,
    };
  }

  // Fallback
  return {
    type: NodeType.FILE,
    name: nodeName,
  }
}

// Get entire content tree
export const getTree = (req: Request, res: Response) => {
  try {
    const contentRoot = config.contentRoot;
    console.log(`\n[getTree] Building entire tree from: ${contentRoot}`);

    const tree = buildTreeNode(contentRoot);

    // Count nodes for logging
    const countNodes = (node: ScrNode): { folders: number; files: number } => {
      let folders = 0;
      let files = 0;

      if (node.type === NodeType.FOLDER) {
        folders = 1;
        if (node.children) {
          node.children.forEach((child: ScrNode) => {
            const counts = countNodes(child);
            folders += counts.folders;
            files += counts.files;
          });
        }
      } else {
        files = 1;
      }

      return { folders, files };
    };

    const stats = countNodes(tree);
    console.log(`[getTree] ✓ Tree built: ${stats.folders} folders, ${stats.files} files`);
    res.json(tree);
  } catch (err: unknown) {
    console.error(`[getTree] ✗ Exception:`, err);
    res.status(500).end();
  }
};


function getChildrenNodes(path: string): ScrNode[] {
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

    // Ensure cleanedPath is always defined, default to '/' if undefined
    const safePath = cleanedPath || '/';
    const fullPath = path.resolve(contentRoot + safePath);

    console.log(`  [getNode] cleanedPath: "${cleanedPath}" → safePath: "${safePath}"`);
    console.log(`  [getNode] fullPath: "${fullPath}"`);

    if (!fullPath.startsWith(path.resolve(contentRoot))) {
      console.log(`  [getNode] ✗ Path outside content root - FORBIDDEN`);
      res.status(403).end();
      return;
    }

    const fullPathExists = fs.existsSync(fullPath);
    if (!fullPathExists) {
      console.log(`  [getNode] ✗ Path does not exist - NOT FOUND`);
      res.status(404).end();
      return;
    }

    const stats = fs.statSync(fullPath);

    // Handle files
    if (stats.isFile()) {
      console.log(`  [getNode] ✓ Returning file content`);
      const content = readFileContent(fullPath);
      res.header('Content-Type', 'text/plain');
      res.send(content);
      return;
    }

    // Handle directories
    if (stats.isDirectory()) {
      const contentJsonFullPath = fullPath + '/.content.json';
      const contentJsonExists = fs.existsSync(contentJsonFullPath);

      // Get the actual directory children
      const children = getChildrenNodes(fullPath);
      console.log(`  [getNode] Directory has ${children.length} children`);

      if (contentJsonExists) {
        try {
          console.log(`  [getNode] ✓ Merging .content.json with ${children.length} children`);
          const data = readFileContent(contentJsonFullPath);
          const contentData: ScrNode = JSON.parse(data);

          // Remove 'name' from contentData if it exists (name always comes from directory)
          const { name: _ignoredName, ...restContentData } = contentData;

          // Merge .content.json with actual directory children
          // name always comes from directory, restContentData can override type
          const mergedNode: ScrNode = {
            ...restContentData,
            name: path.basename(fullPath),
            children: children,
          };
          res.json(mergedNode);
          return;
        } catch (err: unknown) {
          console.error(`  [getNode] ✗ Error parsing .content.json:`, err);
          res.status(422).end();
          return;
        }
      } else {
        console.log(`  [getNode] ✓ Returning simple folder with ${children.length} children`);
        // .content.json does not exist, return simple folder structure
        const folderNode: ScrNode = {
          type: NodeType.FOLDER,
          name: path.basename(fullPath),
          children: children,
        };
        res.json(folderNode);
        return;
      }
    }

    // Neither file nor directory
    console.log(`  [getNode] ✗ Not a file or directory - NOT FOUND`);
    res.status(404).end();
    return;
  } catch (err: unknown) {
    console.error(`  [getNode] ✗ Exception:`, err);
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
