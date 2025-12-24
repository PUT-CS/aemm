import { Request, Response } from 'express';
import config from '../config/config';
import * as fs from 'node:fs';
import path from 'path';
import { addInfoEvent } from '../middlewares/requestLogger';
import { randomUUID } from 'node:crypto';
import { logger } from '../logger';
import { z } from 'zod';
import { NodeType, ScrNode } from '@aemm/common';

// eslint-disable-next-line
const incomingScrNodeSchema: z.ZodType<any> = z.lazy(
  () =>
    z
      .object({
        type: z.enum(NodeType),
        id: z.string().uuid().optional(),
        name: z.string().min(1),
      })
      .passthrough(), // Allow additional fields like timestamps, description, components, etc.
);

/**
 * Helper functions
 */
function validateRequestPath(
  req: Request,
  res: Response,
  contentRoot: string,
): string | null {
  const requestPath = req.path.replace(/^\/scr/, '');
  const fullPath = path.resolve(contentRoot + requestPath);

  if (!fullPath.startsWith(path.resolve(contentRoot))) {
    addInfoEvent(req, res, 'forbidden');
    res.status(403).end();
    return null;
  }

  return fullPath;
}

function parseRequestBody<T>(body: unknown): T {
  return typeof body === 'string' ? JSON.parse(body) : (body as T);
}

/**
 * Backs up the provided node data to a timestamped JSON file next to the original file.
 */
function backupNode(filePath: string, node: unknown): void {
  const nodeData = node as ScrNode;

  const timestamp = new Date().toISOString();

  const dir = path.dirname(filePath);
  const backupFileName = `.content-${timestamp}.json`;
  const backupPath = path.join(dir, backupFileName);

  fs.writeFileSync(backupPath, JSON.stringify(nodeData, null, 2), 'utf8');
}

function validateNodeSchema(
  jsonData: unknown,
  req: Request,
  res: Response,
): boolean {
  const validationResult = incomingScrNodeSchema.safeParse(jsonData);
  if (!validationResult.success) {
    addInfoEvent(req, res, 'invalidScrNode', {
      errors: validationResult.error.issues,
    });
    res.status(400).send('Invalid ScrNode structure');
    return false;
  }
  return true;
}

/**
 * Adds id, createdAt, and updatedAt fields if missing.
 */
function addIdAndTimestamps(node: ScrNode): ScrNode {
  const updatedNode = { ...node };

  // Assign a new UUID if not present or blank
  if (!updatedNode.id || updatedNode.id.trim() === '') {
    updatedNode.id = randomUUID();
  }

  updatedNode.createdAt = updatedNode.createdAt || new Date();
  updatedNode.updatedAt = new Date();

  return updatedNode;
}

/**
 * Removes the children field from node data before persisting to disk.
 * Children should be determined at runtime by reading the filesystem.
 */
interface HasChildren {
  children?: unknown;
}
function removeChildrenField(data: HasChildren): unknown {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { children, ...rest } = data;
  return rest;
}

/**
 * Creates a new node with metadata (JSON content).
 */
export const createNode = (req: Request, res: Response) => {
  try {
    const contentRoot = config.contentRoot;
    const fullPath = validateRequestPath(req, res, contentRoot);
    if (!fullPath) return;

    if (!req.body) {
      addInfoEvent(req, res, 'createNode.badRequest', { reason: 'no body' });
      res.status(400).send('Request body is required');
      return;
    }

    const exists = fs.existsSync(fullPath);
    addInfoEvent(req, res, 'createNode.nodeExists', { exists });

    if (exists) {
      addInfoEvent(req, res, 'createNode.alreadyExists');
      res.status(409).send('Node already exists');
      return;
    }

    // Ensure parent directory exists
    const dirPath = path.dirname(fullPath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    try {
      let jsonData = parseRequestBody<ScrNode>(req.body);

      jsonData = addIdAndTimestamps(jsonData);

      // Validate node schema
      if (!validateNodeSchema(jsonData, req, res)) {
        return;
      }

      // Create the folder itself
      fs.mkdirSync(fullPath, { recursive: true });

      // Write as .content.json (without children field)
      const contentJsonPath = fullPath + '/.content.json';
      const dataToWrite = removeChildrenField(
        jsonData as unknown as HasChildren,
      );
      fs.writeFileSync(
        contentJsonPath,
        JSON.stringify(dataToWrite, null, 2),
        'utf8',
      );
      addInfoEvent(req, res, 'createNode.nodeCreated');
      res.status(201).json(jsonData);
      return;
    } catch (err: unknown) {
      addInfoEvent(req, res, 'createNode.invalidJsonBody', {
        error: (err as Error).message,
      });
      res.status(400).send('Invalid JSON');
      return;
    }
  } catch (err: unknown) {
    logger.error('Unhandled createNode error', {
      error: (err as Error).message,
    });
    res.status(500).end();
    return;
  }
};

/**
 * Edits an existing node's metadata (JSON content).
 * Handles renaming if the name field changes.
 */
export const editNode = (req: Request, res: Response) => {
  try {
    const contentRoot = config.contentRoot;
    const fullPath = validateRequestPath(req, res, contentRoot);
    if (!fullPath) return;

    if (!req.body) {
      addInfoEvent(req, res, 'editNode.badRequest', { reason: 'no body' });
      res.status(400).send('Request body is required');
      return;
    }

    const exists = fs.existsSync(fullPath);
    addInfoEvent(req, res, 'editNode.nodeExists', { exists });

    if (!exists) {
      addInfoEvent(req, res, 'editNode.notFound');
      res.status(404).send('Node does not exist');
      return;
    }

    const stats = fs.statSync(fullPath);

    if (!stats.isDirectory()) {
      addInfoEvent(req, res, 'editNode.notDirectory');
      res.status(400).send('Can only edit directories');
      return;
    }

    const contentJsonPath = fullPath + '/.content.json';

    // Read existing data to check for rename
    let existingData = null;
    if (fs.existsSync(contentJsonPath)) {
      try {
        const existingContent = fs.readFileSync(contentJsonPath, 'utf8');
        existingData = JSON.parse(existingContent);
      } catch (err) {
        logger.warn('Could not read existing content.json', {
          path: contentJsonPath,
          error: (err as Error).message,
        });
      }
    }

    const newData = parseRequestBody<ScrNode>(req.body);

    // If name has changed, rename the directory
    if (
      existingData &&
      existingData.name &&
      newData.name &&
      existingData.name !== newData.name
    ) {
      const parentDir = path.dirname(fullPath);
      const newPath = path.join(parentDir, newData.name);

      // Check if target path already exists
      if (fs.existsSync(newPath)) {
        addInfoEvent(req, res, 'editNode.nameConflict', {
          oldName: existingData.name,
          newName: newData.name,
        });
        res
          .status(409)
          .send(`A node with name "${newData.name}" already exists`);
        return;
      }

      // Rename the directory
      fs.renameSync(fullPath, newPath);
      addInfoEvent(req, res, 'editNode.nodeRenamed', {
        oldPath: fullPath,
        newPath: newPath,
      });

      // Write the updated content to the new location (without children field)
      const newContentJsonPath = newPath + '/.content.json';
      const dataToWrite = <ScrNode>(
        removeChildrenField(newData as unknown as HasChildren)
      );

      backupNode(newContentJsonPath, dataToWrite);
      dataToWrite.createdAt = dataToWrite.createdAt || new Date();
      dataToWrite.updatedAt = new Date();
      fs.writeFileSync(
        newContentJsonPath,
        JSON.stringify(dataToWrite, null, 2),
        'utf8',
      );
      res.status(200).json(newData);
      return;
    }

    // No rename needed, just update the content (without children field)
    const dataToWrite = <ScrNode>(
      removeChildrenField(newData as unknown as HasChildren)
    );

    backupNode(contentJsonPath, dataToWrite);
    dataToWrite.createdAt = dataToWrite.createdAt || new Date();
    dataToWrite.updatedAt = new Date();
    fs.writeFileSync(
      contentJsonPath,
      JSON.stringify(dataToWrite, null, 2),
      'utf8',
    );
    addInfoEvent(req, res, 'editNode.metadataUpdated');
    res.status(200).json(newData);
    return;
  } catch (err: unknown) {
    logger.error('Unhandled editNode error', {
      error: (err as Error).message,
    });
    res.status(500).end();
    return;
  }
};
