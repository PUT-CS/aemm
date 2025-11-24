import app from './app';
import config from './config/config';
import { Db } from './db/db';
import { logger } from './logger';

async function start() {
  try {
    await Db.init();

    const server = app.listen(config.port, () => {
      logger.info(`Server running`, { port: config.port, env: config.nodeEnv });
    });

    const gracefulShutdown = async () => {
      logger.warn('Graceful shutdown initiated');
      server.close(async () => {
        await Db.close();
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
