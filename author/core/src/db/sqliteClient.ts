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
        .then(() =>
          run('PRAGMA journal_mode = WAL;', [], { skipSerialize: true }),
        )
        .then(() =>
          run('PRAGMA foreign_keys = ON;', [], { skipSerialize: true }),
        )
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
            `CREATE TABLE IF NOT EXISTS users (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              name TEXT NOT NULL UNIQUE,
              passwordHash TEXT NOT NULL,
              role TEXT NOT NULL
            );`,
            [],
            { skipSerialize: true },
          ),
        )
        .then(async () => {
          await migrateUsersTableIfNeeded();
        })
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

export function get<T = unknown>(
  sql: string,
  params: unknown[] = [],
): Promise<T | undefined> {
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

export function all<T = unknown>(
  sql: string,
  params: unknown[] = [],
): Promise<T[]> {
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

interface RunInfo {
  lastID: number;
  changes: number;
}
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

let usersEnsured = false;
export async function ensureUsersTable(): Promise<void> {
  if (usersEnsured) return;
  const database = getDatabase();
  await new Promise<void>((resolve, reject) => {
    database.serialize(() => {
      database.run(
        `CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE,
          passwordHash TEXT NOT NULL,
          role TEXT NOT NULL
        );`,
        async (err) => {
          if (err) {
            reject(err);
            return;
          }
          try {
            await migrateUsersTableIfNeeded();
            usersEnsured = true;
            resolve();
          } catch (e) {
            reject(e);
          }
        },
      );
    });
  });
}

async function migrateUsersTableIfNeeded(): Promise<void> {
  const database = getDatabase();
  const info = await all<{ name: string; type: string }>(
    "SELECT name, type FROM sqlite_master WHERE type='table' AND name='users';",
  );
  if (!info.length) return; // table doesn't exist yet
  const columns = await all<{ name: string }>('PRAGMA table_info(users);');
  const hasId = columns.some((c) => c.name === 'id');
  if (hasId) return; // already migrated

  // Detect old column naming (password_hash vs passwordHash)
  const hasOldPassword = columns.some((c) => c.name === 'password_hash');
  const passwordCol = hasOldPassword ? 'password_hash' : 'passwordHash';

  await new Promise<void>((resolve, reject) => {
    database.serialize(() => {
      database.run('BEGIN TRANSACTION;');
      database.run('ALTER TABLE users RENAME TO users_old;', (e) => {
        if (e) {
          database.run('ROLLBACK;');
          reject(e);
        }
      });
      database.run(
        `CREATE TABLE users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE,
          passwordHash TEXT NOT NULL,
          role TEXT NOT NULL
        );`,
        (e) => {
          if (e) {
            database.run('ROLLBACK;');
            reject(e);
          }
        },
      );
      database.run(
        `INSERT INTO users (name, passwordHash, role)
         SELECT name, ${passwordCol} as passwordHash, role FROM users_old;`,
        (e) => {
          if (e) {
            database.run('ROLLBACK;');
            reject(e);
          }
        },
      );
      database.run('DROP TABLE users_old;', (e) => {
        if (e) {
          database.run('ROLLBACK;');
          reject(e);
        }
      });
      database.run('COMMIT;', (e) => {
        if (e) {
          reject(e);
          return;
        }
        resolve();
      });
    });
  });
}
