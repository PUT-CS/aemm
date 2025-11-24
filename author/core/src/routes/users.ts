import { Request, Response, NextFunction } from 'express';
import { Db, userSchema } from '../db/db';
import { AppError } from '../middlewares/errorHandler';
import { logger } from '../logger';

export async function listUsers(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const users = await Db.getAllUsers();
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
    const name = req.params.name;
    if (!name) {
      logger.warn('Invalid name parameter in getUser', { name });
      res.status(400).json({ message: 'Invalid name' });
      return;
    }
    const user = await Db.getUser(name);
    if (!user) {
      logger.warn('User not found', { name });
      res.status(404).json({ message: 'Not found' });
      return;
    }
    logger.info('User retrieved', { name });
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
    const user = userSchema.parse(req.body);
    try {
      const created = await Db.createUser(user);
      logger.info('User created successfully', {
        name: created.name,
        role: created.role,
      });
      res.status(201).json(created);
    } catch (e) {
      if (e instanceof Error && /SQLITE_CONSTRAINT/.test(e.message)) {
        logger.warn('Duplicate user creation attempted', { name });
        res.status(409).json({ message: 'User with this name already exists' });
        return;
      }
      throw e;
    }
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

    const fieldsToUpdate: string[] = [];
    const updates: { passwordHash?: string; role?: string } = {};

    if (passwordHash !== undefined) {
      updates.passwordHash = passwordHash;
      fieldsToUpdate.push('passwordHash');
    }
    if (role !== undefined) {
      updates.role = role;
      fieldsToUpdate.push('role');
    }

    if (fieldsToUpdate.length === 0) {
      logger.warn('No fields to update in updateUser', { name });
      res.status(400).json({ message: 'No fields to update' });
      return;
    }

    await Db.updateUser(name, updates);
    logger.info('User updated successfully', {
      name,
      fieldsUpdated: fieldsToUpdate,
    });

    const user = await Db.getUser(name);
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
    const name = req.params.name;
    if (!name || typeof name !== 'string') {
      logger.warn('Invalid name parameter in deleteUser', { name });
      res.status(400).json({ message: 'Invalid name' });
      return;
    }
    const info = await Db.deleteUser(name);
    if (!info.changes) {
      logger.warn('User not found for deletion', { name });
      res.status(404).json({ message: 'Not found' });
      return;
    }
    logger.info('User deleted successfully', {
      name,
      deletedCount: info.changes,
    });
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
