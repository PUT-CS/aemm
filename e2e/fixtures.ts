import { expect, test as base, type APIRequestContext } from '@playwright/test';
import { AuthApi } from './api/AuthApi';
import { BackupApi } from './api/BackupApi';
import { ContentApi } from './api/ContentApi';
import { UsersApi } from './api/UsersApi';
import { newUser } from './data/factory';

export const ADMIN = { username: 'admin', password: 'admin123' };

export interface Api {
  context: APIRequestContext;
  backups: BackupApi;
  content: ContentApi;
  users: UsersApi;
}

type Credentials = { username: string; password: string };

function api(context: APIRequestContext): Api {
  return {
    context,
    backups: new BackupApi(context),
    content: new ContentApi(context),
    users: new UsersApi(context),
  };
}

export const test = base.extend<{
  newSession: () => Promise<Api>;
  loginAs: (credentials: Credentials) => Promise<Api>;
  anonymous: Api;
  admin: Api;
  editor: Api;
}>({
  newSession: async ({ playwright, baseURL }, use) => {
    const contexts: APIRequestContext[] = [];
    await use(async () => {
      const context = await playwright.request.newContext({ baseURL });
      contexts.push(context);
      return api(context);
    });
    await Promise.all(contexts.map((context) => context.dispose()));
  },
  loginAs: async ({ newSession }, use) => {
    await use(async (credentials) => {
      const session = await newSession();
      const response = await new AuthApi(session.context).login(credentials);
      expect(response.status()).toBe(200);
      return session;
    });
  },
  anonymous: async ({ newSession }, use) => {
    await use(await newSession());
  },
  admin: async ({ loginAs }, use) => {
    await use(await loginAs(ADMIN));
  },
  editor: async ({ admin, loginAs }, use) => {
    const user = newUser({ role: 'editor' });
    expect((await admin.users.create(user)).status()).toBe(201);
    await use(await loginAs(user));
  },
});

export { expect };
