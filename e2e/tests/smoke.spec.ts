import { expect, test } from '@playwright/test';

test('content tree is available', async ({ request }) => {
  const response = await request.get('/scrtree');

  expect(response.status()).toBe(200);
  expect(await response.json()).toHaveProperty('children');
});
