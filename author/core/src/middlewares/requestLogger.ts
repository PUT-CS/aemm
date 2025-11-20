import { NextFunction, Request, Response } from 'express';
import { logger, requestLogFields } from '../logger';

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('Request completed', {
      ...requestLogFields(req),
      statusCode: res.statusCode,
      durationMs: duration,
    });
  });

  next();
};
