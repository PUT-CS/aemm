import { Request, Response } from 'express';
import * as fs from 'node:fs';
import path from 'path';
import { addInfoEvent } from '../middlewares/requestLogger';
import { logger } from '../logger';
import { ScrNode } from '@aemm/common';
import {
  addIdAndTimestamps,
  backupNode,
  HasChildren,
  parseReqPath,
  removeChildrenField,
  serverErrorLog,
  validateNodeSchema,
  parseRequestBody,
} from './utils';

/**
 * Creates a new node with metadata (JSON content).
 */
export const createNode = (req: Request, res: Response) => {
  const fullPath = parseReqPath(req, res, 'scr', true);
  if (!fullPath) {
    return;
  }

  try {
    if (!req.body) {
      addInfoEvent(req, res, 'createNode.badRequest', { reason: 'no body' });
      res.status(400).send('Request body is required');
      return;
    }

    const exists = fs.existsSync(fullPath);
    addInfoEvent(req, res, 'createNode.nodeExists', { exists });

    if (exists) {
      addInfoEvent(req, res, 'createNode.alreadyExists');
      res.status(409).send('Node already exists');
      return;
    }

    // Ensure parent directory exists
    const dirPath = path.dirname(fullPath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    try {
      let jsonData = parseRequestBody<ScrNode>(req.body);

      jsonData = addIdAndTimestamps(jsonData);

      // Validate node schema
      if (!validateNodeSchema(jsonData, req, res)) {
        return;
      }

      // Create the folder itself
      fs.mkdirSync(fullPath, { recursive: true });

      // Write as .content.json (without children field)
      const contentJsonPath = fullPath + '/.content.json';
      const dataToWrite = removeChildrenField(
        jsonData as unknown as HasChildren,
      );
      fs.writeFileSync(
        contentJsonPath,
        JSON.stringify(dataToWrite, null, 2),
        'utf8',
      );
      addInfoEvent(req, res, 'createNode.nodeCreated');
      res.status(201).json(jsonData);
      return;
    } catch (err: unknown) {
      addInfoEvent(req, res, 'createNode.invalidJsonBody', {
        error: (err as Error).message,
      });
      res.status(400).send('Invalid JSON');
      return;
    }
  } catch (err: unknown) {
    serverErrorLog(err, res);
    return;
  }
};

/**
 * Edits an existing node's metadata (JSON content).
 * Handles renaming if the name field changes.
 */
export const editNode = (req: Request, res: Response) => {
  const fullPath = parseReqPath(req, res, 'scr');
  if (!fullPath) {
    return;
  }

  try {
    if (!req.body) {
      addInfoEvent(req, res, 'editNode.badRequest', { reason: 'no body' });
      res.status(400).send('Request body is required');
      return;
    }

    const stats = fs.statSync(fullPath);

    if (!stats.isDirectory()) {
      addInfoEvent(req, res, 'editNode.notDirectory');
      res.status(400).send('Can only edit directories');
      return;
    }

    const contentJsonPath = fullPath + '/.content.json';

    // Read existing data to check for rename
    let existingData = null;
    if (fs.existsSync(contentJsonPath)) {
      try {
        const existingContent = fs.readFileSync(contentJsonPath, 'utf8');
        existingData = JSON.parse(existingContent);
      } catch (err) {
        logger.warn('Could not read existing content.json', {
          path: contentJsonPath,
          error: (err as Error).message,
        });
      }
    }

    const newData = parseRequestBody<ScrNode>(req.body);

    // If name has changed, rename the directory
    if (
      existingData &&
      existingData.name &&
      newData.name &&
      existingData.name !== newData.name
    ) {
      const parentDir = path.dirname(fullPath);
      const newPath = path.join(parentDir, newData.name);

      // Check if target path already exists
      if (fs.existsSync(newPath)) {
        addInfoEvent(req, res, 'editNode.nameConflict', {
          oldName: existingData.name,
          newName: newData.name,
        });
        res
          .status(409)
          .send(`A node with name "${newData.name}" already exists`);
        return;
      }

      // Rename the directory
      fs.renameSync(fullPath, newPath);
      addInfoEvent(req, res, 'editNode.nodeRenamed', {
        oldPath: fullPath,
        newPath: newPath,
      });

      // Write the updated content to the new location (without children field)
      const newContentJsonPath = newPath + '/.content.json';
      let dataToWrite = <ScrNode>(
        removeChildrenField(newData as unknown as HasChildren)
      );

      // Backup old content and update timestamps
      backupNode(newContentJsonPath, dataToWrite);
      dataToWrite = addIdAndTimestamps(dataToWrite);
      fs.writeFileSync(
        newContentJsonPath,
        JSON.stringify(dataToWrite, null, 2),
        'utf8',
      );
      res.status(200).json(newData);
      return;
    }

    // No rename needed, just update the content (without children field)
    let dataToWrite = <ScrNode>(
      removeChildrenField(newData as unknown as HasChildren)
    );

    backupNode(contentJsonPath, dataToWrite);
    dataToWrite = addIdAndTimestamps(dataToWrite);
    fs.writeFileSync(
      contentJsonPath,
      JSON.stringify(dataToWrite, null, 2),
      'utf8',
    );
    addInfoEvent(req, res, 'editNode.metadataUpdated');
    res.status(200).json(newData);
    return;
  } catch (err: unknown) {
    serverErrorLog(err, res);
    return;
  }
};
