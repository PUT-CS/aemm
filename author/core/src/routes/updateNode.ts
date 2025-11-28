import { Request, Response } from 'express';
import config from '../config/config';
import * as fs from 'node:fs';
import path from 'path';
import { addInfoEvent } from '../middlewares/requestLogger';
import { randomUUID } from 'node:crypto';
import { logger } from '../logger';
import { z } from 'zod';
import { NodeType } from '@aemm/common';

// @ts-expect-error -- recursive schema
const incomingScrNodeSchema = z.lazy(() =>
  z
    .object({
      type: z.enum(NodeType),
      id: z.uuidv4(),
      name: z.string().min(1),
      children: z.array(incomingScrNodeSchema).optional(),
    })
    .strict(),
);

/**
 * Updates a node's metadata (JSON content).
 * Handles SCR nodes and directory metadata updates.
 */
export const updateNode = (req: Request, res: Response) => {
  try {
    const requestPath = req.path.replace(/^\/scr/, '');
    const contentRoot = config.contentRoot;
    const fullPath = path.resolve(contentRoot + requestPath);

    if (!fullPath.startsWith(path.resolve(contentRoot))) {
      addInfoEvent(req, res, 'updateNode.forbidden');
      res.status(403).end();
      return;
    }

    if (!req.body) {
      addInfoEvent(req, res, 'updateNode.badRequest', { reason: 'no body' });
      res.status(400).send('Request body is required');
      return;
    }

    const exists = fs.existsSync(fullPath);
    addInfoEvent(req, res, 'updateNode.nodeExists', { exists });

    if (exists) {
      const stats = fs.statSync(fullPath);

      if (stats.isDirectory()) {
        const contentJsonPath = fullPath + '/.content.json';
        fs.writeFileSync(
          contentJsonPath,
          JSON.stringify(req.body, null, 2),
          'utf8',
        );
        addInfoEvent(req, res, 'updateNode.directoryMetadataUpdated');
        res.status(200).json(req.body);
        return;
      }
    }

    // Handle node creation or update
    const dirPath = path.dirname(fullPath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    try {
      const jsonData =
        typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

      // Assign a new UUID if not present
      jsonData.id = randomUUID();

      // Validate that JSON is a valid ScrNode
      const validationResult = incomingScrNodeSchema.safeParse(jsonData);
      if (!validationResult.success) {
        addInfoEvent(req, res, 'updateNode.invalidScrNode');
        res.status(400).send('Invalid ScrNode structure');
        return;
      }

      // Create the folder itself if it doesn't exist
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
      }

      // Write as .content.json
      const contentJsonPath = fullPath + '/.content.json';
      fs.writeFileSync(
        contentJsonPath,
        JSON.stringify(jsonData, null, 2),
        'utf8',
      );
      const statusCode = exists ? 200 : 201;
      addInfoEvent(req, res, 'updateNode.nodeJsonWritten');
      res.status(statusCode).json(jsonData);
      return;
    } catch (err: unknown) {
      addInfoEvent(req, res, 'updateNode.invalidJsonBody', {
        error: (err as Error).message,
      });
      res.status(400).send('Invalid JSON');
      return;
    }
  } catch (err: unknown) {
    logger.error('Unhandled updateNode error', {
      error: (err as Error).message,
    });
    res.status(500).end();
    return;
  }
};
