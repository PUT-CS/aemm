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

function readCookieToken(req: Request, res: Response): string | undefined {
  if (!SAFE_METHODS.includes(req.method) && !req.headers[CSRF_HEADER]) {
    addInfoEvent(req, res, 'auth.missingCsrfHeader');
    res.status(403).json({ message: 'Missing X-AEMM-Request header' });
    return undefined;
  }
  return req.cookies[SESSION_COOKIE];
}

function readBearerToken(req: Request, res: Response): string | undefined {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    addInfoEvent(req, res, 'auth.missingHeader');
    res.status(401).json({ message: 'Missing Authorization header' });
    return undefined;
  }

  const prefix = 'Bearer ';
  if (!authHeader.startsWith(prefix)) {
    addInfoEvent(req, res, 'auth.malformedHeader');
    res.status(401).json({ message: 'Invalid Authorization header format' });
    return undefined;
  }

  const token = authHeader.slice(prefix.length).trim();
  if (!token) {
    addInfoEvent(req, res, 'auth.emptyToken');
    res.status(401).json({ message: 'Missing token' });
    return undefined;
  }

  return token;
}

/**
 * Middleware that requires a valid Bearer token or session cookie.
 * Requests authenticated by the cookie that change something also need the
 * X-AEMM-Request header, which other origins can't send because of CORS.
 * On success, attaches the user as currently stored in the database to req.user.
 */
export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  const useCookie =
    !req.headers['authorization'] && req.cookies[SESSION_COOKIE];
  const token = useCookie
    ? readCookieToken(req, res)
    : readBearerToken(req, res);
  if (!token) {
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
