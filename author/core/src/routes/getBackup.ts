import { Request, Response } from 'express';
import path from 'path';
import config from '../config/config';
import { addInfoEvent } from '../middlewares/requestLogger';
import fs from 'node:fs';

export function getBackup(req: Request, res: Response) {
  const contentRoot = path.resolve(config.contentRoot);
  const relativePath = req.path.replace(/^\/backup/, '');
  const fullPath = path.join(contentRoot, relativePath);

  addInfoEvent(req, res, 'getBackup.pathResolution', {
    exists: fs.existsSync(fullPath),
  });

  if (!fullPath.startsWith(contentRoot)) {
    addInfoEvent(req, res, 'getBackup.forbidden', { reason: 'path traversal' });
    res.status(403).end();
    return;
  }

  if (!fs.existsSync(fullPath)) {
    addInfoEvent(req, res, 'getBackup.notFound');
    res.status(404).end();
    return;
  }

  try {
    const entries = fs.readdirSync(fullPath, { withFileTypes: true });
    const result = entries
      .filter(
        (entry) => entry.isFile() && /^\.content-.*\.json$/i.test(entry.name),
      )
      .map((entry) => entry.name);
    const json = { backups: result };
    res.status(200).json(json);
    return;
  } catch (err) {
    addInfoEvent(req, res, 'getBackup.readDirError', {
      error: err instanceof Error ? err.message : String(err),
    });
    res.status(500).end();
    return;
  }
}
