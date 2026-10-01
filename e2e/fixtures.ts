import {
  expect,
  request as playwrightRequest,
  test as base,
  type APIRequestContext,
} from '@playwright/test';
import { AuthApi } from './api/AuthApi';
import { BackupApi } from './api/BackupApi';
import { ContentApi } from './api/ContentApi';
import { UsersApi } from './api/UsersApi';
import { newUser } from './data/factory';

export const ADMIN = { username: 'admin', password: 'admin123' };

export interface Api {
  token?: string;
  backups: BackupApi;
  content: ContentApi;
  users: UsersApi;
}

function api(request: APIRequestContext, token?: string): Api {
  return {
    token,
    backups: new BackupApi(request, token),
    content: new ContentApi(request, token),
    users: new UsersApi(request, token),
  };
}

async function login(
  baseURL: string | undefined,
  credentials: { username: string; password: string },
) {
  const context = await playwrightRequest.newContext({ baseURL });
  const response = await new AuthApi(context).login(credentials);
  expect(response.status()).toBe(200);
  const token = (await response.json()).token as string;
  await context.dispose();
  return token;
}

export const test = base.extend<{ anonymous: Api; admin: Api; editor: Api }>({
  anonymous: async ({ request }, use) => {
    await use(api(request));
  },
  admin: async ({ request, baseURL }, use) => {
    await use(api(request, await login(baseURL, ADMIN)));
  },
  editor: async ({ request, admin, baseURL }, use) => {
    const user = newUser({ role: 'editor' });
    expect((await admin.users.create(user)).status()).toBe(201);
    await use(api(request, await login(baseURL, user)));
  },
});

export { expect };
