import { NextFunction, Request, Response } from 'express';
import config from '../config/config';
import * as fs from 'node:fs';

// get Node under path
export const getNode = (req: Request, res: Response, next: NextFunction) => {
  try {
    const path = req.path;
    const contentRoot = config.contentRoot;
    const fullPath = contentRoot + path;
    const contentJsonFullPath = fullPath + '/.content.json';

    // sprawdz czy podana sciezka istnieje
    // sprawdz czy to katalog czy plik
    // jesli katalog to zwroc dzieci katalogu (?) i ich conten.json wtedy?
    // jesli plik to zwroc zawartosc pliku
    if (fs.existsSync(fullPath)) {
      const stats = fs.statSync(fullPath);
      // const contentStats = fs.existsSync(contentJsonFullPath);
      if (stats.isDirectory()) {
        res.json({
          message: 'Directory exists',
          fullPath,
          contentJsonFullPath,
        });
        return;
      } else if (stats.isFile()) {
        res.json({ message: 'File exists', fullPath, contentJsonFullPath });
        return;
      }
    }

    res.json({ fullPath, contentJsonFullPath });
  } catch (error) {
    next(error);
  }
};
