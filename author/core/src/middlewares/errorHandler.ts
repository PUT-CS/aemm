import { NextFunction, Request, Response } from 'express';
import { logger } from '../logger';

export interface AppError extends Error {
  status?: number;
}

export const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
) => {
  logger.error('Request error', {
    status: err.status || 500,
    message: err.message,
  });
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
  });
};
