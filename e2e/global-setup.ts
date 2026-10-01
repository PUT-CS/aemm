import { execSync } from 'node:child_process';

const compose = (args: string) =>
  execSync(`docker compose ${args}`, { cwd: __dirname, stdio: 'inherit' });

export default function globalSetup() {
  if (process.env.E2E_BASE_URL) {
    return;
  }

  compose('up --detach --build --force-recreate --wait');

  return () => compose('down');
}
