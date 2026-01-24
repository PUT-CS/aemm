import { NextFunction, Request, Response } from 'express';
import { addInfoEvent } from './requestLogger';

export interface AppError extends Error {
  status?: number;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
) => {
  const status = err.status || 500;

  addInfoEvent(req, res, 'request.error', {
    message: err.message || 'Internal Server Error',
    errorName: err.name,
  });

  res.status(status).json({
    message: err.message || 'Internal Server Error',
  });
};
