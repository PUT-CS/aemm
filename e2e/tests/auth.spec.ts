import { ADMIN, expect, test } from '../fixtures';

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
