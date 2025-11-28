import { NextFunction, Request, Response } from 'express';
import { logger, requestLogFields } from '../logger';

export interface InfoEvent {
  event: string;
  data?: Record<string, unknown>;
}

interface ResponseLocalsWithEvents {
  infoEvents?: InfoEvent[];
}

export function addInfoEvent(
  _req: Request,
  res: Response,
  event: string,
  data?: Record<string, unknown>,
) {
  const locals = res.locals as ResponseLocalsWithEvents;
  if (!locals.infoEvents) locals.infoEvents = [];
  locals.infoEvents.push({ event, data });
}

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;
    const level =
      statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';
    const logMeta: Record<string, unknown> = {
      ...requestLogFields(req),
      statusCode,
      durationMs: duration,
    };
    const locals = res.locals as ResponseLocalsWithEvents;
    if (locals.infoEvents && locals.infoEvents.length) {
      logMeta.infoEvents = locals.infoEvents;
    }
    if (level === 'error') {
      logger.error('Request completed', logMeta);
    } else if (level === 'warn') {
      logger.warn('Request completed', logMeta);
    } else {
      logger.info('Request completed', logMeta);
    }
  });

  next();
};
