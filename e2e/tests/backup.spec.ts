import { expect, test, type Api } from '../fixtures';
import { newPage } from '../data/factory';

async function editTitle(api: Api, path: string, title: string) {
  const current = await (await api.content.get(path)).json();
  const response = await api.content.edit(path, { ...current, title });
  expect(response.status()).toBe(200);
  return current;
}

async function backups(api: Api, path: string): Promise<string[]> {
  const response = await api.backups.list(path);
  expect(response.status()).toBe(200);
  return (await response.json()).backups.sort();
}

test.describe('backups', () => {
  let path: string;

  test.beforeEach(async ({ admin }) => {
    const page = newPage({ title: 'v1' });
    path = `/testsite/en/${page.name}`;
    expect((await admin.content.create(path, page)).status()).toBe(201);
  });

  test('new page has no backups', async ({ admin }) => {
    expect(await backups(admin, path)).toEqual([]);
  });

  test('edit backs up previous version', async ({ admin, anonymous }) => {
    const v1 = await editTitle(admin, path, 'v2');

    expect(await backups(admin, path)).toEqual([
      `.content-${v1.updatedAt}.json`,
    ]);
    const backup = await anonymous.content.get(
      `${path}/.content-${v1.updatedAt}.json`,
    );
    expect(JSON.parse(await backup.text())).toMatchObject({ title: 'v1' });
  });

  test('every edit adds a backup', async ({ admin }) => {
    const v1 = await editTitle(admin, path, 'v2');
    const v2 = await editTitle(admin, path, 'v3');

    expect(await backups(admin, path)).toEqual([
      `.content-${v1.updatedAt}.json`,
      `.content-${v2.updatedAt}.json`,
    ]);
  });

  test('restore brings back backed up version', async ({ admin }) => {
    const v1 = await editTitle(admin, path, 'v2');

    const response = await admin.backups.restore(
      path,
      `.content-${v1.updatedAt}.json`,
    );

    expect(response.status()).toBe(200);
    expect(await (await admin.content.get(path)).json()).toMatchObject({
      title: 'v1',
    });
  });

  test('restore keeps current version as backup', async ({ admin }) => {
    const v1 = await editTitle(admin, path, 'v2');
    const v2 = await (await admin.content.get(path)).json();

    await admin.backups.restore(path, `.content-${v1.updatedAt}.json`);

    expect(await backups(admin, path)).toEqual([
      `.content-${v2.updatedAt}.json`,
    ]);
    const backup = await admin.content.get(
      `${path}/.content-${v2.updatedAt}.json`,
    );
    expect(JSON.parse(await backup.text())).toMatchObject({ title: 'v2' });
  });

  test('restore rejects file that is not a backup', async ({ admin }) => {
    const response = await admin.backups.restore(path, '.content.json');

    expect(response.status()).toBe(400);
  });

  test('restore returns 404 for missing backup', async ({ admin }) => {
    const response = await admin.backups.restore(path, '.content-1.json');

    expect(response.status()).toBe(404);
  });

  test('editor can use backups', async ({ editor }) => {
    await editTitle(editor, path, 'v2');

    expect(await backups(editor, path)).toHaveLength(1);
  });

  test('anonymous cannot use backups', async ({ anonymous }) => {
    expect((await anonymous.backups.list(path)).status()).toBe(401);
    expect(
      (await anonymous.backups.restore(path, '.content-1.json')).status(),
    ).toBe(401);
  });
});
