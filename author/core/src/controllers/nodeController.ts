import { NextFunction, Request, Response } from 'express';
import config from '../config/config';
import * as fs from 'node:fs';
import { ScrNode, ScrType } from '@aemm/common';

// get Node under path
export const getNode = (req: Request, res: Response, next: NextFunction) => {
  try {
    const requestPath = req.path.replace(/\/$/, '');
    const contentRoot = config.contentRoot;
    const fullPath = contentRoot + requestPath;
    const contentJsonFullPath = fullPath + '/.content.json';

    if (fs.existsSync(fullPath)) {
      const stats = fs.statSync(fullPath);
      if (stats.isDirectory()) {
        const entries = fs.readdirSync(fullPath, { withFileTypes: true });

        const children = entries
          .filter((entry) => !entry.name.startsWith('.'))
          .map(
            (entry) =>
              ({
                type: ScrType.FOLDER,
                title: entry.name,
              }) as ScrNode,
          );

        let contentData: ScrNode;
        try {
          const data = fs.readFileSync(contentJsonFullPath, 'utf8');
          contentData = JSON.parse(data);
        } catch (err) {
          // .content.json doesn't exist, use default
          contentData = returnDefaultFolderNode();
        }

        contentData.children = children;

        res.json(contentData);
        return;
      } else if (stats.isFile()) {
        const fileContent = fs.readFileSync(fullPath, 'utf-8');
        res.json(JSON.parse(fileContent));
        return;
      }
    }
    res.status(404).end();
  } catch (error) {
    next(error);
  }
};

function returnDefaultFolderNode(): ScrNode {
  return {
    type: ScrType.FOLDER,
    title: 'default folder node',
  } as ScrNode;
}
