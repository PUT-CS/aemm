import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import fs from 'node:fs';
import path from 'node:path';
import config from '../config/config';
import { logger } from '../logger';
import { z } from 'zod';
import { hashPassword } from '../auth/authService';

export const userSchema = z.object({
  id: z.number().int().optional(),
  username: z.string().min(1),
  passwordHash: z.string().min(1),
  role: z.string().min(1),
  createdAt: z.number().int().optional(),
  updatedAt: z.number().int().optional(),
});

export type User = z.infer<typeof userSchema>;

export class Database {
  /* eslint-disable  @typescript-eslint/no-explicit-any */
  db: any = null;

  public constructor(private readonly databasePath: string) {
    logger.info('Database will connect to', { databasePath });
  }

  public async init(): Promise<void> {
    const dir = path.dirname(this.databasePath);
    if (!fs.existsSync(dir)) {
      try {
        fs.mkdirSync(dir, { recursive: true });
        logger.info('Created database directory', { dir });
      } catch (err) {
        logger.error('Failed to create database directory', {
          dir,
          error: (err as Error).message,
        });
        process.exit(1);
      }
    }

    this.db = await open({
      filename: this.databasePath,
      driver: sqlite3.Database,
    });

    logger.info('Database connected', { databasePath: this.databasePath });
    await this.createTables();
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    logger.info('Initializing database tables...');

    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
                                         id INTEGER PRIMARY KEY AUTOINCREMENT,
                                         username TEXT NOT NULL UNIQUE,
                                         passwordHash TEXT NOT NULL,
                                         role TEXT NOT NULL,
                                         createdAt INTEGER NOT NULL,
                                         updatedAt INTEGER NOT NULL
      );
    `);

    const result = await this.db.get(`
      SELECT COUNT(*) AS count
      FROM users;
    `);
    logger.info('Found entries in users table', {
      count: result?.count || 0,
    });

    await this.ensureDefaultAdminUser();
  }

  private async ensureDefaultAdminUser(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const existingAdmin = await this.db.get(
      'SELECT id FROM users WHERE username = ?;',
      'admin',
    );

    if (existingAdmin) {
      logger.info('Default admin user already exists');
      return;
    }

    const now = Date.now();
    const passwordHash = await hashPassword('admin123');

    await this.db.run(
      'INSERT INTO users (username, passwordHash, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?);',
      'admin',
      passwordHash,
      'admin',
      now,
      now,
    );

    logger.info('Default admin user created', { username: 'admin' });
  }

  public async close(): Promise<void> {
    if (!this.db) {
      return;
    }

    await this.db.close();
    this.db = null;
    logger.info('Database connection closed');
  }

  public async getAllUsers(): Promise<Array<User>> {
    if (!this.db) throw new Error('Database not initialized');

    const rows = await this.db.all(
      'SELECT id, username, passwordHash, role, createdAt, updatedAt FROM users ORDER BY id;',
    );
    return rows.map((row: unknown) => userSchema.parse(row));
  }

  public async getUser(username: string): Promise<User | undefined> {
    if (!this.db) throw new Error('Database not initialized');

    const row = await this.db.get(
      'SELECT id, username, passwordHash, role, createdAt, updatedAt FROM users WHERE username = ?;',
      username,
    );
    return row ? userSchema.parse(row) : undefined;
  }

  public async createUser(user: User): Promise<User> {
    if (!this.db) throw new Error('Database not initialized');

    const { username, passwordHash, role } = userSchema
      .pick({ username: true, passwordHash: true, role: true })
      .parse(user);

    const now = Date.now();

    const result = await this.db.run(
      'INSERT INTO users (username, passwordHash, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?);',
      username,
      passwordHash,
      role,
      now,
      now,
    );

    const createdUser = await this.db.get(
      'SELECT id, username, passwordHash, role, createdAt, updatedAt FROM users WHERE id = ?;',
      result.lastID,
    );

    return userSchema.parse(createdUser);
  }

  public async updateUser(
    username: string,
    updates: { passwordHash?: string; role?: string },
  ): Promise<{ lastID: number; changes: number }> {
    if (!this.db) throw new Error('Database not initialized');

    const sets: string[] = [];
    const params: unknown[] = [];

    if (updates.passwordHash !== undefined) {
      sets.push('passwordHash = COALESCE(?, passwordHash)');
      params.push(updates.passwordHash ?? null);
    }
    if (updates.role !== undefined) {
      sets.push('role = COALESCE(?, role)');
      params.push(updates.role ?? null);
    }

    if (sets.length === 0) {
      return { lastID: 0, changes: 0 };
    }

    sets.push('updatedAt = ?');
    params.push(Date.now());

    const sql = `UPDATE users SET ${sets.join(', ')} WHERE username = ?;`;
    params.push(username);

    const result = await this.db.run(sql, ...params);
    return { lastID: result.lastID, changes: result.changes };
  }

  public async deleteUser(
    username: string,
  ): Promise<{ lastID: number; changes: number }> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.run(
      'DELETE FROM users WHERE username = ?;',
      username,
    );
    return { lastID: result.lastID, changes: result.changes };
  }
}

export const Db = new Database(config.databasePath);
