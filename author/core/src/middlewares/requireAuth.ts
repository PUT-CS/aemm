import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { addInfoEvent } from './requestLogger';
import { getJwtSecret, type AuthPayload } from '../auth/authService';
import { Db } from '../db/db';

export interface AuthenticatedRequest extends Request {
  user?: AuthPayload;
}

/**
 * Middleware that requires a valid Bearer token in the Authorization header.
 * On success, attaches the user as currently stored in the database to req.user.
 */
export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  const authHeader =
    req.headers['authorization'] || req.headers['Authorization'];

  if (!authHeader || typeof authHeader !== 'string') {
    addInfoEvent(req, res, 'auth.missingHeader');
    res.status(401).json({ message: 'Missing Authorization header' });
    return;
  }

  const prefix = 'Bearer ';
  if (!authHeader.startsWith(prefix)) {
    addInfoEvent(req, res, 'auth.malformedHeader');
    res.status(401).json({ message: 'Invalid Authorization header format' });
    return;
  }

  const token = authHeader.slice(prefix.length).trim();

  if (!token) {
    addInfoEvent(req, res, 'auth.emptyToken');
    res.status(401).json({ message: 'Missing token' });
    return;
  }

  let decoded: AuthPayload;
  try {
    decoded = jwt.verify(token, getJwtSecret()) as AuthPayload;
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      addInfoEvent(req, res, 'auth.tokenExpired', { message: err.message });
      res.status(401).json({ message: 'Token expired' });
      return;
    }

    if (err instanceof jwt.JsonWebTokenError) {
      addInfoEvent(req, res, 'auth.tokenInvalid', { message: err.message });
      res.status(401).json({ message: 'Invalid token' });
      return;
    }

    addInfoEvent(req, res, 'auth.verifyFailed', {
      message: err instanceof Error ? err.message : 'Unknown error',
    });
    next(err);
    return;
  }

  const user = await Db.getUser(decoded.username);
  if (!user || user.id !== decoded.id) {
    addInfoEvent(req, res, 'auth.userGone', { username: decoded.username });
    res.status(401).json({ message: 'Invalid token' });
    return;
  }

  req.user = { id: user.id!, username: user.username, role: user.role };

  addInfoEvent(req, res, 'auth.authenticated', {
    username: user.username,
    role: user.role,
  });

  next();
}
