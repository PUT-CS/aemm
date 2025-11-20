import { Request, Response } from 'express';
import config from '../config/config';
import * as fs from 'node:fs';
import { ScrNode, ScrType } from '@aemm/common/scr';
import path from 'path';
import { logger } from '../logger';

function isScrNode(obj: unknown): obj is ScrNode {
  if (!obj || typeof obj !== 'object') return false;

  const node = obj as Record<string, unknown>;

  if (!node.type || !node.name || typeof node.name !== 'string') return false;
  if (!Object.values(ScrType).includes(node.type as ScrType)) return false;

  if (node.type === ScrType.FOLDER && node.children) {
    if (!Array.isArray(node.children)) return false;
    return node.children.every(isScrNode);
  }

  return true;
}

function readFileContent(filePath: string): string {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (err) {
    logger.error('File read error', {
      filePath,
      error: (err as Error).message,
    });
    throw err;
  }
}

function getChildrenNodes(path: string): ScrNode[] {
  const entries = fs.readdirSync(path, { withFileTypes: true });
  return entries.map(
    (entry) =>
      ({
        type: entry.isDirectory() ? ScrType.FOLDER : ScrType.FILE,
        name: entry.name,
      }) as ScrNode,
  );
}

function cleanPath(inputPath: string): string {
  // Remove multiple slashes and trailing slash
  const path = inputPath.replace(/\/+/g, '/').replace(/\/$/, '');

  // Remove /scr and everything before it
  const scrIndex = path.indexOf('/scr');
  if (scrIndex === -1) {
    throw new Error('Path does not contain /scr');
  }
  const relativePath = path.substring(scrIndex + 4); // 4 is length of '/scr'

  return relativePath === '' ? '/' : relativePath;
}

// get Node under path
export const getNode = (req: Request, res: Response) => {
  try {
    const cleanedPath = cleanPath(req.path);
    const contentRoot = config.contentRoot;
    const fullPath = path.resolve(contentRoot + cleanedPath);

    if (!fullPath.startsWith(path.resolve(contentRoot))) {
      logger.warn('getNode forbidden', { path: req.path, status: 403 });
      res.status(403).end();
      return;
    }

    const fullPathExists = fs.existsSync(fullPath);
    if (!fullPathExists) {
      logger.warn('Path not found', { path: req.path, status: 404 });
      res.status(404).end();
      return;
    }

    const contentJsonFullPath = fullPath + '/.content.json';
    const contentJsonExists = fs.existsSync(contentJsonFullPath);

    if (contentJsonExists) {
      try {
        const data = readFileContent(contentJsonFullPath);
        const contentData: ScrNode = JSON.parse(data);
        res.json(contentData);
        return;
      } catch (err: unknown) {
        logger.error('Failed to parse .content.json', {
          path: req.path,
          error: (err as Error).message,
          status: 422,
        });
        res.status(422).end();
        return;
      }
    }

    if (!contentJsonExists) {
      // .content.json does not exist, handle as a directory
      const stats = fs.statSync(fullPath);
      if (stats.isDirectory()) {
        // Read directory contents, don't parse to JSON, since it could be any type of file
        const children = getChildrenNodes(fullPath);
        const folderNode: ScrNode = {
          type: ScrType.FOLDER,
          name: path.basename(fullPath),
          children: children,
        };
        logger.info('getNode success (directory)', {
          path: req.path,
          status: 200,
          responseContentType: 'application/json',
        });
        res.json(folderNode);
        return;
      } else if (stats.isFile()) {
        // don't parse to JSON, since it could be any type of file
        const content = readFileContent(fullPath);
        logger.info('getNode success (file)', {
          path: req.path,
          status: 200,
          responseContentType: 'text/plain',
        });
        res.header('Content-Type', 'text/plain');
        res.send(content);
        return;
      } else {
        logger.info('getNode not found (neither file nor dir)', {
          path: req.path,
          status: 404,
        });
        res.status(404).end();
        return;
      }
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

export const updateNode = (req: Request, res: Response) => {
  try {
    const cleanedPath = cleanPath(req.path);
    const contentType = req.get('Content-Type') || '';
    const contentRoot = config.contentRoot;
    const fullPath = path.resolve(contentRoot + cleanedPath);

    if (!fullPath.startsWith(path.resolve(contentRoot))) {
      logger.info('updateNode forbidden', { path: req.path, status: 403 });
      res.status(403).end();
      return;
    }

    if (!req.body) {
      logger.warn('updateNode bad request (no body)', {
        path: req.path,
        status: 400,
        requestContentType: contentType,
      });
      res.status(400).send('Request body is required');
      return;
    }

    const exists = fs.existsSync(fullPath);

    if (exists) {
      const stats = fs.statSync(fullPath);

      if (stats.isDirectory()) {
        // Update .content.json for directories
        const contentJsonPath = fullPath + '/.content.json';
        fs.writeFileSync(
          contentJsonPath,
          JSON.stringify(req.body, null, 2),
          'utf8',
        );
        logger.info('Directory metadata updated', {
          path: req.path,
          status: 200,
          responseContentType: 'application/json',
        });
        res.status(200).json(req.body);
        return;
      }
    }

    // Handle file creation or update
    const dirPath = path.dirname(fullPath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    // Check if Content-Type is JSON
    if (contentType.includes('application/json')) {
      try {
        const jsonData =
          typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

        // Validate that JSON is a valid ScrNode
        if (!isScrNode(jsonData)) {
          logger.info('updateNode invalid ScrNode', {
            path: req.path,
            status: 400,
          });
          res
            .status(400)
            .send(
              'Invalid ScrNode structure: must include type and name fields, with valid ScrType enum value',
            );
          return;
        }

        // Write as .content.json
        const contentJsonPath = fullPath + '/.content.json';
        fs.writeFileSync(
          contentJsonPath,
          JSON.stringify(jsonData, null, 2),
          'utf8',
        );
        const statusCode = exists ? 200 : 201;
        logger.info('Node JSON written', {
          path: req.path,
          type: jsonData.type,
          status: statusCode,
          responseContentType: 'application/json',
        });
        res.status(statusCode).json(jsonData);
        return;
      } catch (err: unknown) {
        logger.warn('Invalid JSON body', {
          path: req.path,
          status: 400,
          error: (err as Error).message,
        });
        res.status(400).send('Invalid JSON');
        return;
      }
    }

    // Handle binary/text content
    if (!Buffer.isBuffer(req.body)) {
      logger.warn('Invalid body (not buffer) for non-JSON content', {
        path: req.path,
        status: 400,
      });
      res.status(400).send('Invalid request body format');
      return;
    }
    fs.writeFileSync(fullPath, req.body);
    const statusCode = exists ? 200 : 201;
    logger.info('File content written', {
      path: req.path,
      bytes: (req.body as Buffer).length,
      status: statusCode,
      responseContentType: contentType || 'application/octet-stream',
    });
    res.status(statusCode).send(req.body);
    return;
  } catch (err: unknown) {
    logger.error('Unhandled updateNode error', {
      path: req.path,
      error: (err as Error).message,
      status: 500,
    });
    res.status(500).end();
    return;
  }
};
