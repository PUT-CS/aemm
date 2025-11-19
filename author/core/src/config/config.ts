import dotenv from 'dotenv';
import path from 'node:path';

dotenv.config();

interface Config {
  port: number;
  nodeEnv: string;
  contentRoot: string;
  databasePath: string;
}

const defaultDatabasePath = path.resolve(
  process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'core.sqlite'),
);

const config: Config = {
  port: Number(process.env.PORT) || 4501,
  nodeEnv: process.env.NODE_ENV || 'development',
  contentRoot: process.env.CONTENT_ROOT || './content',
  databasePath: defaultDatabasePath,
};

export default config;
