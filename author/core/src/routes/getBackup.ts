import { Request, Response } from 'express';
import fs from 'node:fs';
import { parseReqPath, serverErrorLog } from './util';

export function getBackup(req: Request, res: Response) {
  const fullPath = parseReqPath(req, res, 'backup');
  if (!fullPath) {
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
    serverErrorLog(err, res);
    return;
  }
}
