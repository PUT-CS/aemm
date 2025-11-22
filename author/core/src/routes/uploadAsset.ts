import { Request, Response } from 'express';
import config from '../config/config';
import * as fs from 'node:fs';
import path from 'path';
import { logger } from '../logger';

/**
 * Uploads an asset file (binary or text content).
 * Handles file creation and updates for non-JSON content.
 */
export const uploadAsset = (req: Request, res: Response) => {
  try {
    const contentType = req.get('Content-Type') || '';
    const contentRoot = config.contentRoot;
    const fullPath = path.resolve(contentRoot + req.path);

    if (!fullPath.startsWith(path.resolve(contentRoot))) {
      logger.warn('uploadAsset forbidden', { path: req.path, status: 403 });
      res.status(403).end();
      return;
    }

    if (!req.body) {
      logger.warn('uploadAsset bad request (no body)', {
        path: req.path,
        status: 400,
        requestContentType: contentType,
      });
      res.status(400).send('Request body is required');
      return;
    }

    const exists = fs.existsSync(fullPath);

    // Handle file creation or update
    const dirPath = path.dirname(fullPath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    // Handle binary/text content
    if (!Buffer.isBuffer(req.body)) {
      logger.warn('Invalid body (not buffer) for asset upload', {
        path: req.path,
        status: 400,
      });
      res.status(400).send('Invalid request body format');
      return;
    }

    fs.writeFileSync(fullPath, req.body);
    const statusCode = exists ? 200 : 201;
    logger.info('File content written', {
      path: req.path,
      bytes: (req.body as Buffer).length,
      status: statusCode,
      responseContentType: contentType || 'application/octet-stream',
    });
    res.status(statusCode).send(req.body);
    return;
  } catch (err: unknown) {
    logger.error('Unhandled uploadAsset error', {
      path: req.path,
      error: (err as Error).message,
      status: 500,
    });
    res.status(500).end();
    return;
  }
};
