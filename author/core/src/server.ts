import app from './app';
import config from './config/config';
import { initDatabase, closeDatabase } from './db/sqliteClient';

async function start() {
  try {
    await initDatabase();

    const server = app.listen(config.port, () => {
      console.log(`Server running on port ${config.port}`);
    });

    const gracefulShutdown = async () => {
      console.log('Shutting down server...');
      server.close(async () => {
        await closeDatabase();
        process.exit(0);
      });
    };

    process.on('SIGINT', gracefulShutdown);
    process.on('SIGTERM', gracefulShutdown);
  } catch (error) {
    console.error('Failed to start server', error);
    process.exit(1);
  }
}

void start();
