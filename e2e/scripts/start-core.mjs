import { cpSync, mkdirSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const e2eDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tmpDir = path.join(e2eDir, '.tmp');
const contentRoot = path.join(tmpDir, 'content');

rmSync(tmpDir, { recursive: true, force: true });
mkdirSync(tmpDir, { recursive: true });
cpSync(path.join(e2eDir, 'fixtures', 'content'), contentRoot, {
  recursive: true,
});

process.chdir(tmpDir);

process.env.PORT ??= '4599';
process.env.CONTENT_ROOT = contentRoot;
process.env.DATABASE_PATH = path.join(tmpDir, 'core.sqlite');
process.env.JWT_SECRET ??= 'e2e-secret';
process.env.BCRYPT_SALT_ROUNDS ??= '4';

await import(path.join(e2eDir, '..', 'author', 'core', 'dist', 'server.js'));
