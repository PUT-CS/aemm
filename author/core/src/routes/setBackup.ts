import { Request, Response } from 'express';
import path from 'path';
import { addInfoEvent } from '../middlewares/requestLogger';
import fs from 'node:fs';
import { parseReqPath, serverErrorLog } from './utils';

export function setBackup(req: Request, res: Response) {
  const fullPath = parseReqPath(req, res, 'backup');
  if (!fullPath) {
    return;
  }

  try {
    if (!/\.content-.*\.json$/i.test(path.basename(fullPath))) {
      addInfoEvent(req, res, 'setBackup.invalidFile', {
        reason: 'not a backup file',
      });
      res.status(400).end();
      return;
    }

    const dir = path.dirname(fullPath);
    const targetPath = path.join(dir, '.content.json');
    fs.renameSync(fullPath, targetPath);
    res.status(200).end();
    return;
  } catch (err: unknown) {
    serverErrorLog(err, res);
    return;
  }
}
