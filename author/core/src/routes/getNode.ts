import { Request, Response } from 'express';
import * as fs from 'node:fs';
import { NodeType, ScrNode } from '@aemm/common/scr';
import path from 'path';
import { logger } from '../logger';
import config from '../config/config';
import { getChildrenNodes } from './util';
import { addInfoEvent } from '../middlewares/requestLogger';

type ScrNodeWithChildren = ScrNode & { children?: ScrNodeWithChildren[] };

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

const handleDirectory = (
  fullPath: string,
  requestPath: string,
  req: Request,
  res: Response,
): void => {
  const children = getChildrenNodes(fullPath);
  const folderNode: ScrNodeWithChildren = {
    type: NodeType.FOLDER,
    name: path.basename(fullPath),
    children: children,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  addInfoEvent(req, res, 'getNode.directory', {
    responseContentType: 'application/json',
  });
  res.json(folderNode);
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
  try {
    const contentRoot = path.resolve(config.contentRoot);
    const relativePath = req.path.replace(/^\/scr/, '');
    const fullPath = path.join(contentRoot, relativePath);

    addInfoEvent(req, res, 'getNode.pathResolution', {
      exists: fs.existsSync(fullPath),
    });

    if (!fullPath.startsWith(contentRoot)) {
      addInfoEvent(req, res, 'getNode.forbidden', { reason: 'path traversal' });
      res.status(403).end();
      return;
    }

    if (!fs.existsSync(fullPath)) {
      addInfoEvent(req, res, 'getNode.notFound', { path: req.path });
      res.status(404).end();
      return;
    }

    const contentJsonFullPath = path.join(fullPath, '.content.json');
    if (handleContentJson(contentJsonFullPath, req.path, req, res)) {
      return;
    }

    const stats = fs.statSync(fullPath);
    if (stats.isDirectory()) {
      handleDirectory(fullPath, req.path, req, res);
      return;
    } else if (stats.isFile()) {
      handleFile(fullPath, req.path, req, res);
      return;
    } else {
      addInfoEvent(req, res, 'getNode.unexpectedType', { path: req.path });
      res.status(404).end();
      return;
    }
  } catch (err: unknown) {
    logger.error('Unhandled getNode error', {
      error: (err as Error).message,
    });
    res.status(500).end();
    return;
  }
};
