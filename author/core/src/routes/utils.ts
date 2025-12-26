import fs from 'node:fs';
import { addInfoEvent } from '../middlewares/requestLogger';
import path from 'node:path';
import config from '../config/config';
import { Request, Response } from 'express';
import { logger } from '../logger';
import { NodeType, ScrNode } from '@aemm/common';
import { z } from 'zod';
import { randomUUID } from 'node:crypto';

/**
 * Validates request path and return the full filesystem path for SCR content.
 * @throws {Error} if the path is forbidden or not found. Sends appropriate HTTP response.
 */
export function parseReqPath(
  req: Request,
  res: Response,
  prefix: string,
  create: boolean = false,
): string | undefined {
  const contentRoot = path.resolve(config.contentRoot);
  const relativePath = req.path.replace(new RegExp(`^\\/${prefix}`), '');
  const fullPath = path.join(contentRoot, relativePath);

  if (!fullPath.startsWith(contentRoot)) {
    addInfoEvent(req, res, 'forbidden', {
      reason: 'path traversal',
    });
    res.status(403).end();
    return undefined;
  }

  // Don't check existence if we are creating new content
  if (!create) {
    if (!fs.existsSync(fullPath)) {
      addInfoEvent(req, res, 'notFound', { path: req.path });
      res.status(404).end();
      return undefined;
    }
  }

  return fullPath;
}

/**
 * Utility function for highest level throw in routes function
 */
export function serverErrorLog(err: unknown, res: Response): void {
  logger.error('Unhandled error', {
    error: (err as Error).message,
  });
  res.status(500).end();
}

export function parseRequestBody<T>(body: unknown): T {
  return typeof body === 'string' ? JSON.parse(body) : (body as T);
}

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
 * Backs up the provided node data to a timestamped JSON file next to the original file.
 */
export function backupNode(filePath: string, node: unknown): void {
  const nodeData = node as ScrNode;

  const timestamp = nodeData.updatedAt;

  const dir = path.dirname(filePath);
  const backupFileName = `.content-${timestamp}.json`;
  const backupPath = path.join(dir, backupFileName);

  fs.writeFileSync(backupPath, JSON.stringify(nodeData, null, 2), 'utf8');
}

export function validateNodeSchema(
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
export function addIdAndTimestamps(node: ScrNode): ScrNode {
  const updatedNode = { ...node };

  // Assign a new UUID if not present or blank
  if (!updatedNode.id || updatedNode.id.trim() === '') {
    updatedNode.id = randomUUID();
  }

  updatedNode.createdAt = updatedNode.createdAt || new Date().getTime();
  updatedNode.updatedAt = new Date().getTime();

  return updatedNode;
}

/**
 * Removes the children field from node data before persisting to disk.
 * Children should be determined at runtime by reading the filesystem.
 */
export interface HasChildren {
  children?: unknown;
}
export function removeChildrenField(data: HasChildren): unknown {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { children, ...rest } = data;
  return rest;
}
