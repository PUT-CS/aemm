import { expect, test as base, type APIRequestContext } from '@playwright/test';
import { AuthApi } from './api/AuthApi';
import { UsersApi } from './api/UsersApi';
import { newUser } from './data/factory';

export const ADMIN = { username: 'admin', password: 'admin123' };

export interface Api {
  token?: string;
  users: UsersApi;
}

function api(request: APIRequestContext, token?: string): Api {
  return {
    token,
    users: new UsersApi(request, token),
  };
}

async function login(
  request: APIRequestContext,
  credentials: { username: string; password: string },
) {
  const response = await new AuthApi(request).login(credentials);
  expect(response.status()).toBe(200);
  return (await response.json()).token as string;
}

export const test = base.extend<{ anonymous: Api; admin: Api; editor: Api }>({
  anonymous: async ({ request }, use) => {
    await use(api(request));
  },
  admin: async ({ request }, use) => {
    await use(api(request, await login(request, ADMIN)));
  },
  editor: async ({ request, admin }, use) => {
    const user = newUser({ role: 'editor' });
    expect((await admin.users.create(user)).status()).toBe(201);
    await use(api(request, await login(request, user)));
  },
});

export { expect };
