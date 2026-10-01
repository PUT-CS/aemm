import { Request, Response } from 'express';
import { addInfoEvent } from '../middlewares/requestLogger';
import fs from 'node:fs';
import { isContentRoot, parseReqPath, serverErrorLog } from './utils';

export const deleteNode = (req: Request, res: Response) => {
  const fullPath = parseReqPath(req, res, 'scr');
  if (!fullPath) {
    return;
  }

  if (isContentRoot(fullPath)) {
    addInfoEvent(req, res, 'deleteNode.forbidden', {
      reason: 'cannot delete content root',
    });
    res.status(403).end();
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
