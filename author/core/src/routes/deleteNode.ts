import { Request, Response } from 'express';
import { addInfoEvent } from '../middlewares/requestLogger';
import fs from 'node:fs';
import { parseReqPath, serverErrorLog } from './util';

export const deleteNode = (req: Request, res: Response) => {
  const fullPath = parseReqPath(req, res, 'scr');
  if (!fullPath) {
    return;
  }

  try {
    fs.rmSync(fullPath, { recursive: true, force: true });
    addInfoEvent(req, res, 'deleteNode.success', { path: req.path });
    res.status(200).end();
    return;
  } catch (err: unknown) {
    serverErrorLog(err, res);
    return;
  }
};
