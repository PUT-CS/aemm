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
    logger.info('Users listed', { count: users.length });
    res.json(users);
  } catch (err) {
    const error: AppError =
      err instanceof Error ? err : new Error('Unknown error');
    error.status = 500;
    logger.error('Failed to list users', { error: error.message });
    next(error);
  }
}

export async function getUser(req: Request, res: Response, next: NextFunction) {
  try {
    await ensureUsersTable();
    const name = req.params.name;
    if (!name || typeof name !== 'string') {
      logger.warn('Invalid name parameter in getUser', { name });
      res.status(400).json({ message: 'Invalid name' });
      return;
    }
    const user = await get<UserRow>(
      'SELECT id, name, passwordHash, role FROM users WHERE name = ?;',
      [name],
    );
    if (!user) {
      logger.warn('User not found', { name });
      res.status(404).json({ message: 'Not found' });
      return;
    }
    logger.info('User retrieved', { name, id: user.id });
    res.json(user);
  } catch (err) {
    const error: AppError =
      err instanceof Error ? err : new Error('Unknown error');
    error.status = 500;
    logger.error('Failed to get user', {
      name: req.params.name,
      error: error.message,
    });
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
      logger.warn('Missing or invalid name in createUser', { name });
      res.status(400).json({ message: 'name is required' });
      return;
    }
    if (!passwordHash || typeof passwordHash !== 'string') {
      logger.warn('Missing or invalid passwordHash in createUser', { name });
      res.status(400).json({ message: 'passwordHash is required' });
      return;
    }
    if (!role || typeof role !== 'string') {
      logger.warn('Missing or invalid role in createUser', { name, role });
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
      logger.info('User created successfully', { name, id: lastId, role });
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
    logger.error('Failed to create user', {
      name: req.body?.name,
      error: error.message,
    });
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
      logger.warn('Invalid name parameter in updateUser', { name });
      res.status(400).json({ message: 'Invalid name' });
      return;
    }
    const { passwordHash, role } = req.body || {};
    if (passwordHash && typeof passwordHash !== 'string') {
      logger.warn('Invalid passwordHash type in updateUser', { name });
      res.status(400).json({ message: 'passwordHash must be string' });
      return;
    }
    if (role && typeof role !== 'string') {
      logger.warn('Invalid role type in updateUser', { name, role });
      res.status(400).json({ message: 'role must be string' });
      return;
    }

    const sets: string[] = [];
    const params: unknown[] = [];
    const fieldsToUpdate: string[] = [];

    if (passwordHash !== undefined) {
      sets.push('passwordHash = COALESCE(?, passwordHash)');
      params.push(passwordHash ?? null);
      fieldsToUpdate.push('passwordHash');
    }
    if (role !== undefined) {
      sets.push('role = COALESCE(?, role)');
      params.push(role ?? null);
      fieldsToUpdate.push('role');
    }

    if (sets.length === 0) {
      logger.warn('No fields to update in updateUser', { name });
      res.status(400).json({ message: 'No fields to update' });
      return;
    }

    const sql = `UPDATE users SET ${sets.join(', ')} WHERE name = ?;`;
    params.push(name);

    await runWithInfo(sql, params);
    logger.info('User updated successfully', {
      name,
      fieldsUpdated: fieldsToUpdate
    });

    const user = await get<UserRow>(
      'SELECT id, name, passwordHash, role FROM users WHERE name = ?;',
      [name],
    );
    if (!user) {
      logger.warn('User not found after update', { name });
      res.status(404).json({ message: 'Not found' });
      return;
    }
    res.json(user);
  } catch (err) {
    const error: AppError =
      err instanceof Error ? err : new Error('Unknown error');
    error.status = 500;
    logger.error('Failed to update user', {
      name: req.params.name,
      error: error.message,
    });
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
      logger.warn('Invalid name parameter in deleteUser', { name });
      res.status(400).json({ message: 'Invalid name' });
      return;
    }
    const info = await runWithInfo('DELETE FROM users WHERE name = ?;', [name]);
    if (!info.changes) {
      logger.warn('User not found for deletion', { name });
      res.status(404).json({ message: 'Not found' });
      return;
    }
    logger.info('User deleted successfully', { name, deletedCount: info.changes });
    res.status(204).end();
  } catch (err) {
    const error: AppError =
      err instanceof Error ? err : new Error('Unknown error');
    error.status = 500;
    logger.error('Failed to delete user', {
      name: req.params.name,
      error: error.message,
    });
    next(error);
  }
}
