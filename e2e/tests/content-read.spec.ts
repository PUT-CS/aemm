import { expect, test } from '../fixtures';

interface TreeNode {
  name: string;
  type: string;
  children?: TreeNode[];
}

test.describe('GET /scrtree', () => {
  test('returns seed content as a tree', async ({ anonymous }) => {
    const response = await anonymous.content.tree();

    expect(response.status()).toBe(200);
    const root: TreeNode = await response.json();
    const site = root.children!.find((node) => node.name === 'testsite')!;
    expect(site.type).toBe('aemm:site');
    expect(site.children!.map((node) => node.name).sort()).toEqual([
      'en',
      'static',
    ]);
  });

  test('lists files but not .content.json', async ({ anonymous }) => {
    const root: TreeNode = await (await anonymous.content.tree()).json();

    const site = root.children!.find((node) => node.name === 'testsite')!;
    const staticFolder = site.children!.find((node) => node.name === 'static')!;
    expect(staticFolder.children).toEqual([
      expect.objectContaining({ name: 'hello.txt', type: 'aemm:file' }),
    ]);
  });

  test('uses content paths as file ids', async ({ anonymous }) => {
    const response = await anonymous.content.tree();
    const root: TreeNode = await response.json();

    const site = root.children!.find((node) => node.name === 'testsite')!;
    const staticFolder = site.children!.find((node) => node.name === 'static')!;
    expect(staticFolder.children![0]).toMatchObject({
      id: '/testsite/static/hello.txt',
    });
    expect(await response.text()).not.toContain('/app/content');
  });
});

test.describe('GET /scr', () => {
  test('returns site', async ({ anonymous }) => {
    const response = await anonymous.content.get('/testsite');

    expect(response.status()).toBe(200);
    expect(await response.json()).toMatchObject({
      type: 'aemm:site',
      name: 'testsite',
      title: 'Test Site',
    });
  });

  test('returns page with components', async ({ anonymous }) => {
    const response = await anonymous.content.get('/testsite/en/about');

    expect(response.status()).toBe(200);
    const page = await response.json();
    expect(page).toMatchObject({
      type: 'aemm:page',
      name: 'about',
      title: 'About',
      id: '9e8d7c6b-5a49-4382-a1b0-c9d8e7f6a504',
    });
    expect(page.components).toEqual([
      expect.objectContaining({ type: 'Heading', props: { text: 'About us' } }),
    ]);
  });

  test('returns file as plain text', async ({ anonymous }) => {
    const response = await anonymous.content.get('/testsite/static/hello.txt');

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('text/plain');
    expect(await response.text()).toBe('hello from seed data\n');
  });

  test('returns 404 for missing node', async ({ anonymous }) => {
    const response = await anonymous.content.get('/testsite/en/missing');

    expect(response.status()).toBe(404);
  });
});
