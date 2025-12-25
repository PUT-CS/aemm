import { Request, Response } from 'express';
import * as fs from 'node:fs';
import path from 'path';
import { addInfoEvent } from '../middlewares/requestLogger';
import { parseReqPath, serverErrorLog } from './util';

/**
 * Uploads an asset file (binary or text content).
 * Handles file creation and updates for non-JSON content.
 */
export const uploadAsset = (req: Request, res: Response) => {
  const fullPath = parseReqPath(req, res, 'scr', true);
  if (!fullPath) {
    return;
  }

  try {
    if (!req.body) {
      addInfoEvent(req, res, 'uploadAsset.badRequest', { reason: 'no body' });
      res.status(400).send('Request body is required');
      return;
    }

    const exists = fs.existsSync(fullPath);
    addInfoEvent(req, res, 'uploadAsset.fileExists', { exists });

    // Handle file creation or update
    const dirPath = path.dirname(fullPath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    // Handle binary/text content
    if (!Buffer.isBuffer(req.body)) {
      addInfoEvent(req, res, 'uploadAsset.invalidBody', {
        reason: 'not buffer',
      });
      res.status(400).send('Invalid request body format');
      return;
    }

    fs.writeFileSync(fullPath, req.body);
    const statusCode = exists ? 200 : 201;
    addInfoEvent(req, res, 'uploadAsset.fileWritten', {
      bytes: (req.body as Buffer).length,
      statusCode,
    });
    res.status(statusCode).send(req.body);
    return;
  } catch (err: unknown) {
    serverErrorLog(err, res);
    return;
  }
};
