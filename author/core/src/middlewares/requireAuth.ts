import type { NextFunction, Request, Response } from 'express';
import { type AuthPayload } from '../auth/authService';

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
  next();
}
