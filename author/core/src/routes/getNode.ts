import { Request, Response } from 'express';
import * as fs from 'node:fs';
import { ScrNode } from '@aemm/common/scr';
import path from 'path';
import { addInfoEvent } from '../middlewares/requestLogger';
import { parseReqPath, serverErrorLog } from './util';

const handleContentJson = (
  contentJsonFullPath: string,
  requestPath: string,
  req: Request,
  res: Response,
): boolean => {
  if (!fs.existsSync(contentJsonFullPath)) {
    return false;
  }

  try {
    const data = fs.readFileSync(contentJsonFullPath, 'utf-8');
    const contentData: ScrNode = JSON.parse(data);
    addInfoEvent(req, res, 'getNode.contentJson', {
      responseContentType: 'application/json',
    });
    res.json(contentData);
    return true;
  } catch (err: unknown) {
    addInfoEvent(req, res, 'getNode.contentJson.parseFailed', {
      reason: (err as Error).message,
    });
    res.status(422).end();
    return true;
  }
};

const handleFile = (
  fullPath: string,
  requestPath: string,
  req: Request,
  res: Response,
): void => {
  const content = fs.readFileSync(fullPath, 'utf-8');
  addInfoEvent(req, res, 'getNode.file', {
    responseContentType: 'text/plain',
  });
  res.header('Content-Type', 'text/plain');
  res.send(content);
};

export const getNode = (req: Request, res: Response) => {
  const fullPath = parseReqPath(req, res, 'scr');
  if (!fullPath) {
    return;
  }

  try {
    const contentJsonFullPath = path.join(fullPath, '.content.json');
    if (handleContentJson(contentJsonFullPath, req.path, req, res)) {
      return;
    }

    const stats = fs.statSync(fullPath);
    if (stats.isFile()) {
      handleFile(fullPath, req.path, req, res);
      return;
    } else {
      addInfoEvent(req, res, 'getNode.unexpectedType');
      res.status(404).end();
      return;
    }
  } catch (err: unknown) {
    serverErrorLog(err, res);
    return;
  }
};
