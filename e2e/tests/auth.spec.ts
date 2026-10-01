import { ADMIN, expect, test, type Api } from '../fixtures';
import { newUser } from '../data/factory';

async function sessionToken(session: Api) {
  const { cookies } = await session.context.storageState();
  return cookies.find((cookie) => cookie.name === 'aemm_session')!.value;
}

test.describe('POST /login', () => {
  test('returns user without token', async ({ request }) => {
    const response = await request.post('/login', { data: ADMIN });

    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({
      user: { id: expect.any(Number), username: 'admin', role: 'admin' },
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

  test('rejects malformed JSON with a message', async ({ request }) => {
    const response = await request.post('/login', {
      headers: { 'Content-Type': 'application/json' },
      data: '{"username":',
    });

    expect(response.status()).toBe(400);
    expect((await response.json()).message).toEqual(expect.any(String));
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
  test('reject request without session', async ({ anonymous }) => {
    const response = await anonymous.content.remove('/testsite/missing');

    expect(response.status()).toBe(401);
    expect(await response.json()).toEqual({ message: 'Not logged in' });
  });

  test('ignore bearer token', async ({ admin, anonymous }) => {
    const response = await anonymous.users.list({
      headers: { Authorization: `Bearer ${await sessionToken(admin)}` },
    });

    expect(response.status()).toBe(401);
  });

  test('reject invalid session', async ({ anonymous }) => {
    const response = await anonymous.users.list({
      headers: { Cookie: 'aemm_session=not.a.token' },
    });

    expect(response.status()).toBe(401);
    expect(await response.json()).toEqual({ message: 'Invalid token' });
  });

  test('reject tampered session', async ({ admin, anonymous }) => {
    const [header, , signature] = (await sessionToken(admin)).split('.');
    const payload = Buffer.from(
      JSON.stringify({ id: 999, username: 'hacker', role: 'admin' }),
    ).toString('base64url');

    const response = await anonymous.users.list({
      headers: { Cookie: `aemm_session=${header}.${payload}.${signature}` },
    });

    expect(response.status()).toBe(401);
  });

  test('accept valid session', async ({ admin }) => {
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

test.describe('session of changed user', () => {
  test('is rejected after the user is deleted', async ({ admin, loginAs }) => {
    const user = newUser();
    await admin.users.create(user);
    const deleted = await loginAs(user);

    await admin.users.remove(user.username);

    expect((await deleted.users.list()).status()).toBe(401);
  });

  test('loses admin access after demotion', async ({ admin, loginAs }) => {
    const user = newUser({ role: 'admin' });
    await admin.users.create(user);
    const demoted = await loginAs(user);
    expect((await demoted.users.list()).status()).toBe(200);

    await admin.users.update(user.username, { role: 'editor' });

    expect((await demoted.users.list()).status()).toBe(403);
  });

  test('is rejected after a password change', async ({ admin, loginAs }) => {
    const user = newUser({ role: 'admin' });
    await admin.users.create(user);
    const old = await loginAs(user);

    await admin.users.update(user.username, { password: 'new-secret' });

    expect((await old.users.list()).status()).toBe(401);
    const fresh = await loginAs({ ...user, password: 'new-secret' });
    expect((await fresh.users.list()).status()).toBe(200);
  });

  test('keeps working after a role change', async ({ admin, loginAs }) => {
    const user = newUser();
    await admin.users.create(user);
    const promoted = await loginAs(user);

    await admin.users.update(user.username, { role: 'admin' });

    expect((await promoted.users.list()).status()).toBe(200);
  });

  test('is rejected when the user is recreated', async ({ admin, loginAs }) => {
    const user = newUser({ role: 'admin' });
    await admin.users.create(user);
    const old = await loginAs(user);

    await admin.users.remove(user.username);
    await admin.users.create(user);

    expect((await old.users.list()).status()).toBe(401);
  });
});
