import type { NextFunction, Request, Response } from 'express';
import { Db } from '../db/db';
import type { AppError } from '../middlewares/errorHandler';
import { addInfoEvent } from '../middlewares/requestLogger';
import { signAccessToken, verifyPasswordOrDummy } from '../auth/authService';
import {
  clearFailedLogins,
  recordFailedLogin,
} from '../middlewares/loginRateLimit';
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

    const user = await Db.getUser(username);
    const valid = await verifyPasswordOrDummy(password, user?.passwordHash);
    if (!user || !valid) {
      recordFailedLogin(req);
      addInfoEvent(req, res, 'auth.login.invalidCredentials', {
        username,
      });

      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    clearFailedLogins(req);

    const token = signAccessToken({
      id: user.id!,
      username: user.username,
      role: user.role,
      tokenVersion: user.tokenVersion!,
    });

    addInfoEvent(req, res, 'auth.login.success', {
      userId: user.id,
      username: user.username,
      role: user.role,
    });

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

    error.status = 500;

    addInfoEvent(req, res, 'auth.login.failed', {
      message: error.message,
      username: req.body?.username,
    });

    next(error);
  }
}
