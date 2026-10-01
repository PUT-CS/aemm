import type { CookieOptions, Response } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config/config';

export const SESSION_COOKIE = 'aemm_session';
export const CSRF_HEADER = 'x-aemm-request';

const cookieOptions: CookieOptions = {
  httpOnly: true,
  sameSite: 'strict',
  secure: config.nodeEnv === 'production',
  path: '/',
};

export function setSessionCookie(res: Response, token: string) {
  const { exp } = jwt.decode(token) as { exp: number };
  res.cookie(SESSION_COOKIE, token, {
    ...cookieOptions,
    expires: new Date(exp * 1000),
  });
}

export function clearSessionCookie(res: Response) {
  res.clearCookie(SESSION_COOKIE, cookieOptions);
}
