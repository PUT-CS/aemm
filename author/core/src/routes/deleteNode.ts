import { Request, Response } from 'express';
import path from 'path';
import config from '../config/config';
import { addInfoEvent } from '../middlewares/requestLogger';
import fs from 'node:fs';
import { logger } from '../logger';


export const deleteNode = (req: Request, res: Response) => {
  try {
    const contentRoot = path.resolve(config.contentRoot);
    const relativePath = req.path.replace(/^\/scr/, '');
    const fullPath = path.join(contentRoot, relativePath);

    if (!fullPath.startsWith(contentRoot)) {
      addInfoEvent(req, res, 'deleteNode.forbidden', { reason: 'path traversal' });
      res.status(403).end();
      return;
    }

    if (!fs.existsSync(fullPath)) {
      addInfoEvent(req, res, 'deleteNode.notFound', { path: req.path });
      res.status(404).end();
      return;
    }

    fs.rmSync(fullPath, {recursive: true, force: true});
    res.status(200).end();
    return;

  } catch (err: unknown) {
    logger.error('Unhandled deleteNode error', {
      error: (err as Error).message,
    });
    res.status(500).end();
    return;
  }
}
