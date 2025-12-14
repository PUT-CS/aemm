import { Request, Response } from 'express';
import path from 'path';
import config from '../config/config';
import { addInfoEvent } from '../middlewares/requestLogger';
import fs from 'node:fs';

export function setBackup(req: Request, res: Response) {
  const contentRoot = path.resolve(config.contentRoot);
  const relativePath = req.path.replace(/^\/backup/, '');
  const fullPath = path.join(contentRoot, relativePath);

  console.log(fullPath);
  addInfoEvent(req, res, 'setBackup.pathResolution', {
    exists: fs.existsSync(fullPath),
  });

  if (!fullPath.startsWith(contentRoot)) {
    addInfoEvent(req, res, 'setBackup.forbidden', { reason: 'path traversal' });
    res.status(403).end();
    return;
  }

  if (!fs.existsSync(fullPath)) {
    addInfoEvent(req, res, 'setBackup.notFound');
    res.status(404).end();
    return;
  }

  const dir = path.dirname(fullPath);
  const targetPath = path.join(dir, '.content.json');
  fs.renameSync(fullPath, targetPath);
  res.status(200);
  return;
}
