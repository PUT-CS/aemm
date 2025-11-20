import winston from 'winston';
import config from './config/config';
import path from 'node:path';
import fs from 'node:fs';

const logDir = path.resolve(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
  try {
    fs.mkdirSync(logDir, { recursive: true });
  } catch (err) {
    console.error(
      `Failed to create log directory at "${logDir}". Please check filesystem permissions.`,
      err,
    );
    process.exit(1);
  }
}

const level = config.nodeEnv === 'production' ? 'info' : 'debug';

const createFormatter = (uppercaseLevel = true) =>
  winston.format.printf(({ level, message, timestamp, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ' ' + JSON.stringify(meta) : '';
    const levelStr = uppercaseLevel ? level.toUpperCase() : level;
    return `${timestamp} ${levelStr}: ${message}${metaStr}`;
  });

export const logger = winston.createLogger({
  level,
  format: winston.format.combine(
    winston.format.timestamp(),
    createFormatter(true),
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        createFormatter(false),
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
