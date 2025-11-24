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
    const contentRoot = config.contentRoot;
    const fullPath = path.resolve(contentRoot + req.path);

    if (!fullPath.startsWith(path.resolve(contentRoot))) {
      logger.warn('updateNode forbidden', { path: req.path, status: 403 });
      res.status(403).end();
      return;
    }

    if (!req.body) {
      logger.warn('updateNode bad request (no body)', {
        path: req.path,
        status: 400,
      });
      res.status(400).send('Request body is required');
      return;
    }

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
        logger.info('Directory metadata updated', {
          path: req.path,
          status: 200,
          responseContentType: 'application/json',
        });
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
        logger.warn('updateNode invalid ScrNode', {
          path: req.path,
          status: 400,
        });
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
      const statusCode = exists ? 200 : 201;
      logger.info('Node JSON written', {
        path: req.path,
        type: jsonData.type,
        status: statusCode,
        responseContentType: 'application/json',
      });
      res.status(statusCode).json(jsonData);
      return;
    } catch (err: unknown) {
      logger.warn('Invalid JSON body', {
        path: req.path,
        status: 400,
        error: (err as Error).message,
      });
      res.status(400).send('Invalid JSON');
      return;
    }
  } catch (err: unknown) {
    logger.error('Unhandled updateNode error', {
      path: req.path,
      error: (err as Error).message,
      status: 500,
    });
    res.status(500).end();
    return;
  }
};
