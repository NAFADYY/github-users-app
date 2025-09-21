// __tests__/ghFetch.test.js
import { jest } from '@jest/globals';   // ← المهم هنا
import { ghFetch } from '../src/utils/ghFetch.js';

beforeEach(() => {
  global.fetch = jest.fn();
});

afterEach(() => {
  jest.clearAllMocks();
});

test('ghFetch returns json', async () => {
  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ ok: 1 }),
  });

  const data = await ghFetch('https://api.github.com/users');
  expect(data).toEqual({ ok: 1 });
  expect(global.fetch).toHaveBeenCalledTimes(1);
  expect(global.fetch).toHaveBeenCalledWith(
    'https://api.github.com/users',
    expect.any(Object)
  );
});

test('ghFetch throws on !ok', async () => {
  global.fetch.mockResolvedValueOnce({
    ok: false,
    status: 403,
    text: async () => 'forbidden',
  });

  await expect(ghFetch('https://api.github.com/users')).rejects.toThrow(/403|forbidden/i);
  expect(global.fetch).toHaveBeenCalledTimes(1);
});
