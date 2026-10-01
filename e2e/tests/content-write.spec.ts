import { expect, test } from '../fixtures';
import { newPage, type NewPage } from '../data/factory';

const parent = '/testsite/en';

test.describe('PUT /scr', () => {
  test('creates page with id and timestamps', async ({ admin }) => {
    const page = newPage();

    const response = await admin.content.create(`${parent}/${page.name}`, page);

    expect(response.status()).toBe(201);
    const created = await response.json();
    expect(created).toMatchObject({
      ...page,
      id: expect.stringMatching(/^[0-9a-f-]{36}$/),
      createdAt: expect.any(Number),
      updatedAt: expect.any(Number),
    });
    const stored = await admin.content.get(`${parent}/${page.name}`);
    expect(await stored.json()).toEqual(created);
  });

  test('editor can create page', async ({ editor }) => {
    const page = newPage();

    const response = await editor.content.create(
      `${parent}/${page.name}`,
      page,
    );

    expect(response.status()).toBe(201);
  });

  test('rejects existing node', async ({ admin }) => {
    const response = await admin.content.create(`${parent}/about`, newPage());

    expect(response.status()).toBe(409);
  });

  for (const node of [{ name: 'x' }, { type: 'aemm:unknown', name: 'x' }]) {
    test(`rejects node ${JSON.stringify(node)}`, async ({ admin }) => {
      const path = `${parent}/${newPage().name}`;

      const response = await admin.content.create(path, node);

      expect(response.status()).toBe(400);
      expect((await admin.content.get(path)).status()).toBe(404);
    });
  }
});

test.describe('existing page', () => {
  let page: NewPage;
  let path: string;

  test.beforeEach(async ({ admin }) => {
    page = newPage();
    path = `${parent}/${page.name}`;
    expect((await admin.content.create(path, page)).status()).toBe(201);
  });

  test('PATCH updates page', async ({ admin }) => {
    const current = await (await admin.content.get(path)).json();

    const response = await admin.content.edit(path, {
      ...current,
      title: 'Changed',
    });

    expect(response.status()).toBe(200);
    const stored = await (await admin.content.get(path)).json();
    expect(stored.title).toBe('Changed');
    expect(stored.id).toBe(current.id);
    expect(stored.updatedAt).toBeGreaterThan(current.updatedAt);
  });

  test('PATCH renames page', async ({ admin }) => {
    const current = await (await admin.content.get(path)).json();
    const newName = `${page.name}-renamed`;

    const response = await admin.content.edit(path, {
      ...current,
      name: newName,
    });

    expect(response.status()).toBe(200);
    expect((await admin.content.get(path)).status()).toBe(404);
    const renamed = await admin.content.get(`${parent}/${newName}`);
    expect(await renamed.json()).toMatchObject({
      id: current.id,
      name: newName,
    });
  });

  test('PATCH rejects rename to existing name', async ({ admin }) => {
    const current = await (await admin.content.get(path)).json();

    const response = await admin.content.edit(path, {
      ...current,
      name: 'about',
    });

    expect(response.status()).toBe(409);
  });

  for (const name of ['../escaped', 'a/b', '..']) {
    test(`PATCH rejects name ${name}`, async ({ admin }) => {
      const current = await (await admin.content.get(path)).json();

      const response = await admin.content.edit(path, { ...current, name });

      expect(response.status()).toBe(400);
      expect((await admin.content.get(path)).status()).toBe(200);
    });
  }

  test('DELETE removes page', async ({ admin }) => {
    const response = await admin.content.remove(path);

    expect(response.status()).toBe(200);
    expect((await admin.content.get(path)).status()).toBe(404);
  });

  test('POST uploads file and overwrites it', async ({ admin }) => {
    const filePath = `${path}/notes.txt`;

    const created = await admin.content.upload(filePath, Buffer.from('one'));
    const updated = await admin.content.upload(filePath, Buffer.from('two'));

    expect(created.status()).toBe(201);
    expect(updated.status()).toBe(200);
    expect(await (await admin.content.get(filePath)).text()).toBe('two');
  });

  test('PATCH rejects file', async ({ admin }) => {
    const filePath = `${path}/notes.txt`;
    await admin.content.upload(filePath, Buffer.from('one'));

    const response = await admin.content.edit(filePath, newPage());

    expect(response.status()).toBe(400);
  });
});

test.describe('missing node', () => {
  test('PATCH returns 404', async ({ admin }) => {
    const response = await admin.content.edit(`${parent}/missing`, newPage());

    expect(response.status()).toBe(404);
  });

  test('DELETE returns 404', async ({ admin }) => {
    expect((await admin.content.remove(`${parent}/missing`)).status()).toBe(
      404,
    );
  });
});

test('DELETE content root is forbidden', async ({ admin }) => {
  const response = await admin.content.remove('/');

  expect(response.status()).toBe(403);
  expect((await admin.content.tree()).status()).toBe(200);
});
