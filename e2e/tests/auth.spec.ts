import { ADMIN, expect, test } from '../fixtures';
import { UsersApi } from '../api/UsersApi';
import { newUser } from '../data/factory';

test.describe('POST /login', () => {
  test('returns token and user for valid credentials', async ({ request }) => {
    const response = await request.post('/login', { data: ADMIN });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.token).toEqual(expect.any(String));
    expect(body.user).toEqual({
      id: expect.any(Number),
      username: 'admin',
      role: 'admin',
    });
  });

  test('rejects wrong password', async ({ request }) => {
    const response = await request.post('/login', {
      data: { username: ADMIN.username, password: 'wrong' },
    });

    expect(response.status()).toBe(401);
    expect(await response.json()).toEqual({ message: 'Invalid credentials' });
  });

  test('rejects unknown user', async ({ request }) => {
    const response = await request.post('/login', {
      data: { username: 'nobody', password: 'whatever' },
    });

    expect(response.status()).toBe(401);
    expect(await response.json()).toEqual({ message: 'Invalid credentials' });
  });

  for (const data of [{}, { username: 'admin' }, { password: 'admin123' }]) {
    test(`rejects body ${JSON.stringify(data)}`, async ({ request }) => {
      const response = await request.post('/login', { data });

      expect(response.status()).toBe(400);
    });
  }
});

test.describe('failed logins', () => {
  test('lock out after 5 wrong passwords', async ({ admin, request }) => {
    const user = newUser();
    await admin.users.create(user);
    const wrong = { username: user.username, password: 'wrong' };

    for (let i = 0; i < 5; i++) {
      expect((await request.post('/login', { data: wrong })).status()).toBe(
        401,
      );
    }
    const response = await request.post('/login', { data: user });

    expect(response.status()).toBe(429);
    expect(Number(response.headers()['retry-after'])).toBeGreaterThan(0);
  });

  test('do not lock out other users', async ({ request }) => {
    const wrong = { username: `nobody-${Date.now()}`, password: 'wrong' };
    for (let i = 0; i < 5; i++) {
      await request.post('/login', { data: wrong });
    }

    expect((await request.post('/login', { data: ADMIN })).status()).toBe(200);
  });

  test('reset after a successful login', async ({ admin, request }) => {
    const user = newUser();
    await admin.users.create(user);
    const wrong = { username: user.username, password: 'wrong' };

    for (let i = 0; i < 4; i++) {
      await request.post('/login', { data: wrong });
    }
    expect((await request.post('/login', { data: user })).status()).toBe(200);
    for (let i = 0; i < 4; i++) {
      await request.post('/login', { data: wrong });
    }

    expect((await request.post('/login', { data: user })).status()).toBe(200);
  });
});

test.describe('protected endpoints', () => {
  test('reject request without token', async ({ request }) => {
    const response = await request.delete('/scr/testsite/missing');

    expect(response.status()).toBe(401);
    expect(await response.json()).toEqual({
      message: 'Missing Authorization header',
    });
  });

  test('reject non bearer authorization', async ({ request }) => {
    const response = await request.get('/users', {
      headers: { Authorization: 'Basic YWRtaW46YWRtaW4xMjM=' },
    });

    expect(response.status()).toBe(401);
  });

  test('reject invalid token', async ({ request }) => {
    const response = await request.get('/users', {
      headers: { Authorization: 'Bearer not.a.token' },
    });

    expect(response.status()).toBe(401);
    expect(await response.json()).toEqual({ message: 'Invalid token' });
  });

  test('reject tampered token', async ({ request, admin }) => {
    const [header, , signature] = admin.token!.split('.');
    const payload = Buffer.from(
      JSON.stringify({ id: 999, username: 'hacker', role: 'admin' }),
    ).toString('base64url');

    const response = await request.get('/users', {
      headers: { Authorization: `Bearer ${header}.${payload}.${signature}` },
    });

    expect(response.status()).toBe(401);
  });

  test('accept valid token', async ({ admin }) => {
    const response = await admin.users.list();

    expect(response.status()).toBe(200);
  });

  test('keep content reads public', async ({ request }) => {
    expect((await request.get('/scrtree')).status()).toBe(200);
    expect((await request.get('/scr/testsite/en/about')).status()).toBe(200);
  });
});

test.describe('admin only endpoints', () => {
  test('reject editor', async ({ editor }) => {
    const response = await editor.users.list();

    expect(response.status()).toBe(403);
  });

  test('public registration is gone', async ({ request }) => {
    const response = await request.post('/register', {
      data: { username: 'someone', password: 'secret', role: 'admin' },
    });

    expect(response.status()).toBe(404);
  });
});

test.describe('token of changed user', () => {
  test('is rejected after the user is deleted', async ({ admin, request }) => {
    const user = newUser();
    await admin.users.create(user);
    const login = await request.post('/login', { data: user });
    const deleted = new UsersApi(request, (await login.json()).token);

    await admin.users.remove(user.username);

    expect((await deleted.list()).status()).toBe(401);
  });

  test('loses admin access after demotion', async ({ admin, request }) => {
    const user = newUser({ role: 'admin' });
    await admin.users.create(user);
    const login = await request.post('/login', { data: user });
    const demoted = new UsersApi(request, (await login.json()).token);
    expect((await demoted.list()).status()).toBe(200);

    await admin.users.update(user.username, { role: 'editor' });

    expect((await demoted.list()).status()).toBe(403);
  });

  test('is rejected after a password change', async ({ admin, request }) => {
    const user = newUser({ role: 'admin' });
    await admin.users.create(user);
    const login = await request.post('/login', { data: user });
    const old = new UsersApi(request, (await login.json()).token);

    await admin.users.update(user.username, { password: 'new-secret' });

    expect((await old.list()).status()).toBe(401);
    const relogin = await request.post('/login', {
      data: { username: user.username, password: 'new-secret' },
    });
    const fresh = new UsersApi(request, (await relogin.json()).token);
    expect((await fresh.list()).status()).toBe(200);
  });

  test('keeps working after a role change', async ({ admin, request }) => {
    const user = newUser();
    await admin.users.create(user);
    const login = await request.post('/login', { data: user });
    const promoted = new UsersApi(request, (await login.json()).token);

    await admin.users.update(user.username, { role: 'admin' });

    expect((await promoted.list()).status()).toBe(200);
  });

  test('is rejected when the user is recreated', async ({ admin, request }) => {
    const user = newUser({ role: 'admin' });
    await admin.users.create(user);
    const login = await request.post('/login', { data: user });
    const old = new UsersApi(request, (await login.json()).token);

    await admin.users.remove(user.username);
    await admin.users.create(user);

    expect((await old.list()).status()).toBe(401);
  });
});
