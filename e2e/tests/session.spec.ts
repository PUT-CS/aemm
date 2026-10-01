import type { APIRequestContext } from '@playwright/test';
import { ADMIN, expect, test } from '../fixtures';
import { newPage } from '../data/factory';

const CSRF = { 'X-AEMM-Request': '1' };

test.describe('cookie session', () => {
  let session: APIRequestContext;

  test.beforeEach(async ({ playwright, baseURL }) => {
    session = await playwright.request.newContext({ baseURL });
  });

  test.afterEach(async () => {
    await session.dispose();
  });

  test('login sets an HttpOnly SameSite=Strict cookie', async () => {
    const response = await session.post('/login', { data: ADMIN });

    const cookie = response.headers()['set-cookie'];
    expect(cookie).toMatch(/^aemm_session=/);
    expect(cookie).toContain('HttpOnly');
    expect(cookie).toContain('SameSite=Strict');
  });

  test('GET /me returns the logged in user', async () => {
    await session.post('/login', { data: ADMIN });

    const response = await session.get('/me');

    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({
      id: expect.any(Number),
      username: 'admin',
      role: 'admin',
    });
  });

  test('GET /me without session returns 401', async () => {
    expect((await session.get('/me')).status()).toBe(401);
  });

  test('changes need the X-AEMM-Request header', async () => {
    await session.post('/login', { data: ADMIN });
    const page = newPage();
    const path = `/scr/testsite/en/${page.name}`;

    const withoutHeader = await session.put(path, { data: page });
    const withHeader = await session.put(path, { data: page, headers: CSRF });

    expect(withoutHeader.status()).toBe(403);
    expect(withHeader.status()).toBe(201);
  });

  test('reads do not need the header', async () => {
    await session.post('/login', { data: ADMIN });

    expect((await session.get('/users')).status()).toBe(200);
  });

  test('logout clears the session', async () => {
    await session.post('/login', { data: ADMIN });

    const response = await session.post('/logout');

    expect(response.status()).toBe(204);
    expect((await session.get('/me')).status()).toBe(401);
  });
});
