import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { addInfoEvent } from './requestLogger';
import { getJwtSecret, type AuthPayload } from '../auth/authService';

export interface AuthenticatedRequest extends Request {
  user?: AuthPayload;
}

/**
 * Middleware that requires a valid Bearer token in the Authorization header.
 * On success, attaches the decoded AuthPayload to req.user.
 */
export function requireAuth(
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
    addInfoEvent(req, res, 'auth.malformedHeader', { header: authHeader });
    res.status(401).json({ message: 'Invalid Authorization header format' });
    return;
  }

  const token = authHeader.slice(prefix.length).trim();

  if (!token) {
    addInfoEvent(req, res, 'auth.emptyToken');
    res.status(401).json({ message: 'Missing token' });
    return;
  }

  try {
    const secret = getJwtSecret();
    const decoded = jwt.verify(token, secret) as AuthPayload;

    req.user = decoded;

    addInfoEvent(req, res, 'auth.authenticated', {
      username: decoded.username,
      role: decoded.role,
    });

    next();
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
  }
}
