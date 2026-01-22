import { Request, Response, NextFunction } from 'express';
import { Db } from '../db/db';
import { AppError } from '../middlewares/errorHandler';
import { addInfoEvent } from '../middlewares/requestLogger';
import { z } from 'zod';
import { hashPassword } from '../auth/authService';

export async function fetchUsers(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const users = await Db.getAllUsers();
    addInfoEvent(_req, res, 'users.listed', { count: users.length });
    res.json(users).status(200);
  } catch (err) {
    const error: AppError =
      err instanceof Error ? err : new Error('Unknown error');
    error.status = 500;
    // Attach context event instead of direct error log
    addInfoEvent(_req, res, 'users.list.failed', { message: error.message });
    next(error);
  }
}

export async function getUser(req: Request, res: Response, next: NextFunction) {
  try {
    const name = req.params.name;
    if (!name) {
      addInfoEvent(req, res, 'user.get.validationFailed', {
        reason: 'missing name param',
      });
      res.status(400).json({ message: 'Invalid name' });
      return;
    }
    const user = await Db.getUser(name);
    if (!user) {
      addInfoEvent(req, res, 'user.get.notFound', { name });
      res.status(404).json({ message: 'Not found' });
      return;
    }
    addInfoEvent(req, res, 'user.retrieved', { name });
    res.json(user);
  } catch (err) {
    const error: AppError =
      err instanceof Error ? err : new Error('Unknown error');
    error.status = 500;
    addInfoEvent(req, res, 'user.get.failed', {
      name: req.params.name,
      message: error.message,
    });
    next(error);
  }
}

// Public API schema: client sends plain password
const createUserBodySchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
  role: z.string().min(1),
});

export async function createUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const parseResult = createUserBodySchema.safeParse(req.body ?? {});

    if (!parseResult.success) {
      addInfoEvent(req, res, 'user.create.validationFailed', {
        errors: parseResult.error.issues,
      });
      res
        .status(400)
        .json({ message: 'Invalid user', errors: parseResult.error.issues });
      return;
    }

    const { username, password, role } = parseResult.data;

    // Hash the plain-text password before storing
    const passwordHash = await hashPassword(password);

    // This object must match Db.createUser expectations (userSchema: username, passwordHash, role)
    const userInput = {
      username,
      passwordHash,
      role,
    };

    try {
      const created = await Db.createUser(userInput as never);

      addInfoEvent(req, res, 'user.created', {
        name: created.username,
        role: created.role,
      });

      // Do not expose passwordHash in the response
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { passwordHash: _ignored, ...safeUser } = created;

      res.status(201).json(safeUser);
    } catch (e) {
      if (e instanceof Error && /SQLITE_CONSTRAINT/.test(e.message)) {
        addInfoEvent(req, res, 'user.create.duplicate', {
          name: username,
        });
        res.status(409).json({ message: 'User with this name already exists' });
        return;
      }
      throw e;
    }
  } catch (err) {
    const error: AppError =
      err instanceof Error ? err : new Error('Unknown error');
    error.status = 500;
    addInfoEvent(req, res, 'user.create.failed', {
      name: req.body?.username,
      message: error.message,
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
    if (!name) {
      addInfoEvent(req, res, 'user.update.validationFailed', {
        reason: 'missing name param',
      });
      res.status(400).json({ message: 'Invalid name' });
      return;
    }

    const { password, role } = req.body || {};

    if (password !== undefined && typeof password !== 'string') {
      addInfoEvent(req, res, 'user.update.validationFailed', {
        reason: 'password not string',
      });
      res.status(400).json({ message: 'password must be string' });
      return;
    }

    if (role !== undefined && typeof role !== 'string') {
      addInfoEvent(req, res, 'user.update.validationFailed', {
        reason: 'role not string',
        role,
      });
      res.status(400).json({ message: 'role must be string' });
      return;
    }

    const fieldsToUpdate: string[] = [];
    const updates: { passwordHash?: string; role?: string } = {};

    if (role !== undefined) {
      updates.role = role;
      fieldsToUpdate.push('role');
    }

    if (fieldsToUpdate.length === 0) {
      addInfoEvent(req, res, 'user.update.validationFailed', {
        reason: 'no fields provided',
      });
      res.status(400).json({ message: 'No fields to update' });
      return;
    }

    const result = await Db.updateUser(name, updates);
    if (!result.changes) {
      addInfoEvent(req, res, 'user.update.notFound', { name });
      res.status(404).json({ message: 'Not found' });
      return;
    }

    const user = await Db.getUser(name);
    if (!user) {
      addInfoEvent(req, res, 'user.update.postFetchMissing', { name });
      res.status(404).json({ message: 'Not found' });
      return;
    }
    addInfoEvent(req, res, 'user.updated', {
      name,
      fieldsUpdated: fieldsToUpdate,
    });
    res.json(user);
  } catch (err) {
    const error: AppError =
      err instanceof Error ? err : new Error('Unknown error');
    error.status = 500;
    addInfoEvent(req, res, 'user.update.failed', {
      name: req.params.name,
      message: error.message,
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
    if (!name) {
      addInfoEvent(req, res, 'user.delete.validationFailed', {
        reason: 'missing name param',
      });
      res.status(400).json({ message: 'Invalid name' });
      return;
    }
    const info = await Db.deleteUser(name);
    if (!info.changes) {
      addInfoEvent(req, res, 'user.delete.notFound', { name });
      res.status(404).json({ message: 'Not found' });
      return;
    }
    addInfoEvent(req, res, 'user.deleted', {
      name,
      deletedCount: info.changes,
    });
    res.status(204).end();
  } catch (err) {
    const error: AppError =
      err instanceof Error ? err : new Error('Unknown error');
    error.status = 500;
    addInfoEvent(req, res, 'user.delete.failed', {
      name: req.params.name,
      message: error.message,
    });
    next(error);
  }
}
