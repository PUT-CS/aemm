import fs from 'node:fs';
import { addInfoEvent } from '../middlewares/requestLogger';
import path from 'node:path';
import config from '../config/config';
import { Request, Response } from 'express';
import { logger } from '../logger';


/**
 * Validates request path and return the full filesystem path for SCR content.
 * @throws {Error} if the path is forbidden or not found. Sends appropriate HTTP response.
 */
export function reqToScrPath(req: Request, res: Response): string {
  const contentRoot = path.resolve(config.contentRoot);
  const relativePath = req.path.replace(/^\/scr/, '');
  const fullPath = path.join(contentRoot, relativePath);

  if (!fullPath.startsWith(contentRoot)) {
    addInfoEvent(req, res, 'forbidden', {
      reason: 'path traversal',
    });
    res.status(403).end();
    throw new Error('Forbidden path traversal');
  }

  if (!fs.existsSync(fullPath)) {
    addInfoEvent(req, res, 'notFound', { path: req.path });
    res.status(404).end();
    throw new Error('not found');
  }

  return fullPath;
}


export function serverErrorLog(err: unknown, res:Response): void {
  logger.error('Unhandled error', {
    error: (err as Error).message,
  });
  res.status(500).end();
}