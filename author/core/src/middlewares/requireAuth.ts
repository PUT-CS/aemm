import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { addInfoEvent } from './requestLogger';
import {
  getJwtSecret,
  type AuthPayload,
  type TokenPayload,
} from '../auth/authService';
import { Db } from '../db/db';
import { CSRF_HEADER, SESSION_COOKIE } from '../auth/sessionCookie';

export interface AuthenticatedRequest extends Request {
  user?: AuthPayload;
}

const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS'];

/**
 * Middleware that requires a valid session cookie.
 * On success, attaches the user as currently stored in the database to req.user.
 */
export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  const token = req.cookies[SESSION_COOKIE];
  if (!token) {
    addInfoEvent(req, res, 'auth.noSession');
    res.status(401).json({ message: 'Not logged in' });
    return;
  }

  if (!SAFE_METHODS.includes(req.method) && !req.headers[CSRF_HEADER]) {
    addInfoEvent(req, res, 'auth.missingCsrfHeader');
    res.status(403).json({ message: 'Missing X-AEMM-Request header' });
    return;
  }

  let decoded: TokenPayload;
  try {
    decoded = jwt.verify(token, getJwtSecret()) as TokenPayload;
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
  if (
    !user ||
    user.id !== decoded.id ||
    user.tokenVersion !== decoded.tokenVersion
  ) {
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
