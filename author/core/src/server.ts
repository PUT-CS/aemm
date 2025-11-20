import app from './app';
import config from './config/config';
import { initDatabase, closeDatabase } from './db/sqliteClient';
import { logger } from './logger';

async function start() {
  try {
    await initDatabase();
    logger.info('Database initialized', { databasePath: config.databasePath });

    const server = app.listen(config.port, () => {
      logger.info(`Server running`, { port: config.port, env: config.nodeEnv });
    });

    const gracefulShutdown = async () => {
      logger.warn('Graceful shutdown initiated');
      server.close(async () => {
        await closeDatabase();
        logger.info('Database connection closed');
        process.exit(0);
      });
    };

    process.on('SIGINT', gracefulShutdown);
    process.on('SIGTERM', gracefulShutdown);
  } catch (error) {
    logger.error('Failed to start server', { error: (error as Error).message });
    process.exit(1);
  }
}

void start();
