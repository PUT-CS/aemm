import { NextFunction, Request, Response } from 'express';
import config from '../config/config';
import * as fs from 'node:fs';

// get Node under path
export const getNode = (req: Request, res: Response, next: NextFunction) => {
  try {
    const requestPath = req.path;
    const contentRoot = config.contentRoot;
    const fullPath = contentRoot + requestPath;
    const contentJsonFullPath = fullPath + '/.content.json';

    // sprawdz czy podana sciezka istnieje
    // sprawdz czy to katalog czy plik
    // jesli katalog to zwroc scr node typu directory i content json dzieci pierwszego poziomu
    // jesli plik to zwroc zawartosc pliku
    if (fs.existsSync(fullPath)) {
      const stats = fs.statSync(fullPath);
      if (stats.isDirectory()) {
        const entries = fs.readdirSync(fullPath, { withFileTypes: true });

        const children = entries
          .filter((entry) => !entry.name.startsWith('.'))
          .map((entry) => ({
            name: entry.name,
            path: requestPath + entry.name,
            type: entry.isDirectory() ? 'aemm:folder' : 'aemm:file',
          }));

        let contentData;
        try {
          const data = fs.readFileSync(contentJsonFullPath, 'utf8');
          contentData = JSON.parse(data);
        } catch (err) {
          // .content.json doesn't exist, use default
          contentData = {
            'scr:type': 'aemm:folder',
            path: requestPath,
          };
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
    res.json({ fullPath, contentJsonFullPath });
  } catch (error) {
    next(error);
  }
};
