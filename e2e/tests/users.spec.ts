import { expect, test } from '../fixtures';
import { newUser, type NewUser } from '../data/factory';

test.describe('GET /users', () => {
  test('lists users without password hashes', async ({ admin }) => {
    const response = await admin.users.list();

    expect(response.status()).toBe(200);
    const users = await response.json();
    expect(users).toContainEqual(
      expect.objectContaining({ username: 'admin', role: 'admin' }),
    );
    for (const user of users) {
      expect(user).not.toHaveProperty('passwordHash');
    }
  });
});

test.describe('POST /users', () => {
  test('creates user that can log in', async ({ admin, request }) => {
    const user = newUser();

    const response = await admin.users.create(user);

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body).toEqual({
      id: expect.any(Number),
      username: user.username,
      role: 'editor',
      createdAt: expect.any(Number),
      updatedAt: expect.any(Number),
    });
    const login = await request.post('/login', {
      data: { username: user.username, password: user.password },
    });
    expect(login.status()).toBe(200);
  });

  test('rejects duplicate username', async ({ admin }) => {
    const user = newUser();
    await admin.users.create(user);

    const response = await admin.users.create(user);

    expect(response.status()).toBe(409);
  });

  for (const field of ['username', 'password', 'role'] as const) {
    test(`rejects user without ${field}`, async ({ admin }) => {
      const user: Partial<NewUser> = newUser();
      delete user[field];

      const response = await admin.users.create(user);

      expect(response.status()).toBe(400);
    });
  }
});

test('POST rejects password shorter than 6 characters', async ({ admin }) => {
  const response = await admin.users.create(newUser({ password: '12345' }));

  expect(response.status()).toBe(400);
});

test.describe('existing user', () => {
  let user: NewUser;

  test.beforeEach(async ({ admin }) => {
    user = newUser();
    expect((await admin.users.create(user)).status()).toBe(201);
  });

  test('GET returns user without password hash', async ({ admin }) => {
    const response = await admin.users.get(user.username);

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toMatchObject({ username: user.username, role: 'editor' });
    expect(body).not.toHaveProperty('passwordHash');
  });

  test('PATCH changes role', async ({ admin }) => {
    const response = await admin.users.update(user.username, {
      role: 'admin',
    });

    expect(response.status()).toBe(200);
    expect(await response.json()).toMatchObject({ role: 'admin' });
    expect(await (await admin.users.get(user.username)).json()).toMatchObject({
      role: 'admin',
    });
  });

  test('PATCH changes password', async ({ admin, request }) => {
    const response = await admin.users.update(user.username, {
      password: 'new-secret',
    });

    expect(response.status()).toBe(200);
    const oldLogin = await request.post('/login', {
      data: { username: user.username, password: user.password },
    });
    const newLogin = await request.post('/login', {
      data: { username: user.username, password: 'new-secret' },
    });
    expect(oldLogin.status()).toBe(401);
    expect(newLogin.status()).toBe(200);
  });

  for (const changes of [
    {},
    { password: '' },
    { password: '12345' },
    { role: 42 },
  ]) {
    test(`PATCH rejects ${JSON.stringify(changes)}`, async ({ admin }) => {
      const response = await admin.users.update(user.username, changes);

      expect(response.status()).toBe(400);
    });
  }

  test('DELETE removes user', async ({ admin }) => {
    const response = await admin.users.remove(user.username);

    expect(response.status()).toBe(204);
    expect((await admin.users.get(user.username)).status()).toBe(404);
  });
});

test.describe('missing user', () => {
  test('GET returns 404', async ({ admin }) => {
    expect((await admin.users.get('nobody')).status()).toBe(404);
  });

  test('PATCH returns 404', async ({ admin }) => {
    const response = await admin.users.update('nobody', { role: 'admin' });

    expect(response.status()).toBe(404);
  });

  test('DELETE returns 404', async ({ admin }) => {
    expect((await admin.users.remove('nobody')).status()).toBe(404);
  });
});

test.describe('access', () => {
  test('editor cannot manage users', async ({ admin, editor }) => {
    const target = newUser();
    await admin.users.create(target);

    expect((await editor.users.list()).status()).toBe(403);
    expect((await editor.users.get(target.username)).status()).toBe(403);
    expect((await editor.users.create(newUser())).status()).toBe(403);
    expect(
      (await editor.users.update(target.username, { role: 'admin' })).status(),
    ).toBe(403);
    expect((await editor.users.remove(target.username)).status()).toBe(403);
  });

  test('anonymous cannot manage users', async ({ anonymous }) => {
    expect((await anonymous.users.list()).status()).toBe(401);
    expect((await anonymous.users.create(newUser())).status()).toBe(401);
  });

  test('admin request without token is rejected', async ({ admin }) => {
    const response = await admin.users.list({ headers: {} });

    expect(response.status()).toBe(401);
  });
});
