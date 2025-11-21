import { Request, Response } from 'express';
import * as fs from 'node:fs';
import { NodeType, ScrNode } from '@aemm/common/scr';
import path from 'path';
import { logger } from '../logger';
import config from '../config/config';
import { getChildrenNodes } from './util';

const handleContentJson = (
  contentJsonFullPath: string,
  requestPath: string,
  res: Response,
): boolean => {
  if (!fs.existsSync(contentJsonFullPath)) {
    return false;
  }

  try {
    const data = fs.readFileSync(contentJsonFullPath, 'utf-8');
    const contentData: ScrNode = JSON.parse(data);

    logger.info('getNode success (.content.json)', {
      path: requestPath,
      status: 200,
      responseContentType: 'application/json',
    });

    res.json(contentData);
    return true;
  } catch (err: unknown) {
    logger.error('Failed to parse .content.json', {
      path: requestPath,
      error: (err as Error).message,
      status: 422,
    });

    res.status(422).end();
    return true;
  }
};

const handleDirectory = (
  fullPath: string,
  requestPath: string,
  res: Response,
): void => {
  const children = getChildrenNodes(fullPath);
  const folderNode: ScrNode = {
    type: NodeType.FOLDER,
    name: path.basename(fullPath),
    children: children,
  };

  logger.info('getNode success (directory)', {
    path: requestPath,
    status: 200,
    responseContentType: 'application/json',
  });

  res.json(folderNode);
};

const handleFile = (
  fullPath: string,
  requestPath: string,
  res: Response,
): void => {
  const content = fs.readFileSync(fullPath, 'utf-8');

  logger.info('getNode success (file)', {
    path: requestPath,
    status: 200,
    responseContentType: 'text/plain',
  });

  res.header('Content-Type', 'text/plain');
  res.send(content);
};

export const getNode = (req: Request, res: Response) => {
  try {
    const contentRoot = path.resolve(config.contentRoot);
    // Strip /scr prefix from the request path
    const relativePath = req.path.replace(/^\/scr/, '');
    const fullPath = path.join(contentRoot, relativePath);

    logger.info('getNode path resolution', {
      requestPath: req.path,
      contentRoot,
      relativePath,
      fullPath,
      exists: fs.existsSync(fullPath),
    });

    if (!fullPath.startsWith(contentRoot)) {
      logger.warn('getNode forbidden', { path: req.path, status: 403 });
      res.status(403).end();
      return;
    }

    if (!fs.existsSync(fullPath)) {
      logger.warn('Path not found', { path: req.path, status: 404 });
      res.status(404).end();
      return;
    }

    const contentJsonFullPath = path.join(fullPath, '.content.json');
    if (handleContentJson(contentJsonFullPath, req.path, res)) {
      return;
    }

    const stats = fs.statSync(fullPath);
    if (stats.isDirectory()) {
      handleDirectory(fullPath, req.path, res);
      return;
    } else if (stats.isFile()) {
      handleFile(fullPath, req.path, res);
      return;
    } else {
      logger.warn('getNode not found (neither file nor dir)', {
        path: req.path,
        status: 404,
      });

      res.status(404).end();
      return;
    }
  } catch (err: unknown) {
    logger.error('Unhandled getNode error', {
      path: req.path,
      error: (err as Error).message,
      status: 500,
    });

    res.status(500).end();
    return;
  }
};
