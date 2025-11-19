import sqlite3 from 'sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import config from '../config/config';

sqlite3.verbose();

let db: sqlite3.Database | null = null;

export async function initDatabase(): Promise<sqlite3.Database> {
  if (db) {
    return db;
  }

  const dir = path.dirname(config.databasePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  db = await new Promise<sqlite3.Database>((resolve, reject) => {
    const instance = new sqlite3.Database(config.databasePath, (error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(instance);
    });
  });

  const database = getDatabase();
  await new Promise<void>((resolve, reject) => {
    database.serialize(() => {
      Promise.resolve()
        .then(() => run('PRAGMA journal_mode = WAL;', [], { skipSerialize: true }))
        .then(() => run('PRAGMA foreign_keys = ON;', [], { skipSerialize: true }))
        .then(() =>
          run(
            `CREATE TABLE IF NOT EXISTS migrations (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              name TEXT NOT NULL UNIQUE,
              applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );`,
            [],
            { skipSerialize: true },
          ),
        )
        .then(() =>
          run(
            `CREATE TABLE IF NOT EXISTS test_items (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              name TEXT NOT NULL,
              value TEXT,
              created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
              updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );`,
            [],
            { skipSerialize: true },
          ),
        )
        .then(resolve)
        .catch(reject);
    });
  });

  return db;
}

export function getDatabase(): sqlite3.Database {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

export async function closeDatabase(): Promise<void> {
  if (!db) {
    return;
  }

  await new Promise<void>((resolve, reject) => {
    db?.close((error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });

  db = null;
}

interface RunOptions {
  skipSerialize?: boolean;
}

export function run(
  sql: string,
  params: unknown[] = [],
  options: RunOptions = {},
): Promise<void> {
  const database = getDatabase();
  const executor = () =>
    new Promise<void>((resolve, reject) => {
      database.run(sql, params, (error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    });

  return options.skipSerialize
    ? executor()
    : new Promise<void>((resolve, reject) => {
        database.serialize(() => {
          executor().then(resolve).catch(reject);
        });
      });
}

export function get<T = unknown>(sql: string, params: unknown[] = []): Promise<T | undefined> {
  const database = getDatabase();
  return new Promise((resolve, reject) => {
    database.get(sql, params, (error, row) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(row as T | undefined);
    });
  });
}

export function all<T = unknown>(sql: string, params: unknown[] = []): Promise<T[]> {
  const database = getDatabase();
  return new Promise((resolve, reject) => {
    database.all(sql, params, (error, rows) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(rows as T[]);
    });
  });
}

interface RunInfo { lastID: number; changes: number }
export function runWithInfo(
  sql: string,
  params: unknown[] = [],
  options: RunOptions = {},
): Promise<RunInfo> {
  const database = getDatabase();
  const executor = () =>
    new Promise<RunInfo>((resolve, reject) => {
      database.run(sql, params, function (error) {
        if (error) {
          reject(error);
          return;
        }
        resolve({ lastID: this.lastID, changes: this.changes });
      });
    });

  return options.skipSerialize
    ? executor()
    : new Promise<RunInfo>((resolve, reject) => {
        database.serialize(() => {
          executor().then(resolve).catch(reject);
        });
      });
}

let testItemsEnsured = false;
export async function ensureTestItemsTable(): Promise<void> {
  if (testItemsEnsured) return;
  const database = getDatabase();
  await new Promise<void>((resolve, reject) => {
    database.serialize(() => {
      database.run(
        `CREATE TABLE IF NOT EXISTS test_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          value TEXT,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );`,
        (err) => {
          if (err) {
            reject(err);
            return;
          }
          testItemsEnsured = true;
          resolve();
        },
      );
    });
  });
}
