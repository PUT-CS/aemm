import { Request, Response, NextFunction } from 'express';
import { all, get, runWithInfo, ensureUsersTable } from '../db/sqliteClient';
import { AppError } from '../middlewares/errorHandler';
import { logger } from '../logger';

interface UserRow {
  id: number;
  name: string;
  passwordHash: string;
  role: string;
}

export async function listUsers(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    await ensureUsersTable();
    const users = await all<UserRow>(
      'SELECT id, name, passwordHash, role FROM users ORDER BY id ASC;',
    );
    res.json(users);
  } catch (err) {
    const error: AppError =
      err instanceof Error ? err : new Error('Unknown error');
    error.status = 500;
    next(error);
  }
}

export async function getUser(req: Request, res: Response, next: NextFunction) {
  try {
    await ensureUsersTable();
    const name = req.params.name;
    if (!name || typeof name !== 'string') {
      res.status(400).json({ message: 'Invalid name' });
      return;
    }
    const user = await get<UserRow>(
      'SELECT id, name, passwordHash, role FROM users WHERE name = ?;',
      [name],
    );
    if (!user) {
      res.status(404).json({ message: 'Not found' });
      return;
    }
    res.json(user);
  } catch (err) {
    const error: AppError =
      err instanceof Error ? err : new Error('Unknown error');
    error.status = 500;
    next(error);
  }
}

export async function createUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    await ensureUsersTable();
    const { name, passwordHash, role } = req.body || {};
    if (!name || typeof name !== 'string') {
      res.status(400).json({ message: 'name is required' });
      return;
    }
    if (!passwordHash || typeof passwordHash !== 'string') {
      res.status(400).json({ message: 'passwordHash is required' });
      return;
    }
    if (!role || typeof role !== 'string') {
      res.status(400).json({ message: 'role is required' });
      return;
    }
    let lastId: number | null = null;
    try {
      const info = await runWithInfo(
        'INSERT INTO users (name, passwordHash, role) VALUES (?, ?, ?);',
        [name, passwordHash, role],
      );
      lastId = info.lastID;
    } catch (e) {
      if (e instanceof Error && /SQLITE_CONSTRAINT/.test(e.message)) {
        logger.warn('Duplicate user creation attempted', { name });
        res.status(409).json({ message: 'User with this name already exists' });
        return;
      }
      throw e;
    }
    const created = await get<UserRow>(
      'SELECT id, name, passwordHash, role FROM users WHERE id = ?;',
      [lastId],
    );
    res.status(201).json(created);
  } catch (err) {
    const error: AppError =
      err instanceof Error ? err : new Error('Unknown error');
    error.status = 500;
    next(error);
  }
}

export async function updateUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    await ensureUsersTable();
    const name = req.params.name;
    if (!name || typeof name !== 'string') {
      res.status(400).json({ message: 'Invalid name' });
      return;
    }
    const { passwordHash, role } = req.body || {};
    if (passwordHash && typeof passwordHash !== 'string') {
      res.status(400).json({ message: 'passwordHash must be string' });
      return;
    }
    if (role && typeof role !== 'string') {
      res.status(400).json({ message: 'role must be string' });
      return;
    }

    const sets: string[] = [];
    const params: unknown[] = [];
    if (passwordHash !== undefined) {
      sets.push('passwordHash = COALESCE(?, passwordHash)');
      params.push(passwordHash ?? null);
    }
    if (role !== undefined) {
      sets.push('role = COALESCE(?, role)');
      params.push(role ?? null);
    }

    if (sets.length === 0) {
      res.status(400).json({ message: 'No fields to update' });
      return;
    }

    const sql = `UPDATE users SET ${sets.join(', ')} WHERE name = ?;`;
    params.push(name);

    await runWithInfo(sql, params);

    const user = await get<UserRow>(
      'SELECT id, name, passwordHash, role FROM users WHERE name = ?;',
      [name],
    );
    if (!user) {
      res.status(404).json({ message: 'Not found' });
      return;
    }
    res.json(user);
  } catch (err) {
    const error: AppError =
      err instanceof Error ? err : new Error('Unknown error');
    error.status = 500;
    next(error);
  }
}

export async function deleteUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    await ensureUsersTable();
    const name = req.params.name;
    if (!name || typeof name !== 'string') {
      res.status(400).json({ message: 'Invalid name' });
      return;
    }
    const info = await runWithInfo('DELETE FROM users WHERE name = ?;', [name]);
    if (!info.changes) {
      res.status(404).json({ message: 'Not found' });
      return;
    }
    res.status(204).end();
  } catch (err) {
    const error: AppError =
      err instanceof Error ? err : new Error('Unknown error');
    error.status = 500;
    next(error);
  }
}
