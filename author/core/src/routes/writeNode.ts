import { Request, Response } from 'express';
import config from '../config/config';
import * as fs from 'node:fs';
import path from 'path';
import { logger } from '../logger';
import { isScrNode } from './util';
import { v7 as uuidv7 } from 'uuid';
import { addInfoEvent } from '../middlewares/requestLogger';

export const writeNode = (req: Request, res: Response) => {
  try {
    const contentType = req.get('Content-Type') || '';
    const contentRootResolved = path.resolve(config.contentRoot);
    const relativePath = req.path.replace(/^\/scr/, '');
    const fullPath = path.join(contentRootResolved, relativePath);

    if (!fullPath.startsWith(contentRootResolved)) {
      addInfoEvent(req, res, 'writeNode.forbidden', {
        reason: 'path traversal',
      });
      res.status(403).end();
      return;
    }

    if (!req.body) {
      addInfoEvent(req, res, 'writeNode.validationFailed', {
        reason: 'missing body',
      });
      res.status(400).send('Request body is required');
      return;
    }

    const exists = fs.existsSync(fullPath);

    if (exists) {
      const stats = fs.statSync(fullPath);
      if (stats.isDirectory()) {
        const contentJsonPath = path.join(fullPath, '.content.json');
        fs.writeFileSync(
          contentJsonPath,
          JSON.stringify(req.body, null, 2),
          'utf8',
        );
        addInfoEvent(req, res, 'writeNode.directoryMetadataUpdated', {});
        res.status(200).json(req.body);
        return;
      }
    }

    const dirPath = path.dirname(fullPath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      addInfoEvent(req, res, 'writeNode.directoriesCreated', { dirPath });
    }

    if (contentType.includes('application/json')) {
      try {
        const jsonData =
          typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        jsonData.id = uuidv7();

        if (!isScrNode(jsonData)) {
          addInfoEvent(req, res, 'writeNode.invalidScrNode', {
            reason: 'structure mismatch',
          });
          res
            .status(400)
            .send(
              'Invalid ScrNode structure: must include type and name fields, with valid ScrType enum value',
            );
          return;
        }

        const contentJsonPath = path.join(fullPath, '.content.json');
        fs.writeFileSync(
          contentJsonPath,
          JSON.stringify(jsonData, null, 2),
          'utf8',
        );
        const statusCode = exists ? 200 : 201;
        addInfoEvent(req, res, 'writeNode.jsonWritten', {
          type: jsonData.type,
        });
        res.status(statusCode).json(jsonData);
        return;
      } catch (err: unknown) {
        addInfoEvent(req, res, 'writeNode.jsonParseFailed', {
          error: (err as Error).message,
        });
        res.status(400).send('Invalid JSON');
        return;
      }
    }

    if (!Buffer.isBuffer(req.body)) {
      addInfoEvent(req, res, 'writeNode.validationFailed', {
        reason: 'non-buffer for binary/text',
      });
      res.status(400).send('Invalid request body format');
      return;
    }
    fs.writeFileSync(fullPath, req.body);
    const statusCode = exists ? 200 : 201;
    addInfoEvent(req, res, 'writeNode.fileWritten', {
      bytes: (req.body as Buffer).length,
    });
    res.status(statusCode).send(req.body);
    return;
  } catch (err: unknown) {
    logger.error('Unhandled writeNode error', {
      path: req.path,
      error: (err as Error).message,
      status: 500,
    });
    res.status(500).end();
    return;
  }
};
