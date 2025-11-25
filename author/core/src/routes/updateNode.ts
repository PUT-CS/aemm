import { Request, Response } from 'express';
import config from '../config/config';
import * as fs from 'node:fs';
import path from 'path';
import { logger } from '../logger';
import { isScrNode } from './util';

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
      logger.warn('updateNode forbidden', { path: req.path, status: 403 });
      res.status(403).end();
      return;
    }

    if (!req.body) {
      logger.warn('updateNode bad request (no body)');
      res.status(400).send('Request body is required');
      return;
    }

    const exists = fs.existsSync(fullPath);
    logger.info(`Node exists: ${exists}`);

    if (exists) {
      const stats = fs.statSync(fullPath);

      if (stats.isDirectory()) {
        const contentJsonPath = fullPath + '/.content.json';
        fs.writeFileSync(
          contentJsonPath,
          JSON.stringify(req.body, null, 2),
          'utf8',
        );
        logger.info('Directory metadata updated');
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

      // Validate that JSON is a valid ScrNode
      if (!isScrNode(jsonData)) {
        logger.warn('updateNode invalid ScrNode');
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
      logger.info('Node JSON written');
      res.status(statusCode).json(jsonData);
      return;
    } catch (err: unknown) {
      logger.warn('Invalid JSON body', {
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
