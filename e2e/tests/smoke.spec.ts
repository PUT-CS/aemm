import { expect, test } from '@playwright/test';

test('serves fixture content', async ({ request }) => {
  const response = await request.get('/scrtree');

  expect(response.status()).toBe(200);
  const tree = await response.json();
  expect(tree.children.map((node: { name: string }) => node.name)).toEqual([
    'testsite',
  ]);
});
