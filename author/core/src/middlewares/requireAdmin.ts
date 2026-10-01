import type { NextFunction, Response } from 'express';
import { addInfoEvent } from './requestLogger';
import type { AuthenticatedRequest } from './requireAuth';

/**
 * Middleware that requires the authenticated user to have the admin role.
 * Must be used after requireAuth.
 */
export function requireAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  if (req.user?.role !== 'admin') {
    addInfoEvent(req, res, 'auth.forbidden', {
      username: req.user?.username,
      role: req.user?.role,
    });
    res.status(403).json({ message: 'Admin role required' });
    return;
  }

  next();
}
