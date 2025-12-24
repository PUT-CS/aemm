import { Request, Response } from 'express';
import * as fs from 'node:fs';
import path from 'path';
import { logger } from '../logger';
import { parseReqPath, serverErrorLog } from './util';

/**
 * Uploads an asset file (binary or text content).
 * Handles file creation and updates for non-JSON content.
 */
export const uploadAsset = (req: Request, res: Response) => {
  try {
    const fullPath = parseReqPath(req, res, 'scr', true);

    if (!req.body) {
      logger.warn('uploadAsset bad request (no body)');
      res.status(400).send('Request body is required');
      return;
    }

    const exists = fs.existsSync(fullPath);
    logger.debug(`File exists: ${exists}`);

    // Handle file creation or update
    const dirPath = path.dirname(fullPath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    // Handle binary/text content
    if (!Buffer.isBuffer(req.body)) {
      logger.warn('Invalid body (not buffer) for asset upload');
      res.status(400).send('Invalid request body format');
      return;
    }

    fs.writeFileSync(fullPath, req.body);
    const statusCode = exists ? 200 : 201;
    logger.info('File content written', { bytes: (req.body as Buffer).length });
    res.status(statusCode).send(req.body);
    return;
  } catch (err: unknown) {
    serverErrorLog(err, res);
    return;
  }
};
