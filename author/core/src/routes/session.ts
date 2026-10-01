import type { Request, Response } from 'express';
import { clearSessionCookie } from '../auth/sessionCookie';
import { addInfoEvent } from '../middlewares/requestLogger';
import type { AuthenticatedRequest } from '../middlewares/requireAuth';

export function me(req: AuthenticatedRequest, res: Response) {
  res.status(200).json(req.user);
}

export function logout(req: Request, res: Response) {
  clearSessionCookie(res);
  addInfoEvent(req, res, 'auth.logout');
  res.status(204).end();
}
