import { Request, Response, NextFunction } from 'express';
import config from '../config/config';
import { get, all } from '../db/sqliteClient';
import { AppError } from '../middlewares/errorHandler';
import { logger } from '../logger';

export async function getDbHealth(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    // Fetch pragma values
    const journalRow = await get<{ journal_mode: string }>(
      'PRAGMA journal_mode;',
    );
    const foreignKeysRow = await get<{ foreign_keys: number }>(
      'PRAGMA foreign_keys;',
    );

    // List tables
    const tables = await all<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name ASC;",
    );

    // Migrations count (if table exists)
    let migrationsCount = 0;
    if (tables.find((t) => t.name === 'migrations')) {
      const row = await get<{ count: number }>(
        'SELECT COUNT(*) as count FROM migrations;',
      );
      migrationsCount = row?.count ?? 0;
    }

    const payload = {
      ok: true,
      databasePath: config.databasePath,
      pragmas: {
        journal_mode: journalRow?.journal_mode,
        foreign_keys: foreignKeysRow?.foreign_keys === 1,
      },
      tables: tables.map((t) => t.name),
      migrationsCount,
    };
    logger.debug('DB health fetched', { tables: payload.tables.length });
    res.json(payload);
  } catch (err) {
    const error: AppError =
      err instanceof Error ? err : new Error('Unknown error');
    error.status = 500;
    logger.error('DB health error', { message: (err as Error).message });
    next(error);
  }
}
