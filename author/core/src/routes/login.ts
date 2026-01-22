import type { NextFunction, Request, Response } from 'express';
import { Db } from '../db/db';
import type { AppError } from '../middlewares/errorHandler';
import { addInfoEvent } from '../middlewares/requestLogger';
import { signAccessToken, verifyPassword } from '../auth/authService';
import { z } from 'zod';

const loginBodySchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export async function login(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parseResult = loginBodySchema.safeParse(req.body ?? {});

    if (!parseResult.success) {
      addInfoEvent(req, res, 'auth.login.validationFailed', {
        reason: 'missing or invalid username/password',
        issues: parseResult.error.issues,
      });

      res.status(400).json({ message: 'Invalid request body' });
      return;
    }

    const { username, password } = parseResult.data;

    // 2. Fetch user
    const user = await Db.getUser(username);
    if (!user) {
      // Do not leak whether the user exists; just say invalid credentials
      addInfoEvent(req, res, 'auth.login.invalidCredentials', {
        username,
      });

      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    // 3. Verify password
    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      addInfoEvent(req, res, 'auth.login.invalidCredentials', {
        username,
      });

      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    // 4. Issue JWT
    const token = signAccessToken({
      id: user.id!,
      username: user.username,
      role: user.role,
    });

    addInfoEvent(req, res, 'auth.login.success', {
      userId: user.id,
      username: user.username,
      role: user.role,
    });

    // 5. Success response
    res.status(200).json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (err: unknown) {
    const error: AppError =
      err instanceof Error ? (err as AppError) : new Error('Unknown error');

    // Mark as internal error; centralized errorHandler will format the response
    error.status = 500;

    addInfoEvent(req, res, 'auth.login.failed', {
      message: error.message,
      username: req.body?.username,
    });

    next(error);
  }
}
