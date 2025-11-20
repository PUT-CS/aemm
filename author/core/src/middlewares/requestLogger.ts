import {NextFunction, Request, Response} from 'express';

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const start = Date.now();

  // Log incoming request
  console.log(`\n→ ${req.method} ${req.path}`);
  if (Object.keys(req.query).length > 0) {
    console.log(`  Query:`, req.query);
  }
  if (req.body && Object.keys(req.body).length > 0) {
    console.log(`  Body:`, JSON.stringify(req.body, null, 2));
  }

  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusEmoji = res.statusCode < 400 ? '✓' : '✗';
    console.log(`← ${statusEmoji} ${req.method} ${req.path} ${res.statusCode} - ${duration}ms`);
  });

  next();
};
