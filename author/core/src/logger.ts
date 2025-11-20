import winston from 'winston';
import config from './config/config';
import path from 'node:path';
import fs from 'node:fs';

const logDir = path.resolve(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const level = config.nodeEnv === 'production' ? 'info' : 'debug';

export const logger = winston.createLogger({
  level,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ level, message, timestamp, ...meta }) => {
      const metaStr = Object.keys(meta).length
        ? ' ' + JSON.stringify(meta)
        : '';
      return `${timestamp} ${level.toUpperCase()}: ${message}${metaStr}`;
    }),
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ level, message, timestamp, ...meta }) => {
          const metaStr = Object.keys(meta).length
            ? ' ' + JSON.stringify(meta)
            : '';
          return `${timestamp} ${level}: ${message}${metaStr}`;
        }),
      ),
    }),
    new winston.transports.File({
      filename: path.join(logDir, 'core.log'),
      maxsize: 5 * 1024 * 1024,
      maxFiles: 5,
      tailable: true,
    }),
    new winston.transports.File({
      level: 'error',
      filename: path.join(logDir, 'error.log'),
      maxsize: 5 * 1024 * 1024,
      maxFiles: 3,
      tailable: true,
    }),
  ],
});

export function requestLogFields(req: import('express').Request) {
  return {
    method: req.method,
    path: req.path,
  };
}
