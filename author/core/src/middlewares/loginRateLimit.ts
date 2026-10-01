import type { NextFunction, Request, Response } from 'express';
import { addInfoEvent } from './requestLogger';

const MAX_FAILED_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;
const MAX_TRACKED_KEYS = 10_000;

interface FailedAttempts {
  count: number;
  firstAt: number;
}

const failedAttempts = new Map<string, FailedAttempts>();

function attemptKey(req: Request): string {
  return `${req.ip}:${String(req.body?.username ?? '')}`;
}

function isExpired(entry: FailedAttempts, now: number): boolean {
  return now - entry.firstAt >= WINDOW_MS;
}

function pruneExpired(now: number) {
  for (const [key, entry] of failedAttempts) {
    if (isExpired(entry, now)) failedAttempts.delete(key);
  }
}

export function loginRateLimit(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const now = Date.now();
  const entry = failedAttempts.get(attemptKey(req));

  if (entry && !isExpired(entry, now) && entry.count >= MAX_FAILED_ATTEMPTS) {
    const retryAfterSeconds = Math.ceil(
      (entry.firstAt + WINDOW_MS - now) / 1000,
    );
    addInfoEvent(req, res, 'auth.login.rateLimited', {
      username: req.body?.username,
      retryAfterSeconds,
    });
    res.set('Retry-After', String(retryAfterSeconds));
    res.status(429).json({ message: 'Too many failed login attempts' });
    return;
  }

  next();
}

export function recordFailedLogin(req: Request) {
  const now = Date.now();
  if (failedAttempts.size >= MAX_TRACKED_KEYS) pruneExpired(now);

  const key = attemptKey(req);
  const entry = failedAttempts.get(key);

  if (!entry || isExpired(entry, now)) {
    failedAttempts.set(key, { count: 1, firstAt: now });
  } else {
    entry.count++;
  }
}

export function clearFailedLogins(req: Request) {
  failedAttempts.delete(attemptKey(req));
}
