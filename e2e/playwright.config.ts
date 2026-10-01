import { defineConfig } from '@playwright/test';

const port = process.env.E2E_PORT ?? '4599';
const externalBaseURL = process.env.E2E_BASE_URL;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: externalBaseURL ?? `http://localhost:${port}`,
    extraHTTPHeaders: {
      Accept: 'application/json',
    },
  },
  webServer: externalBaseURL
    ? undefined
    : {
        command:
          'npm --prefix ../author/core run build && node scripts/start-core.mjs',
        url: `http://localhost:${port}/scrtree`,
        env: { PORT: port },
        reuseExistingServer: false,
        timeout: 60_000,
        stdout: 'ignore',
        stderr: 'pipe',
      },
});
