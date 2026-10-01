import { expect, test } from '../fixtures';

const preflight = (origin: string) => ({
  headers: {
    Origin: origin,
    'Access-Control-Request-Method': 'PATCH',
    'Access-Control-Request-Headers': 'authorization,content-type',
  },
});

test.describe('CORS', () => {
  for (const origin of ['http://ui.test', 'http://other-ui.test']) {
    test(`allows ${origin}`, async ({ request }) => {
      const response = await request.fetch('/scr/testsite', {
        method: 'OPTIONS',
        ...preflight(origin),
      });

      expect(response.status()).toBe(204);
      expect(response.headers()['access-control-allow-origin']).toBe(origin);
    });
  }

  test('does not allow other origins', async ({ request }) => {
    const response = await request.fetch('/scr/testsite', {
      method: 'OPTIONS',
      ...preflight('http://evil.test'),
    });

    expect(response.headers()['access-control-allow-origin']).toBeUndefined();
  });

  test('does not allow other origins on simple requests', async ({
    request,
  }) => {
    const response = await request.get('/scrtree', {
      headers: { Origin: 'http://evil.test' },
    });

    expect(response.status()).toBe(200);
    expect(response.headers()['access-control-allow-origin']).toBeUndefined();
  });
});
